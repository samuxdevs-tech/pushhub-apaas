import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AppModel from '@/models/App';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
  try {
    await dbConnect();
    const apps = await AppModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: apps });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    // Generate a unique API Key
    const apiKey = `pk_live_${uuidv4().replace(/-/g, '')}`;

    const newApp = await AppModel.create({
      name: body.name,
      apiKey: apiKey,
    });

    return NextResponse.json({ success: true, data: newApp }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
