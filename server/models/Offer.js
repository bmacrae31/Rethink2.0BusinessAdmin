import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  quantityLimit: {
    type: Number,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'expired', 'paused'],
    default: 'draft'
  },
  redemptionCount: {
    type: Number,
    default: 0
  },
  membershipTiers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membership'
  }],
  metadata: {
    termsAndConditions: String,
    redemptionInstructions: String,
    marketingCopy: String,
    highlightFeatures: [String],
    socialShareText: String,
    displayPriority: {
      type: String,
      enum: ['low', 'normal', 'high', 'featured'],
      default: 'normal'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Offer = mongoose.model('Offer', offerSchema);

export default Offer;