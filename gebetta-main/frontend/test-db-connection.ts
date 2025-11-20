import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ Successfully connected to MongoDB!');

    // Ensure the connection is established
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('MongoDB connection not established');
    }

    // Test a simple query
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

  } catch (error) {
    console.error('❌ MongoDB connection error:');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('An unknown error occurred');
    }
  } finally {
    // Close the connection
    if (mongoose.connection.readyState === 1) { // 1 = connected
      await mongoose.disconnect();
      console.log('MongoDB connection closed.');
    }
  }
}

// Run the test
testConnection().catch(console.error);