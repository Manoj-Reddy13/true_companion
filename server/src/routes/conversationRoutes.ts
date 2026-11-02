import { Router } from 'express';
import {
  getConversations,
  getConversationById,
  getConversationMessages,
  endConversation,
} from '../controllers/conversationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getConversations);
router.get('/:id', getConversationById);
router.get('/:id/messages', getConversationMessages);
router.post('/:id/end', endConversation);

export default router;
