import { Request, Response, NextFunction } from 'express';
import cors from 'cors';

export const corsMiddleware = cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
});

// Fallback middleware to manually set CORS headers if corsMiddleware fails
export const manualCors = (_req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

