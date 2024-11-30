import { ApiError } from '../utils/ApiError.js';
import EmailTemplate from '../models/EmailTemplate.js';
import { logger } from '../utils/logger.js';

export const createTemplate = async (req, res, next) => {
  try {
    const {
      name,
      subject,
      body,
      type,
      variables
    } = req.body;

    const template = new EmailTemplate({
      name,
      subject,
      body,
      type,
      variables,
      createdBy: req.user.userId
    });

    await template.save();
    logger.info(`New email template created: ${name}`);
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
};

export const updateTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const template = await EmailTemplate.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!template) {
      throw new ApiError('Template not found', 404);
    }

    res.json(template);
  } catch (error) {
    next(error);
  }
};

export const listTemplates = async (req, res, next) => {
  try {
    const templates = await EmailTemplate.find()
      .sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    next(error);
  }
};

export const getTemplateById = async (req, res, next) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      throw new ApiError('Template not found', 404);
    }
    res.json(template);
  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (req, res, next) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      throw new ApiError('Template not found', 404);
    }

    await template.deleteOne();
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const sendTestEmail = async (req, res, next) => {
  try {
    const { templateId, testEmail } = req.body;

    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      throw new ApiError('Template not found', 404);
    }

    // TODO: Implement email sending logic
    logger.info(`Test email sent to ${testEmail} using template: ${template.name}`);
    
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    next(error);
  }
};