import { Router } from 'express';
import {
  sendMessage,
  deleteMessage,
  uploadAttachment,
} from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.post('/', sendMessage);
router.delete('/:id', deleteMessage);
router.post('/upload', uploadMiddleware.single('file'), uploadAttachment);

export default router;
