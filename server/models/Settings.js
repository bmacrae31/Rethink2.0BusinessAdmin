import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  branding: {
    logoUrl: String,
    businessName: String,
    primaryColor: String,
    customButtonColors: Boolean
  },
  payment: {
    provider: {
      type: String,
      enum: ['fortis', 'stripe'],
      required: true
    },
    environment: {
      type: String,
      enum: ['test', 'live'],
      default: 'test'
    },
    apiKey: String,
    secretKey: String
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;