import { Response } from 'express';
import { AuthRequest, PostCategory } from '../types/index.js';
import { PostRepo, UserRepo, BlockedUserRepo } from '../services/dataService.js';

export async function getPosts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { category, search, authorId, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { status: 'active' };
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (authorId) {
      filter.authorId = authorId;
    }
    if (search && (search as string).trim() !== '') {
      filter.search = (search as string).trim();
    }

    const result = await PostRepo.find(filter, { skip, limit: limitNum });

    // If user is authenticated, check blocked users to exclude their posts
    let finalPosts = result.posts;
    if (req.user) {
      const blockedList = await BlockedUserRepo.findBlockedByUser(req.user._id);
      const blockedIds = blockedList.map((b) =>
        typeof b.blockedUserId === 'object' ? (b.blockedUserId as any)._id : b.blockedUserId
      );

      finalPosts = finalPosts.filter((p) => {
        const authorId = typeof p.authorId === 'object' ? (p.authorId as any)._id : p.authorId;
        return !blockedIds.includes(authorId);
      });
    }

    res.json({
      success: true,
      posts: finalPosts,
      total: result.total,
      page: pageNum,
      totalPages: Math.ceil(result.total / limitNum),
    });
  } catch (err: any) {
    console.error('getPosts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch posts.' });
  }
}

export async function getPostById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const post = await PostRepo.findById(id);

    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found.' });
      return;
    }

    // Check if post is flagged or author is blocked
    if (post.status === 'hidden') {
      res.status(404).json({ success: false, message: 'Post is no longer available.' });
      return;
    }

    // Increment views count asynchronously
    PostRepo.update(id, { viewsCount: (post.viewsCount || 0) + 1 }).catch(() => {});

    res.json({
      success: true,
      post,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error fetching post details.' });
  }
}

export async function createPost(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'You must be logged in to create a post.' });
      return;
    }

    const { title, description, category, chatEnabled = true, attachments = [] } = req.body;

    if (!title || title.trim().length < 5) {
      res.status(400).json({
        success: false,
        message: 'Title must be at least 5 characters long.',
      });
      return;
    }

    if (!description || description.trim().length < 15) {
      res.status(400).json({
        success: false,
        message: 'Please provide a little more detail in your story (at least 15 characters).',
      });
      return;
    }

    const validCategories: PostCategory[] = [
      'Mental Wellbeing',
      'Loneliness',
      'Relationship Issues',
      'Academic Pressure',
      'Career Confusion',
      'Family Problems',
      'Personal Struggles',
      'Motivation',
      'Other',
    ];

    if (!validCategories.includes(category)) {
      res.status(400).json({
        success: false,
        message: 'Please select a valid category from the list.',
      });
      return;
    }

    const newPost = await PostRepo.create({
      authorId: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category,
      chatEnabled: Boolean(chatEnabled),
      attachments,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Your story has been shared safely and anonymously.',
      post: newPost,
    });
  } catch (err: any) {
    console.error('createPost error:', err);
    res.status(500).json({ success: false, message: 'Failed to create post.' });
  }
}

export async function updatePost(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { id } = req.params;
    const post = await PostRepo.findById(id);

    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found.' });
      return;
    }

    const authorId = typeof post.authorId === 'object' ? (post.authorId as any)._id : post.authorId;
    if (authorId !== req.user._id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are only permitted to edit your own posts.',
      });
      return;
    }

    const { title, description, category, chatEnabled, attachments } = req.body;

    const updates: any = {};
    if (title) updates.title = title.trim();
    if (description) updates.description = description.trim();
    if (category) updates.category = category;
    if (chatEnabled !== undefined) updates.chatEnabled = chatEnabled;
    if (attachments !== undefined) updates.attachments = attachments;

    const updated = await PostRepo.update(id, updates);

    res.json({
      success: true,
      message: 'Post updated successfully.',
      post: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error updating post.' });
  }
}

export async function deletePost(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { id } = req.params;
    const post = await PostRepo.findById(id);

    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found.' });
      return;
    }

    const authorId = typeof post.authorId === 'object' ? (post.authorId as any)._id : post.authorId;
    if (authorId !== req.user._id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are only permitted to delete your own posts.',
      });
      return;
    }

    await PostRepo.delete(id);

    res.json({
      success: true,
      message: 'Post deleted successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error deleting post.' });
  }
}

export async function toggleBookmark(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { id } = req.params;
    const user = await UserRepo.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const bookmarks = user.bookmarks || [];
    const isBookmarked = bookmarks.includes(id);

    let updatedBookmarks: string[];
    if (isBookmarked) {
      updatedBookmarks = bookmarks.filter((b) => b !== id);
    } else {
      updatedBookmarks = [...bookmarks, id];
    }

    await UserRepo.update(user._id, { bookmarks: updatedBookmarks });

    res.json({
      success: true,
      bookmarked: !isBookmarked,
      bookmarks: updatedBookmarks,
      message: !isBookmarked ? 'Post saved to your bookmarks.' : 'Post removed from bookmarks.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error toggling bookmark.' });
  }
}

export async function getBookmarkedPosts(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const user = await UserRepo.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const bookmarkIds = user.bookmarks || [];
    const posts = await Promise.all(
      bookmarkIds.map((id) => PostRepo.findById(id))
    );

    const validPosts = posts.filter((p) => p !== null && p.status === 'active');

    res.json({
      success: true,
      posts: validPosts,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error fetching bookmarks.' });
  }
}
