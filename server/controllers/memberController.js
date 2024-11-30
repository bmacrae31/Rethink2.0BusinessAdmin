import { ApiError } from '../utils/ApiError.js';
import Member from '../models/Member.js';
import { logger } from '../utils/logger.js';

export const createMember = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      membershipTier,
      paymentMethod
    } = req.body;

    const member = new Member({
      name,
      email,
      phone,
      membershipTier,
      status: 'active',
      joinDate: new Date(),
      createdBy: req.user.userId
    });

    await member.save();
    logger.info(`New member created: ${email}`);
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

export const updateMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const member = await Member.findByIdAndUpdate(
      id,
      { ...updates, lastActivity: new Date() },
      { new: true, runValidators: true }
    );

    if (!member) {
      throw new ApiError('Member not found', 404);
    }

    res.json(member);
  } catch (error) {
    next(error);
  }
};

export const listMembers = async (req, res, next) => {
  try {
    const { search, status, membershipTier, dateRange } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    
    if (status?.length) {
      query.status = { $in: status };
    }
    
    if (membershipTier?.length) {
      query.membershipTier = { $in: membershipTier };
    }
    
    if (dateRange?.start && dateRange?.end) {
      query.joinDate = {
        $gte: new Date(dateRange.start),
        $lte: new Date(dateRange.end)
      };
    }

    const members = await Member.find(query)
      .sort({ joinDate: -1 });
      
    res.json(members);
  } catch (error) {
    next(error);
  }
};

export const getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      throw new ApiError('Member not found', 404);
    }
    res.json(member);
  } catch (error) {
    next(error);
  }
};

export const deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      throw new ApiError('Member not found', 404);
    }

    await member.deleteOne();
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    next(error);
  }
};