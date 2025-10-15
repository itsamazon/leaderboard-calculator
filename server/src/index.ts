import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import internsRouter from './routes/interns';
import strategistsRouter from './routes/strategists';
import metricsRouter from './routes/metrics';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Parse allowed origins from environment
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'];

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin matches allowed origins
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Allow all Vercel deployment URLs for our projects
        if (origin.includes('studio-x-leaderboard-admin') && origin.includes('vercel.app')) {
            return callback(null, true);
        }
        if (origin.includes('studio-x-interns') && origin.includes('vercel.app')) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/interns', internsRouter);
app.use('/api/strategists', strategistsRouter);
app.use('/api/metrics', metricsRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({
        name: 'Studio X Intern Leaderboard API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            interns: '/api/interns',
            strategists: '/api/strategists',
            metrics: '/api/metrics'
        }
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Studio X Leaderboard API Server Running             ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Port: ${PORT}                                              ║
║   URL: http://localhost:${PORT}                            ║
║                                                           ║
║   📋 Available Endpoints:                                 ║
║   • GET  /health                                          ║
║   • GET  /api/interns                                     ║
║   • GET  /api/strategists                                 ║
║   • GET  /api/metrics                                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;

