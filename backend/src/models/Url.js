import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: false,
  index: true
},
  originalUrl: {
    type: String,
    required: [true, 'Please provide a URL'],
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    sparse: false,
    trim: true
  },
  customAlias: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  title: {
    type: String,
    default: 'Untitled URL',
    trim: true
  },
  clickCount: {
    type: Number,
    default: 0
  },
  uniqueClickCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  qrCode: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

urlSchema.index({ userId: 1, createdAt: -1 });
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Url', urlSchema);