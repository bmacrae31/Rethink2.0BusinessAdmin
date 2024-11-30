import { ApiError } from '../utils/ApiError.js';
import Membership from '../models/Membership.js';
import { logger } from '../utils/logger.js';

export const createMembership = async (req, res, next) => {
  try {
    const {
      name,
      description,
      monthlyPrice,
      yearlyPrice,
      benefits,
      rewardValue,
      rewardFrequency,
      cashback
    } = req.body;

    const membership = new Membership({
      name,
      description,
      monthlyPrice,
      yearlyPrice,
      benefits,
      rewardValue,
      rewardFrequency,
      cashback,
      createdBy: req.user.userId
    });

    await membership.save();
    logger.info(`New membership created: ${name}`);
    res.status(201).json(membership);
  } catch (error) {
    next(error);
  }
};

export const updateMembership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const membership = await Membership.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!membership) {
      throw new ApiError('Membership not found', 404);
    }

    res.json(membership);
  } catch (error) {
    next(error);
  }
};

export const listMemberships = async (req, res, next) => {
  try {
    const memberships = await Membership.find()
      .sort({ createdAt: -1 });
    res.json(memberships);
  } catch (error) {
    next(error);
  }
};

export const getMembershipById = async (req, res, next) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      throw new ApiError('Membership not found', 404);
    }
    res.json(membership);
  } catch (error) {
    next(error);
  }
};

export const deleteMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      throw new ApiError('Membership not found', 404);
    }

    // Check if membership has active members before deletion
    if (membership.memberCount > 0) {
      throw new ApiError('Cannot delete membership with active members', 400);
    }

    await membership.deleteOne();
    res.json({ message: 'Membership deleted successfully' });
  } catch (error) {
    next(error);
  }
};