const History = require('../models/History');

exports.recordAction = async (req, res) => {
    try {
        const action = new History({ ...req.body, userId: req.user.userId });
        await action.save();
        res.status(201).json({ message: 'Action recorded successfully', action });
    } catch (error) {
        res.status(500).json({ message: 'Error recording action', error });
    }
};

exports.getUserHistory = async (req, res) => {
    try {
        const history = await History.find({ userId: req.user.userId });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user history', error });
    }
};
