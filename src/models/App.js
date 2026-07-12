import mongoose from 'mongoose';

const AppSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a name for this app.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  apiKey: {
    type: String,
    required: true,
    unique: true,
  },
  firebaseCredentials: {
    projectId: { type: String, required: false },
    clientEmail: { type: String, required: false },
    privateKey: { type: String, required: false }, // ENCRYPTED
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.App || mongoose.model('App', AppSchema);
