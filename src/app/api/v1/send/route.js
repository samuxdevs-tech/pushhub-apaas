import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AppModel from '@/models/App';
import DeviceModel from '@/models/Device';
import NotificationLogModel from '@/models/NotificationLog';
import admin from 'firebase-admin';

// Initialize Firebase Admin only once
if (!admin?.apps?.length) {
  try {
    // In production, you would set FIREBASE_SERVICE_ACCOUNT in your Vercel env variables
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountStr) {
      const serviceAccount = JSON.parse(serviceAccountStr);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
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
    const { senderId, receiverId, title, message: bodyMessage, data } = body;

    if (!receiverId || !title || !bodyMessage) {
      return NextResponse.json({ success: false, error: 'Missing receiverId, title, or message' }, { status: 400 });
    }

    // 3. Find the receiver's push token
    const device = await DeviceModel.findOne({ appId: app._id, userId: receiverId });
    
    if (!device || !device.pushToken) {
      // Log failure
      await NotificationLogModel.create({
        appId: app._id,
        senderId,
        receiverId,
        title,
        body: bodyMessage,
        status: 'failed',
        error: 'Receiver token not found'
      });
      return NextResponse.json({ success: false, error: 'Receiver push token not found' }, { status: 404 });
    }

    // 4. Send Push Notification via Firebase Admin
    let fcmResponseId = null;
    let pushError = null;
    
    if (admin?.apps?.length > 0) {
      const messagePayload = {
        notification: {
          title: title,
          body: bodyMessage,
        },
        token: device.pushToken,
      };
      
      if (data) {
        messagePayload.data = typeof data === 'object' ? 
          Object.fromEntries(Object.entries(data).map(([k,v]) => [k, String(v)])) : data;
      }

      try {
        fcmResponseId = await admin.messaging().send(messagePayload);
      } catch (err) {
        pushError = err.message;
      }
    } else {
      pushError = 'Firebase Admin not initialized (Missing Env Variable)';
    }

    // 5. Log the result
    const log = await NotificationLogModel.create({
      appId: app._id,
      senderId,
      receiverId,
      title,
      body: bodyMessage,
      status: pushError ? 'failed' : 'sent',
      error: pushError
    });

    if (pushError) {
      return NextResponse.json({ success: false, error: pushError, log }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: fcmResponseId, log }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
