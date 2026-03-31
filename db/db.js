import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const timeouts = process.env.NODE_ENV === 'production' ? {
      serverSelectionTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000
    } : {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      ...timeouts,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority',
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    if (process.env.NODE_ENV === 'production') {
      setTimeout(connectDB, 10000); // retry after 10s
    }
    throw err;
  }
};

export default connectDB;