import { ApiError } from '../utils/ApiError.js';
import Offer from '../models/Offer.js';
import { logger } from '../utils/logger.js';

export const createOffer = async (req, res, next) => {
  try {
    const {
      title,
      description,
      imageUrl,
      price,
      originalPrice,
      startDate,
      endDate,
      membershipTiers,
      metadata
    } = req.body;

    const offer = new Offer({
      title,
      description,
      imageUrl,
      price,
      originalPrice,
      startDate,
      endDate,
      membershipTiers,
      metadata,
      status: 'draft',
      createdBy: req.user.userId
    });

    await offer.save();
    logger.info(`New offer created: ${title}`);
    res.status(201).json(offer);
  } catch (error) {
    next(error);
  }
};

export const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const offer = await Offer.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!offer) {
      throw new ApiError('Offer not found', 404);
    }

    res.json(offer);
  } catch (error) {
    next(error);
  }
};

export const listOffers = async (req, res, next) => {
  try {
    const { status, membershipTier, dateRange } = req.query;
    
    let query = {};
    
    if (status?.length) {
      query.status = { $in: status };
    }
    
    if (membershipTier?.length) {
      query.membershipTiers = { $in: membershipTier };
    }
    
    if (dateRange?.start && dateRange?.end) {
      query.startDate = { $gte: new Date(dateRange.start) };
      query.endDate = { $lte: new Date(dateRange.end) };
    }

    const offers = await Offer.find(query)
      .sort({ createdAt: -1 });
      
    res.json(offers);
  } catch (error) {
    next(error);
  }
};

export const getOfferById = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      throw new ApiError('Offer not found', 404);
    }
    res.json(offer);
  } catch (error) {
    next(error);
  }
};

export const deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      throw new ApiError('Offer not found', 404);
    }

    await offer.deleteOne();
    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    next(error);
  }
};