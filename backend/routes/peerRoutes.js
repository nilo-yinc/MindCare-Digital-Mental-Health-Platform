const express = require('express');
const { listGroups, createGroup, joinGroup, sendMessage, getMessages } = require('../controllers/peerController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/groups', protect, listGroups);
router.post('/groups', protect, createGroup);
router.post('/groups/:id/join', protect, joinGroup);
router.post('/groups/:id/message', protect, sendMessage);
router.get('/groups/:id/messages', protect, getMessages);

module.exports = router;
