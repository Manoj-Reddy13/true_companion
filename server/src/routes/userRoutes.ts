import { Router } from 'express';
import {
  getUserProfile,
  updateProfile,
  blockUser,
  unblockUser,
  getBlockedUsers,
  deleteAccount,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/profile/:id', authenticate, getUserProfile);
router.patch('/profile', authenticate, updateProfile);
router.post('/block/:id', authenticate, blockUser);
router.post('/unblock/:id', authenticate, unblockUser);
router.get('/blocked', authenticate, getBlockedUsers);
router.delete('/account', authenticate, deleteAccount);

export default router;
