import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AppModel from '@/models/App';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@clerk/nextjs/server';

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const apps = await AppModel.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: apps });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    // Generate a unique API Key
    const apiKey = `pk_live_${uuidv4().replace(/-/g, '')}`;

    const newApp = await AppModel.create({
      userId,
      name: body.name,
      apiKey: apiKey,
    });

    return NextResponse.json({ success: true, data: newApp }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
