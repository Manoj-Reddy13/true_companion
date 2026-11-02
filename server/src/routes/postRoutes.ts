import { Router } from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleBookmark,
  getBookmarkedPosts,
} from '../controllers/postController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getPosts);
router.get('/bookmarks', authenticate, getBookmarkedPosts);
router.get('/:id', optionalAuth, getPostById);
router.post('/', authenticate, createPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/bookmark', authenticate, toggleBookmark);

export default router;
