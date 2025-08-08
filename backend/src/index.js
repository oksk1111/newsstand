const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB, memoryStore } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const newsRoutes = require('./routes/news');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const { startNewsAggregation } = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

// 서버 시작 함수
const startServer = async () => {
    try {
        console.log('🚀 Starting Newsstand Backend Server...');

        // MongoDB 연결 시도 (실패해도 계속 진행)
        const dbConnection = await connectDB();

        if (!dbConnection) {
            console.log('💡 Running in development mode without MongoDB');
            memoryStore.initSampleData();
        }

        // Security middleware
        app.use(helmet());
        app.use(compression());

        // CORS configuration
        const corsOptions = {
            origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
            credentials: true,
            optionsSuccessStatus: 200,
        };
        app.use(cors(corsOptions));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
            max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
            message: {
                error: 'Too many requests from this IP, please try again later.',
            },
        });
        app.use(limiter);

        // Logging
        if (process.env.NODE_ENV !== 'test') {
            app.use(morgan('combined'));
        }

        // Body parsing middleware
        app.use(express.json({ limit: '10mb' }));
        app.use(express.urlencoded({ extended: true }));

        // Health check endpoint
        app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                mongodb: require('./config/database').isConnected() ? 'connected' : 'disconnected',
                mode: process.env.NODE_ENV || 'development'
            });
        });

        // API routes
        app.use('/api/auth', authRoutes);
        app.use('/api/news', newsRoutes);
        app.use('/api/user', userRoutes);

        // 404 handler
        app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Route not found',
                path: req.originalUrl,
            });
        });

        // Global error handler
        app.use(errorHandler);

        // Start news aggregation service (only if not in test mode)
        if (process.env.NODE_ENV !== 'test') {
            try {
                startNewsAggregation();
                console.log('📰 News aggregation service started');
            } catch (error) {
                console.log('⚠️  News aggregation service failed to start:', error.message);
                console.log('💡 Server will continue without background news updates');
            }
        }

        // Start server
        if (process.env.NODE_ENV !== 'test') {
            app.listen(PORT, () => {
                console.log('✅ Server is running successfully!');
                console.log(`🌐 Server URL: http://localhost:${PORT}`);
                console.log(`� Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log(`💾 Database: ${dbConnection ? 'MongoDB Connected' : 'Memory Store (Development)'}`);
                console.log('📱 API Endpoints:');
                console.log('   - GET /health - Health check');
                console.log('   - POST /api/auth/register - User registration');
                console.log('   - POST /api/auth/login - User login');
                console.log('   - GET /api/news - Get news articles');
                console.log('   - GET /api/user/profile - Get user profile');
            });
        }

    } catch (error) {
        console.error('💥 Failed to start server:', error.message);
        process.exit(1);
    }
};

// 서버 시작
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app;
