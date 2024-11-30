import mongoose from 'mongoose';

const cardConfigSchema = new mongoose.Schema({
  membershipTier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membership',
    required: true
  },
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  buttonColor: {
    type: String,
    default: '#000000'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    required: true
  },
  visibilityType: {
    type: String,
    enum: ['public', 'private', 'hidden'],
    default: 'public'
  },
  salesCopy: {
    title: String,
    description: String,
    callToAction: String,
    benefits: [String]
  }
});

const storefrontConfigSchema = new mongoose.Schema({
  headerText: {
    type: String,
    default: 'Choose the perfect membership for you'
  },
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  cardStyle: {
    borderRadius: {
      type: String,
      enum: ['rounded', 'sharp'],
      default: 'rounded'
    },
    fontFamily: {
      type: String,
      enum: ['tahoma', 'sans', 'serif'],
      default: 'tahoma'
    }
  },
  cards: [cardConfigSchema],
  showYearlyToggle: {
    type: Boolean,
    default: true
  },
  isYearlySelected: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const StorefrontConfig = mongoose.model('StorefrontConfig', storefrontConfigSchema);

export default StorefrontConfig;