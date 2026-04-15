import { Request, Response } from 'express';
import { classifyGender } from '../services/genderize.services';
import { SuccessResponse, ErrorResponse } from '../types/index.types';
import { isValidString } from '../utils/helpers.utils';

/**
 * GET /api/classify
 * Classifies gender based on name using Genderize API
 */
export const classifyRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.query;

    // ===== Input Validation =====

    // Check if name is missing
    if (!name) {
      res.status(400).json({
        status: 'error',
        message: 'Missing or empty name parameter',
      } as ErrorResponse);
      return;
    }

    // Check if name is a string
    if (!isValidString(name)) {
      res.status(422).json({
        status: 'error',
        message: 'Name must be a string',
      } as ErrorResponse);
      return;
    }

    // Trim whitespace
    const trimmedName = (name as string).trim();

    // Check if name is empty after trimming
    if (!trimmedName) {
      res.status(400).json({
        status: 'error',
        message: 'Missing or empty name parameter',
      } as ErrorResponse);
      return;
    }

    // ===== Call Service =====
    const processedData = await classifyGender(trimmedName);

    // ===== Success Response =====
    const response: SuccessResponse = {
      status: 'success',
      data: processedData,
    };

    res.status(200).json(response);
  } catch (error) {
    // Handle service errors (API errors, no prediction)
    if (error instanceof Error && error.message === 'No prediction available for the provided name') {
      res.status(200).json({
        status: 'error',
        message: error.message,
      } as ErrorResponse);
      return;
    }

    // Handle API/external errors
    if (error instanceof Error && error.message.includes('External API error')) {
      res.status(502).json({
        status: 'error',
        message: error.message,
      } as ErrorResponse);
      return;
    }

    // Catch-all for unexpected errors
    console.error('Unexpected error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    } as ErrorResponse);
  }
};
