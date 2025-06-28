import ChatMessage from '../models/ChatMessage.js';

// Ensure ChatMessage is defined
if (!ChatMessage) {
  throw new Error('ChatMessage model is not defined. Check the import path.');
}

const chatController = {
  // Get chat history for a specific user
  getChatHistory: async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Validate user ID
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // Fetch chat messages, sorted by timestamp ascending
      const messages = await ChatMessage.find({ userId })
        .sort({ timestamp: 1 })
        .lean();
      
      return res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return res.status(500).json({ message: 'Server error when fetching chat history' });
    }
  },
  
  // Save a new chat message
  saveMessage: async (req, res) => {
    try {
      const { userId, message } = req.body;
      
      // Validate request
      if (!userId || !message || typeof message.text !== 'string' || typeof message.type !== 'string') {
        return res.status(400).json({ message: 'Invalid or missing message data' });
      }
      
      // Create new chat message
      const newMessage = new ChatMessage({
        userId,
        text: message.text,
        type: message.type,
        timestamp: message.timestamp || Date.now(),
        products: message.products || []
      });
      
      // Save message to database
      await newMessage.save();
      
      return res.status(201).json(newMessage);
    } catch (error) {
      console.error('Error saving chat message:', error);
      return res.status(500).json({ message: 'Server error when saving message' });
    }
  },
  
  // Clear chat history for a user
  clearChatHistory: async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Validate user ID
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // Delete all messages for the user
      await ChatMessage.deleteMany({ userId });
      
      return res.status(200).json({ message: 'Chat history cleared successfully' });
    } catch (error) {
      console.error('Error clearing chat history:', error);
      return res.status(500).json({ message: 'Server error when clearing chat history' });
    }
  }
};

export default chatController;