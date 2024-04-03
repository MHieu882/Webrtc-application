const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    Groupname: { type: String, required: true, unique: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    avatar: { type: String, required: true }
});

module.exports = mongoose.model('Group', groupSchema);
