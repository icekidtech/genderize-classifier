import { Request, Response } from 'express';

/**
 * GET /health
 * Health check endpoint
 */
export const healthRoute = (req: Request, res: Response): void => {
  res.status(200).json({ status: 'ok' });
};