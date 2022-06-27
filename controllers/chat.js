const { StatusCodes } = require("http-status-codes");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

const createChat = async (req, res) => {
	const { partnerId } = req.body;
	const { id: userId } = req.user;
	const type1 = [partnerId, userId];
	const type2 = [userId, partnerId];
	const existingChat = await Chat.findOne({
		$or: [{ members: { $eq: type1 } }, { members: { $eq: type2 } }],
	});
	if (existingChat) res.status(StatusCodes.OK).json({ cid: existingChat._id });
	else {
		const chat = await Chat.create({ members: [req.user.id, partnerId] });
		res.status(StatusCodes.CREATED).json({ cid: chat._id });
	}
};

const getChats = async (req, res) => {
	const { id: userId } = req.user;
	const chats = await Chat.find({ members: { $in: [userId] } }).sort({ updatedAt: -1 });
	res.status(StatusCodes.OK).json({ chats });
};

const deleteChat = async (req, res) => {
	const { chatId: chatID } = req.body;
	await Chat.findByIdAndDelete(chatID);
	const message = await Message.deleteMany({ chatID });
	res.status(StatusCodes.OK).json({ message });
};

module.exports = { createChat, getChats, deleteChat };
