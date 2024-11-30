import { ApiError } from '../utils/ApiError.js';
import Settings from '../models/Settings.js';
import { logger } from '../utils/logger.js';

export const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings || {});
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;

    const settings = await Settings.findOneAndUpdate(
      {},
      { ...updates, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true }
    );

    logger.info('Business settings updated');
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateBrandingSettings = async (req, res, next) => {
  try {
    const { logoUrl, businessName, primaryColor, customButtonColors } = req.body;

    const settings = await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          'branding.logoUrl': logoUrl,
          'branding.businessName': businessName,
          'branding.primaryColor': primaryColor,
          'branding.customButtonColors': customButtonColors,
          updatedAt: new Date()
        }
      },
      { new: true, upsert: true, runValidators: true }
    );

    logger.info('Branding settings updated');
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const updatePaymentSettings = async (req, res, next) => {
  try {
    const { provider, environment, apiKey, secretKey } = req.body;

    const settings = await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          'payment.provider': provider,
          'payment.environment': environment,
          'payment.apiKey': apiKey,
          'payment.secretKey': secretKey,
          updatedAt: new Date()
        }
      },
      { new: true, upsert: true, runValidators: true }
    );

    logger.info('Payment settings updated');
    res.json(settings);
  } catch (error) {
    next(error);
  }
};