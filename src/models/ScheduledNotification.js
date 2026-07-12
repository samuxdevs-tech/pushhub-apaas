import mongoose from 'mongoose';

const ScheduledNotificationSchema = new mongoose.Schema({
  appId: { type: mongoose.Schema.Types.ObjectId, ref: 'App', required: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: false }, // If null, it's a broadcast
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: { type: Object, default: {} },
  scheduledFor: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  error: { type: String },
}, { timestamps: true });

export default mongoose.models.ScheduledNotification || mongoose.model('ScheduledNotification', ScheduledNotificationSchema);
