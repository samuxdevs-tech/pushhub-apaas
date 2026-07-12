import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ScheduledNotificationModel from '@/models/ScheduledNotification';
import DeviceModel from '@/models/Device';
import NotificationLogModel from '@/models/NotificationLog';

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { decrypt } from '@/lib/crypto';
import AppModel from '@/models/App';

// We can accept GET or POST from the cron job service
export async function GET(request) {
  return handleCron(request);
}

export async function POST(request) {
  return handleCron(request);
}

async function handleCron(request) {
  try {
    // 1. Verify CRON_SECRET to protect the endpoint
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret') || request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid CRON_SECRET' }, { status: 401 });
    }

    await dbConnect();
    
    // 2. Find pending notifications where scheduledFor is past or current time
    const now = new Date();
    const pendingNotifications = await ScheduledNotificationModel.find({
      status: 'pending',
      scheduledFor: { $lte: now }
    });

    if (pendingNotifications.length === 0) {
      return NextResponse.json({ success: true, message: 'No pending scheduled notifications' }, { status: 200 });
    }

    let results = [];

    // 3. Process each notification
    for (const notif of pendingNotifications) {
      let pushTokens = [];

      if (notif.receiverId) {
        // Send to specific user
        const device = await DeviceModel.findOne({ appId: notif.appId, userId: notif.receiverId });
        if (device && device.pushToken) pushTokens.push(device.pushToken);
      } else {
        // Broadcast
        const devices = await DeviceModel.find({ appId: notif.appId });
        pushTokens = devices.map(d => d.pushToken).filter(Boolean);
      }

      if (pushTokens.length === 0) {
        notif.status = 'failed';
        notif.error = 'No devices found';
        await notif.save();
        
        await NotificationLogModel.create({
          appId: notif.appId,
          senderId: notif.senderId,
          receiverId: notif.receiverId || 'ALL',
          title: notif.title,
          body: notif.body,
          status: 'failed',
          error: 'Scheduled push failed: No devices found'
        });
        
        results.push({ id: notif._id, status: 'failed', reason: 'No devices' });
        continue;
      }

      let pushError = null;
      let fcmResponse = null;

      // Dynamic Firebase Initialization (Multi-Tenant)
      const appRecord = await AppModel.findById(notif.appId);
      if (!appRecord || !appRecord.firebaseCredentials || !appRecord.firebaseCredentials.projectId) {
        pushError = 'La aplicación no tiene configuradas sus credenciales de Firebase.';
      } else {
        const appName = appRecord._id.toString();
        let firebaseApp = getApps().find(a => a.name === appName);
        
        if (!firebaseApp) {
          try {
            const decryptedKey = decrypt(appRecord.firebaseCredentials.privateKey);
            firebaseApp = initializeApp({
              credential: cert({
                projectId: appRecord.firebaseCredentials.projectId,
                clientEmail: appRecord.firebaseCredentials.clientEmail,
                privateKey: decryptedKey.replace(/\\n/g, '\n'),
              })
            }, appName);
          } catch (err) {
            console.error('Error in Cron Firebase Init:', err);
            pushError = 'Error desencriptando o inicializando Firebase para este cliente.';
          }
        }

        if (firebaseApp) {
          const messagePayload = {
            notification: {
              title: notif.title,
              body: notif.body,
            },
            tokens: pushTokens,
          };
          
          if (notif.data) {
            messagePayload.data = typeof notif.data === 'object' ? 
              Object.fromEntries(Object.entries(notif.data).map(([k,v]) => [k, String(v)])) : notif.data;
          }

          try {
            const messaging = getMessaging(firebaseApp);
            fcmResponse = await messaging.sendEachForMulticast(messagePayload);
          } catch (err) {
            pushError = err.message;
          }
        }
      }

      // Update Scheduled Notification status
      notif.status = pushError ? 'failed' : 'sent';
      notif.error = pushError;
      await notif.save();

      // Create standard log
      await NotificationLogModel.create({
        appId: notif.appId,
        senderId: notif.senderId,
        receiverId: notif.receiverId || 'ALL',
        title: notif.title,
        body: notif.body,
        status: pushError ? 'failed' : 'sent',
        error: pushError,
      });

      results.push({ id: notif._id, status: notif.status, pushError });
    }

    return NextResponse.json({ success: true, processed: results.length, results }, { status: 200 });

  } catch (error) {
    console.error('Cron Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
