import mongoose from 'mongoose';

const benefitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  frequency: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Yearly'],
    required: true
  },
  expiresInMonths: {
    type: Number,
    required: true,
    min: 1
  }
});

const membershipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: String,
  monthlyPrice: {
    type: Number,
    min: 0
  },
  yearlyPrice: {
    firstYear: {
      type: Number,
      min: 0
    },
    secondYear: {
      type: Number,
      min: 0
    }
  },
  benefits: [benefitSchema],
  rewardValue: {
    type: Number,
    required: true,
    min: 0
  },
  rewardFrequency: {
    type: String,
    enum: ['Monthly', 'Yearly'],
    required: true
  },
  cashback: {
    enabled: {
      type: Boolean,
      default: false
    },
    rate: {
      type: Number,
      min: 0,
      max: 100
    },
    limits: {
      perTransaction: Number,
      monthly: Number,
      annual: Number
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  memberCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Membership = mongoose.model('Membership', membershipSchema);

export default Membership;