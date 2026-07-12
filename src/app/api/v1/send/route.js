import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AppModel from '@/models/App';
import DeviceModel from '@/models/Device';
import NotificationLogModel from '@/models/NotificationLog';
import ScheduledNotificationModel from '@/models/ScheduledNotification';

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin only once
if (!getApps().length) {
  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountStr) {
      const serviceAccount = JSON.parse(serviceAccountStr);
      initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

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

    // 2. Parse payload
    const body = await request.json();
    const { senderId, receiverId, title, message: bodyMessage, data, scheduledFor } = body;

    if (!title || !bodyMessage) {
      return NextResponse.json({ success: false, error: 'Missing title or message' }, { status: 400 });
    }

    // 3. Handle Scheduled Notifications
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      if (isNaN(scheduledDate.getTime())) {
        return NextResponse.json({ success: false, error: 'Invalid scheduledFor date format' }, { status: 400 });
      }

      const scheduledLog = await ScheduledNotificationModel.create({
        appId: app._id,
        senderId: senderId || 'system',
        receiverId: receiverId || null, // null means broadcast
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

    // 4. Send Immediately
    let pushTokens = [];
    if (receiverId) {
      // Send to specific user
      const device = await DeviceModel.findOne({ appId: app._id, userId: receiverId });
      if (device && device.pushToken) pushTokens.push(device.pushToken);
    } else {
      // Broadcast to all users
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
    
    if (getApps().length > 0) {
      const messagePayload = {
        notification: {
          title: title,
          body: bodyMessage,
        },
        tokens: pushTokens, // multicast array
      };
      
      if (data) {
        messagePayload.data = typeof data === 'object' ? 
          Object.fromEntries(Object.entries(data).map(([k,v]) => [k, String(v)])) : data;
      }

      try {
        fcmResponse = await getMessaging().sendEachForMulticast(messagePayload);
      } catch (err) {
        pushError = err.message;
      }
    } else {
      pushError = 'Firebase Admin not initialized (Missing Env Variable)';
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
