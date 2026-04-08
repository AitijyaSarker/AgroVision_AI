import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  console.log('🔍 Testing MongoDB Connection...');
  console.log('================================');

  try {
    console.log('📡 Connecting to MongoDB Atlas...');

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Connection Details:');
    console.log('   - Database:', mongoose.connection.name);
    console.log('   - Host:', mongoose.connection.host);
    console.log('   - Port:', mongoose.connection.port);
    console.log('   - Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');

    // Test basic database operations
    console.log('\n🧪 Testing Database Operations...');

    // Get collection stats
    const db = mongoose.connection.db;
    const collections = await db.collections();
    console.log('   - Collections found:', collections.length);

    // List collection names
    const collectionNames = collections.map(col => col.collectionName);
    console.log('   - Collection names:', collectionNames.join(', ') || 'None yet');

    await mongoose.disconnect();
    console.log('\n✅ Connection test completed successfully!');

  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error('Error:', error.message);

    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Possible issues:');
      console.log('   - Check username/password in connection string');
      console.log('   - Verify user permissions in MongoDB Atlas');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n💡 Possible issues:');
      console.log('   - Check cluster URL in connection string');
      console.log('   - Verify cluster is running');
    } else if (error.message.includes('connection timed out')) {
      console.log('\n💡 Possible issues:');
      console.log('   - Check network connectivity');
      console.log('   - Verify IP whitelist in MongoDB Atlas');
    }
  }
};

testConnection();