import { Router } from 'express';
import {
  register,
  login,
  getMe,
  logout,
  generateUsernameHandler,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/generate-username', generateUsernameHandler);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
