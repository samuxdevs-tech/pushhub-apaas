import mongoose from 'mongoose';

const AppSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.App || mongoose.model('App', AppSchema);
