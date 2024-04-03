const mongoose = require('mongoose');
const url='mongodb+srv://le927011:123123a@cluster0.84rtuvk.mongodb.net/?retryWrites=true&w=majority'
const connectDB = async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
};

module.exports = connectDB;
