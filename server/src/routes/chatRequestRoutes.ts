import { Router } from 'express';
import {
  createChatRequest,
  getReceivedRequests,
  getSentRequests,
  acceptChatRequest,
  declineChatRequest,
  cancelChatRequest,
} from '../controllers/chatRequestController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', createChatRequest);
router.get('/received', getReceivedRequests);
router.get('/sent', getSentRequests);
router.patch('/:id/accept', acceptChatRequest);
router.patch('/:id/decline', declineChatRequest);
router.delete('/:id', cancelChatRequest);

export default router;
