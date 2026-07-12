import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AppModel from '@/models/App';
import DeviceModel from '@/models/Device';
import NotificationLogModel from '@/models/NotificationLog';
import ScheduledNotificationModel from '@/models/ScheduledNotification';

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { decrypt } from '@/lib/crypto';

export async function POST(request) {
  try {
    await dbConnect();
    
    // 1. Authenticate via API Key
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Missing API Key' }, { status: 401 });
    }

    const app = await AppModel.findOne({ apiKey });
    if (!app) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });
    }

    // 2. Check Firebase Credentials
    if (!app.firebaseCredentials || !app.firebaseCredentials.projectId) {
      return NextResponse.json({ success: false, error: 'Error: La aplicación no tiene conectada una cuenta de Firebase.' }, { status: 400 });
    }

    // 3. Parse payload
    const body = await request.json();
    const { senderId, receiverId, title, message: bodyMessage, data, scheduledFor } = body;

    if (!title || !bodyMessage) {
      return NextResponse.json({ success: false, error: 'Missing title or message' }, { status: 400 });
    }

    // 4. Handle Scheduled Notifications
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      if (isNaN(scheduledDate.getTime())) {
        return NextResponse.json({ success: false, error: 'Invalid scheduledFor date format' }, { status: 400 });
      }

      const scheduledLog = await ScheduledNotificationModel.create({
        appId: app._id,
        senderId: senderId || 'system',
        receiverId: receiverId || null,
        title,
        body: bodyMessage,
        data: data || {},
        scheduledFor: scheduledDate,
        status: 'pending'
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Notification scheduled successfully', 
        scheduledId: scheduledLog._id 
      }, { status: 200 });
    }

    // 5. Send Immediately
    let pushTokens = [];
    if (receiverId) {
      const device = await DeviceModel.findOne({ appId: app._id, userId: receiverId });
      if (device && device.pushToken) pushTokens.push(device.pushToken);
    } else {
      const devices = await DeviceModel.find({ appId: app._id });
      pushTokens = devices.map(d => d.pushToken).filter(Boolean);
    }

    if (pushTokens.length === 0) {
      await NotificationLogModel.create({
        appId: app._id,
        senderId: senderId || 'system',
        receiverId: receiverId || 'ALL',
        title,
        body: bodyMessage,
        status: 'failed',
        error: 'No push tokens found'
      });
      return NextResponse.json({ success: false, error: 'No devices found to send notification' }, { status: 404 });
    }

    let fcmResponse = null;
    let pushError = null;

    // 6. Dynamic Firebase Initialization (Multi-Tenant)
    const appName = app._id.toString();
    let firebaseApp = getApps().find(a => a.name === appName);
    
    if (!firebaseApp) {
      try {
        const decryptedKey = decrypt(app.firebaseCredentials.privateKey);
        firebaseApp = initializeApp({
          credential: cert({
            projectId: app.firebaseCredentials.projectId,
            clientEmail: app.firebaseCredentials.clientEmail,
            privateKey: decryptedKey.replace(/\\n/g, '\n'),
          })
        }, appName);
      } catch (err) {
        console.error('Error in Firebase Init:', err);
        pushError = 'Error desencriptando o inicializando Firebase para este cliente.';
      }
    }
    
    if (firebaseApp) {
      const messagePayload = {
        notification: {
          title: title,
          body: bodyMessage,
        },
        tokens: pushTokens,
      };
      
      if (data) {
        messagePayload.data = typeof data === 'object' ? 
          Object.fromEntries(Object.entries(data).map(([k,v]) => [k, String(v)])) : data;
      }

      try {
        const messaging = getMessaging(firebaseApp);
        fcmResponse = await messaging.sendEachForMulticast(messagePayload);
      } catch (err) {
        pushError = err.message;
      }
    }

    // 5. Log the result
    const log = await NotificationLogModel.create({
      appId: app._id,
      senderId: senderId || 'system',
      receiverId: receiverId || 'ALL',
      title,
      body: bodyMessage,
      status: pushError ? 'failed' : 'sent',
      error: pushError
    });

    if (pushError) {
      return NextResponse.json({ success: false, error: pushError, log }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      successCount: fcmResponse?.successCount, 
      failureCount: fcmResponse?.failureCount, 
      log 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
