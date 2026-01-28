import express from 'express';
import { commentDB } from '../services/database.js';

const router = express.Router();

// GET /api/comments - Get all comments
router.get('/', async (req, res) => {
  try {
    const comments = await commentDB.getAll();
    res.json({
      success: true,
      data: comments,
      count: comments.length
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comments'
    });
  }
});

// GET /api/comments/:id - Get comment by ID
router.get('/:id', async (req, res) => {
  try {
    const comment = await commentDB.getById(req.params.id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }
    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comment'
    });
  }
});

// POST /api/comments - Submit new comment/feedback
router.post('/', async (req, res) => {
  try {
    const { 
      userId, 
      userName, 
      userEmail, 
      subject, 
      message, 
      category,
      relatedId 
    } = req.body;

    // Validation
    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: 'User ID and message are required'
      });
    }

    const commentData = {
      userId,
      userName: userName || 'Anonymous',
      userEmail: userEmail || '',
      subject: subject || 'General Feedback',
      message,
      category: category || 'general', // general, bug, feature, question
      relatedId: relatedId || null, // ID of related disease, market, etc.
      status: 'unread', // unread, read, replied
      submittedAt: new Date().toISOString()
    };

    const newId = await commentDB.create(commentData);
    if (!newId) {
      return res.status(500).json({
        success: false,
        error: 'Failed to submit comment'
      });
    }

    res.status(201).json({
      success: true,
      data: { id: newId, ...commentData },
      message: 'Comment submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting comment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit comment'
    });
  }
});

// PUT /api/comments/:id/read - Mark comment as read (Admin only)
router.put('/:id/read', async (req, res) => {
  try {
    const success = await commentDB.update(req.params.id, { 
      status: 'read',
      readAt: new Date().toISOString()
    });

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    res.json({
      success: true,
      message: 'Comment marked as read'
    });
  } catch (error) {
    console.error('Error marking comment as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark comment as read'
    });
  }
});

// PUT /api/comments/:id/reply - Reply to comment (Admin only)
router.put('/:id/reply', async (req, res) => {
  try {
    const { reply, repliedBy } = req.body;

    if (!reply) {
      return res.status(400).json({
        success: false,
        error: 'Reply message is required'
      });
    }

    const success = await commentDB.update(req.params.id, { 
      status: 'replied',
      reply,
      repliedBy: repliedBy || 'Admin',
      repliedAt: new Date().toISOString()
    });

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    res.json({
      success: true,
      message: 'Reply sent successfully'
    });
  } catch (error) {
    console.error('Error replying to comment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reply to comment'
    });
  }
});

// DELETE /api/comments/:id - Delete comment (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const success = await commentDB.delete(req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete comment'
    });
  }
});

// GET /api/comments/status/:status - Get comments by status
router.get('/status/:status', async (req, res) => {
  try {
    const comments = await commentDB.getAll();
    const filtered = comments.filter(comment => 
      comment.status === req.params.status
    );
    
    res.json({
      success: true,
      data: filtered,
      count: filtered.length
    });
  } catch (error) {
    console.error('Error filtering comments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to filter comments'
    });
  }
});

// GET /api/comments/category/:category - Get comments by category
router.get('/category/:category', async (req, res) => {
  try {
    const comments = await commentDB.getAll();
    const filtered = comments.filter(comment => 
      comment.category === req.params.category
    );
    
    res.json({
      success: true,
      data: filtered,
      count: filtered.length
    });
  } catch (error) {
    console.error('Error filtering comments by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to filter comments'
    });
  }
});

// GET /api/comments/user/:userId - Get comments by user
router.get('/user/:userId', async (req, res) => {
  try {
    const comments = await commentDB.getAll();
    const filtered = comments.filter(comment => 
      comment.userId === req.params.userId
    );
    
    res.json({
      success: true,
      data: filtered,
      count: filtered.length
    });
  } catch (error) {
    console.error('Error filtering comments by user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to filter comments'
    });
  }
});

export default router;