import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App',
    required: true,
  },
  userId: {
    type: String,
    required: [true, 'Please provide the user identifier.'],
  },
  pushToken: {
    type: String,
    required: [true, 'Please provide the FCM push token.'],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user only has one token per app, or update the token if they change it
DeviceSchema.index({ appId: 1, userId: 1 }, { unique: true });

export default mongoose.models.Device || mongoose.model('Device', DeviceSchema);
