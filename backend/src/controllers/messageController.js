import { getCollections } from "../config/database.js";
import { makeId, nowISO } from "../utils/helpers.js";

const withoutMongoId = ({ _id, ...doc }) => doc;

export const listMessages = async (req, res) => {
  const { messages } = getCollections();
  const withUser = req.query.withUser;

  const query = withUser
    ? {
        $or: [
          { sender_id: req.user.id, receiver_id: withUser },
          { sender_id: withUser, receiver_id: req.user.id }
        ]
      }
    : {
        $or: [{ sender_id: req.user.id }, { receiver_id: req.user.id }]
      };

  const rows = await messages.find(query).sort({ timestamp: 1 }).toArray();
  res.json({ messages: rows.map(withoutMongoId) });
};

export const createMessage = async (req, res) => {
  const { messages } = getCollections();
  const { receiver_id, content } = req.body;

  if (!receiver_id || !content) {
    return res.status(400).json({ message: "receiver_id and content are required" });
  }

  const msg = {
    id: makeId(),
    sender_id: req.user.id,
    receiver_id,
    content,
    timestamp: nowISO()
  };

  await messages.insertOne(msg);
  res.status(201).json({ message: msg });
};
