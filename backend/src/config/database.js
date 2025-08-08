const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            console.log('⚠️  MongoDB URI not found in environment variables');
            console.log('💡 For development without MongoDB, the app will continue with limited functionality');
            return null;
        }

        console.log('🔄 Attempting to connect to MongoDB...');

        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // 5초 타임아웃
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.log('💡 Continuing without MongoDB - using memory-based storage for development');

        // MongoDB 연결 실패해도 앱은 계속 실행
        // 실제 프로덕션에서는 process.exit(1)을 사용할 수 있습니다
        return null;
    }
};

// MongoDB 연결 상태 확인 헬퍼 함수
const isConnected = () => {
    return mongoose.connection.readyState === 1;
};

// 개발용 메모리 저장소 (MongoDB 없을 때 사용)
const memoryStore = {
    users: new Map(),
    articles: new Map(),
    userInteractions: new Map(),

    // 샘플 사용자 생성
    initSampleData() {
        if (this.users.size === 0) {
            this.users.set('sample@test.com', {
                _id: 'sample-user-id',
                email: 'sample@test.com',
                password: '$2a$10$samplehashedpassword', // 실제로는 bcrypt로 해시
                preferences: {
                    categories: ['technology', 'science'],
                    language: 'ko'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log('📝 Sample user created for development');
        }
    }
};

module.exports = {
    connectDB,
    isConnected,
    memoryStore
};