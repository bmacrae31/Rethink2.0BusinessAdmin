import mongoose from 'mongoose';

const benefitSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  }
});

const paymentMethodSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['credit_card', 'bank_account'],
    required: true
  },
  last4: {
    type: String,
    required: true
  },
  expiryDate: String,
  isDefault: {
    type: Boolean,
    default: false
  }
});

const purchasedOfferSchema = new mongoose.Schema({
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'redeemed', 'expired'],
    default: 'available'
  }
});

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: String,
  joinDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  membershipTier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membership',
    required: true
  },
  rewardsBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  lastActivity: Date,
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  nextRenewalDate: {
    type: Date,
    required: true
  },
  benefits: [benefitSchema],
  paymentMethods: [paymentMethodSchema],
  purchasedOffers: [purchasedOfferSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Member = mongoose.model('Member', memberSchema);

export default Member;