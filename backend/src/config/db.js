import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for performance
    await mongoose.connection.db.collection('urls').createIndex({ shortCode: 1 }, { unique: true });
    // Ensure customAlias index is sparse to allow missing aliases
    await mongoose.connection.db.collection('urls').createIndex({ customAlias: 1 }, { unique: true, sparse: true });
    await mongoose.connection.db.collection('urls').createIndex({ userId: 1, createdAt: -1 });
    await mongoose.connection.db.collection('clicks').createIndex({ urlId: 1, createdAt: -1 });
    
    // Clean up documents that have customAlias explicitly set to null
    try {
      const result = await mongoose.connection.db.collection('urls').updateMany({ customAlias: null }, { $unset: { customAlias: "" } });
      if (result.modifiedCount > 0) {
        console.log(`Cleaned ${result.modifiedCount} url documents with null customAlias`);
      }
    } catch (cleanupErr) {
      console.error('Error during customAlias cleanup:', cleanupErr.message);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;