// Enable CORS using middelware
import cors from 'cors';

export const corsMiddleware = cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
});

// Fallback: Manually set CORS headers if cors middleware fails
export const manualCors = (req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

