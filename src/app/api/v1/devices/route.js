import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AppModel from '@/models/App';
import DeviceModel from '@/models/Device';

export async function POST(request) {
  try {
    await dbConnect();
    
    // Authenticate via API Key in headers
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Missing API Key' }, { status: 401 });
    }

    const app = await AppModel.findOne({ apiKey });
    if (!app) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, pushToken } = body;

    if (!userId || !pushToken) {
      return NextResponse.json({ success: false, error: 'Missing userId or pushToken' }, { status: 400 });
    }

    // Update or create the device token for this user
    const device = await DeviceModel.findOneAndUpdate(
      { appId: app._id, userId: userId },
      { pushToken: pushToken, lastUpdated: Date.now() },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: device }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
