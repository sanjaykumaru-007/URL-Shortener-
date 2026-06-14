import mongoose from 'mongoose';

const clickSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    default: 'Unknown'
  },
  country: {
    type: String,
    default: 'Unknown'
  },
  city: {
    type: String,
    default: 'Unknown'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown'
  },
  device: {
    type: String,
    default: 'Unknown'
  },
  referrer: {
    type: String,
    default: 'Direct'
  },
  isUnique: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

clickSchema.index({ urlId: 1, createdAt: -1 });
clickSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Click', clickSchema);