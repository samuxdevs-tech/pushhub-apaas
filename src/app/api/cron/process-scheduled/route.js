import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ScheduledNotificationModel from '@/models/ScheduledNotification';
import DeviceModel from '@/models/Device';
import NotificationLogModel from '@/models/NotificationLog';

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

      if (getApps().length > 0) {
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
          fcmResponse = await getMessaging().sendEachForMulticast(messagePayload);
        } catch (err) {
          pushError = err.message;
        }
      } else {
        pushError = 'Firebase Admin not initialized';
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
