const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const messageSchema = new mongoose.Schema({
    sender: {
      type: Schema.Types.ObjectId, ref: 'User' ,
      require:true
  },
    receiver: {
      type: Schema.Types.ObjectId, ref: 'User' ,
      require:true
  },
    content: {
      type:String,
      required:true
  },
    timestamp: { type: Date, default: Date.now }
  });
  
module.exports = mongoose.model('Message',messageSchema);