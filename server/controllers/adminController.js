import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { generatePassword } from '../utils/passwordGenerator.js';
import { logger } from '../utils/logger.js';

export const createUser = async (req, res, next) => {
  try {
    const { email, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError('User already exists', 400);
    }

    // Generate random password
    const password = generatePassword();

    // Create new user
    const user = new User({
      email,
      name,
      role,
      password,
      createdBy: req.user.userId
    });

    await user.save();

    // TODO: Send email with credentials to user
    logger.info(`New user created: ${email}`);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
      initialPassword: password // Only send this in development
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role, status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Update fields
    if (name) user.name = name;
    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
  } catch (error) {
    next(error);
  }
};

export const resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Generate new password
    const newPassword = generatePassword();
    user.password = newPassword;
    await user.save();

    // TODO: Send email with new password to user
    logger.info(`Password reset for user: ${user.email}`);

    res.json({
      message: 'Password reset successful',
      newPassword // Only send this in development
    });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting admin user
    if (id === req.user.userId) {
      throw new ApiError('Cannot delete your own account', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};