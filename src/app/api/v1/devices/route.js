import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AppModel from '@/models/App';
import DeviceModel from '@/models/Device';

export async function GET(request) {
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

    // 2. Parse pagination params
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip')) || 0;
    const limit = parseInt(searchParams.get('limit')) || 30;

    // 3. Fetch unique users
    // Since DeviceModel might have multiple devices per user, we need distinct users, 
    // but MongoDB `distinct` doesn't support skip/limit easily without aggregation.
    // Assuming 1 device per userId in this test setup, or we aggregate:
    
    const aggregationPipeline = [
      { $match: { appId: app._id } },
      { $group: { _id: "$userId" } },
      { $sort: { _id: 1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const countPipeline = [
      { $match: { appId: app._id } },
      { $group: { _id: "$userId" } },
      { $count: "total" }
    ];

    const usersResult = await DeviceModel.aggregate(aggregationPipeline);
    const countResult = await DeviceModel.aggregate(countPipeline);
    
    const users = usersResult.map(u => u._id);
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    return NextResponse.json({ 
      success: true, 
      users,
      totalCount,
      hasMore: (skip + limit) < totalCount
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
