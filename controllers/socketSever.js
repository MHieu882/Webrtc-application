const activeUsers = {};
const Message = require("../models/MessageModel");
const MessageGroup = require("../models/MessGroup");
const User = require("../models/userModel");
const Group = require("../models/GroupModel");
const handleSocketEvents = (socket) => {
  socket.on("Login", (userLoggin) => {
    activeUsers[userLoggin] = socket.id;
    console.log(`User ${userLoggin} logged in.`);
  });
  socket.on("call", (data) => {
    const { target, caller, roomURL } = data;
    const targetSocketId = activeUsers[target];
    socket.to(targetSocketId).emit("receive", { roomURL, caller });
  });
  socket.on("decline", (data) => {
    const { caller, callee } = data;
    const targetSocketId = activeUsers[caller];
    socket.to(targetSocketId).emit("decline", { callee });
  });
  socket.on("sendMessage", async (data) => {
    const targetSocketId = activeUsers[data.usertarget];
    const send = await User.findOne({ username: data.userLoggin });
    const recei = await User.findOne({ username: data.usertarget });
    //neu targett la  gr
    const group = await Group.findOne({ Groupname: data.usertarget }).populate(
      "members",
    );
    if (!recei) {
      const message = new MessageGroup({
        sender: send._id,
        receiver: group._id,
        content: data.message,
      });
      await message.populate(["sender", "receiver"]);
      await message.save();
      group.members.forEach((member) => {
        const targetSocketId = activeUsers[member.username];
        socket.to(targetSocketId).emit("greceive", { message });
      });
    } else {
      const message = new Message({
        sender: send._id,
        receiver: recei._id,
        content: data.message,
      });
      await message.populate(["sender", "receiver"]);
      await message.save();
      socket.to(targetSocketId).emit("receiveMessage", { message });
    }
  });
  socket.on("getMessage", async (data) => {
    const { targetUser } = data;

    const getavt = await User.findOne({ username: targetUser });
    if (getavt) {
      //user
      const messages = await Message.find(
        {
          $or: [{ receiver: getavt._id }, { sender: getavt._id }],
        },
        { sender: 1, content: 1, receiver: 1, _id: 0 }, // Chỉ lấy trường sender và content, bỏ qua trường _id
      )
        .sort({ timestamp: 1 })
        .populate(["sender", "receiver"]);
      socket.emit("loadMess", { messages, targetUser, avt: getavt.avatar });
    } else {
      //group
      const group = await Group.findOne({ Groupname: targetUser });
      const messages = await MessageGroup.find({ receiver: group._id })
        .sort({ timestamp: 1 })
        .populate(["sender", "receiver"]);
      socket.emit("loadmessGroup", { messages, targetUser, avt: group.avatar });
    }
  });
  socket.on("deleteMessage", async (data) => {
    //user
    const { targetUser, userLoggin } = data;
    const Login = await User.findOne({ username: userLoggin });
    const target = await User.findOne({ username: targetUser });

    if (!target) {
      const target = await Group.findOne({ Groupname: targetUser });
      await MessageGroup.deleteMany({
        sender: Login._id,
        receiver: target._id,
      });
      const group = await Group.findOne({ Groupname: targetUser });
      const messages = await MessageGroup.find({ receiver: group._id })
        .sort({ timestamp: 1 })
        .populate(["sender", "receiver"]);
      socket.emit("loadmessGroup", { messages, targetUser, avt: group.avatar });
    } else {
      await Message.deleteMany({ sender: Login._id, receiver: target._id });
      const messages = await Message.find(
        {
          $or: [{ receiver: Login._id }, { sender: target._id }],
        },
        { sender: 1, content: 1, receiver: 1, _id: 0 }, // Chỉ lấy trường sender và content, bỏ qua trường _id
      )
        .sort({ timestamp: 1 })
        .populate(["sender", "receiver"]);
      socket.emit("loadMess", { messages, targetUser });
    }
  });
  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    const userId = findUserIdBySocketId(socket.id);
    if (userId) {
      delete activeUsers[userId];
    }
  });
};
function findUserIdBySocketId(socketId) {
  for (const [userId, connectedSocketId] of Object.entries(activeUsers)) {
    if (connectedSocketId === socketId) {
      return userId;
    }
  }
  return null;
}

module.exports = { handleSocketEvents };
