/**
 * Input Validation Middleware
 */

import { Request, Response, NextFunction } from 'express';

// Email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validation error
interface ValidationError {
  field: string;
  message: string;
}

// Validation result
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Validate required string
function validateRequired(value: any, field: string, minLength = 1, maxLength = 10000): ValidationError | null {
  if (!value || typeof value !== 'string') {
    return { field, message: `${field} is required` };
  }
  if (value.length < minLength) {
    return { field, message: `${field} must be at least ${minLength} characters` };
  }
  if (value.length > maxLength) {
    return { field, message: `${field} must be less than ${maxLength} characters` };
  }
  return null;
}

// Validate email
function validateEmail(value: any, field: string): ValidationError | null {
  if (!value || typeof value !== 'string') {
    return { field, message: `${field} is required` };
  }
  if (!EMAIL_REGEX.test(value)) {
    return { field, message: `${field} must be a valid email address` };
  }
  return null;
}

// Validate optional number
function validateOptionalNumber(value: any, field: string, min?: number, max?: number): ValidationError | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const num = typeof value === 'number' ? value : parseInt(value, 10);
  if (isNaN(num)) {
    return { field, message: `${field} must be a number` };
  }
  if (min !== undefined && num < min) {
    return { field, message: `${field} must be at least ${min}` };
  }
  if (max !== undefined && num > max) {
    return { field, message: `${field} must be at most ${max}` };
  }
  return null;
}

// Validate enum
function validateEnum(value: any, field: string, allowedValues: string[], optional = false): ValidationError | null {
  if (!value) {
    if (optional) return null;
    return { field, message: `${field} is required` };
  }
  if (!allowedValues.includes(value)) {
    return { field, message: `${field} must be one of: ${allowedValues.join(', ')}` };
  }
  return null;
}

// Startup validation
export function validateStartup(req: Request, res: Response, next: NextFunction) {
  const errors: ValidationError[] = [];
  const { name, founderName, email, stage, teamSize } = req.body;

  const nameErr = validateRequired(name, 'name', 1, 200);
  if (nameErr) errors.push(nameErr);

  const founderErr = validateRequired(founderName, 'founderName', 1, 200);
  if (founderErr) errors.push(founderErr);

  const emailErr = validateEmail(email, 'email');
  if (emailErr) errors.push(emailErr);

  const stageErr = validateEnum(stage, 'stage', ['PRE_SEED', 'SEED', 'SERIES_A', 'SERIES_B_PLUS', 'GROWTH'], true);
  if (stageErr) errors.push(stageErr);

  const teamSizeErr = validateOptionalNumber(teamSize, 'teamSize', 1, 10000);
  if (teamSizeErr) errors.push(teamSizeErr);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
}

// Mentor validation
export function validateMentor(req: Request, res: Response, next: NextFunction) {
  const errors: ValidationError[] = [];
  const { name, email } = req.body;

  const nameErr = validateRequired(name, 'name', 1, 200);
  if (nameErr) errors.push(nameErr);

  const emailErr = validateEmail(email, 'email');
  if (emailErr) errors.push(emailErr);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
}

// Bottleneck validation
export function validateBottleneck(req: Request, res: Response, next: NextFunction) {
  const errors: ValidationError[] = [];
  const { startupId, rawBlocker, rawAttempts, rawSuccessCriteria } = req.body;

  const startupIdErr = validateRequired(startupId, 'startupId', 1, 100);
  if (startupIdErr) errors.push(startupIdErr);

  const blockerErr = validateRequired(rawBlocker, 'rawBlocker', 5, 10000);
  if (blockerErr) errors.push(blockerErr);

  const attemptsErr = validateRequired(rawAttempts, 'rawAttempts', 5, 10000);
  if (attemptsErr) errors.push(attemptsErr);

  const criteriaErr = validateRequired(rawSuccessCriteria, 'rawSuccessCriteria', 5, 5000);
  if (criteriaErr) errors.push(criteriaErr);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
}

// Experience validation
export function validateExperience(req: Request, res: Response, next: NextFunction) {
  const errors: ValidationError[] = [];
  const { mentorId, rawProblem, rawContext, rawSolution, rawOutcomes, yearOccurred } = req.body;

  const mentorIdErr = validateRequired(mentorId, 'mentorId', 1, 100);
  if (mentorIdErr) errors.push(mentorIdErr);

  const problemErr = validateRequired(rawProblem, 'rawProblem', 20, 10000);
  if (problemErr) errors.push(problemErr);

  const contextErr = validateRequired(rawContext, 'rawContext', 20, 10000);
  if (contextErr) errors.push(contextErr);

  const solutionErr = validateRequired(rawSolution, 'rawSolution', 20, 10000);
  if (solutionErr) errors.push(solutionErr);

  const outcomesErr = validateRequired(rawOutcomes, 'rawOutcomes', 10, 10000);
  if (outcomesErr) errors.push(outcomesErr);

  const yearErr = validateOptionalNumber(yearOccurred, 'yearOccurred', 1990, new Date().getFullYear());
  if (yearErr) errors.push(yearErr);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
}

// Feedback validation
export function validateFeedback(req: Request, res: Response, next: NextFunction) {
  const errors: ValidationError[] = [];
  const { rating } = req.body;

  const ratingErr = validateEnum(rating, 'rating', ['HIGHLY_USEFUL', 'SOMEWHAT_USEFUL', 'NOT_USEFUL']);
  if (ratingErr) errors.push(ratingErr);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
}
