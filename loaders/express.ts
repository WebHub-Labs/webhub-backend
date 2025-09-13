import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from '../config';
import loginRouter from '../routes/login';
import registerUser from '../routes/registerUser';
import registerShop from '../routes/registerShop';
import productRouter from '../routes/products';
import orderRouter from '../routes/orders';
import categoryRouter from '../routes/categories';
import adminRouter from '../routes/admin';
import notificationRouter from '../routes/notifications';
import { errorHandler } from '../utils/errorHandler';

export default async ({ app }: { app: express.Application }) => {
    // Security middleware
    app.use(helmet());
    
    // Rate limiting
    const limiter = rateLimit({
        windowMs: config.rateLimitWindowMs,
        max: config.rateLimitMaxRequests,
        message: {
            error: 'Too many requests from this IP, please try again later.'
        }
    });
    app.use(limiter);

    // CORS configuration
    app.use(cors({
        origin: config.corsOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Logging
    if (config.nodeEnv === 'development') {
        app.use(morgan('dev'));
    }

    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Health check endpoints
    app.get('/status', (req: Request, res: Response) => { 
        res.status(200).json({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            environment: config.nodeEnv
        }); 
    });
    app.head('/status', (req: Request, res: Response) => { res.status(200).end(); });

    // API routes
    app.use("/api/auth/login", loginRouter);
    app.use("/api/auth/register", registerUser);
    app.use("/api/shops", registerShop);
    app.use("/api/products", productRouter);
    app.use("/api/orders", orderRouter);
    app.use("/api/categories", categoryRouter);
    app.use("/api/admin", adminRouter);
    app.use("/api/notifications", notificationRouter);

    // 404 handler
    app.use('*', (req: Request, res: Response) => {
        res.status(404).json({
            success: false,
            error: 'Route not found'
        });
    });

    // Global error handler
    app.use(errorHandler);

    return app;
}