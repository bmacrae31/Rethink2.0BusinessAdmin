import { ApiError } from '../utils/ApiError.js';
import StorefrontConfig from '../models/StorefrontConfig.js';
import { logger } from '../utils/logger.js';

export const getStorefrontConfig = async (req, res, next) => {
  try {
    const config = await StorefrontConfig.findOne();
    res.json(config || {});
  } catch (error) {
    next(error);
  }
};

export const updateStorefrontConfig = async (req, res, next) => {
  try {
    const {
      headerText,
      backgroundColor,
      cardStyle,
      cards,
      showYearlyToggle,
      isYearlySelected
    } = req.body;

    const config = await StorefrontConfig.findOneAndUpdate(
      {},
      {
        headerText,
        backgroundColor,
        cardStyle,
        cards,
        showYearlyToggle,
        isYearlySelected,
        updatedAt: new Date(),
        updatedBy: req.user.userId
      },
      { new: true, upsert: true, runValidators: true }
    );

    logger.info('Storefront configuration updated');
    res.json(config);
  } catch (error) {
    next(error);
  }
};

export const previewStorefront = async (req, res, next) => {
  try {
    const config = await StorefrontConfig.findOne()
      .populate('cards.membershipTier');
      
    if (!config) {
      throw new ApiError('Storefront configuration not found', 404);
    }

    res.json(config);
  } catch (error) {
    next(error);
  }
};

export const publishStorefront = async (req, res, next) => {
  try {
    const config = await StorefrontConfig.findOne();
    if (!config) {
      throw new ApiError('Storefront configuration not found', 404);
    }

    config.isPublished = true;
    config.publishedAt = new Date();
    config.publishedBy = req.user.userId;
    await config.save();

    logger.info('Storefront configuration published');
    res.json({ message: 'Storefront published successfully' });
  } catch (error) {
    next(error);
  }
};