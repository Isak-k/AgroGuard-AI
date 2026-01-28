import express from 'express';
import { diseaseCategoryDB } from '../services/database.js';

const router = express.Router();

// GET /api/disease-categories - Get all disease categories
router.get('/', async (req, res) => {
  try {
    const categories = await diseaseCategoryDB.getAll();
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Error fetching disease categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch disease categories'
    });
  }
});

// GET /api/disease-categories/:id - Get disease category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await diseaseCategoryDB.getById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Disease category not found'
      });
    }
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching disease category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch disease category'
    });
  }
});

// POST /api/disease-categories - Create new disease category (Admin only)
router.post('/', async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;

    // Validation
    if (!name?.en || !description?.en) {
      return res.status(400).json({
        success: false,
        error: 'Name and description (English) are required'
      });
    }

    const categoryData = {
      name: name || { en: '', om: '', am: '' },
      description: description || { en: '', om: '', am: '' },
      color: color || '#6B7280',
      icon: icon || 'Folder'
    };

    const newId = await diseaseCategoryDB.create(categoryData);
    if (!newId) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create disease category'
      });
    }

    res.status(201).json({
      success: true,
      data: { id: newId, ...categoryData },
      message: 'Disease category created successfully'
    });
  } catch (error) {
    console.error('Error creating disease category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create disease category'
    });
  }
});

// PUT /api/disease-categories/:id - Update disease category (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (color) updates.color = color;
    if (icon) updates.icon = icon;

    const success = await diseaseCategoryDB.update(req.params.id, updates);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Disease category not found'
      });
    }

    res.json({
      success: true,
      message: 'Disease category updated successfully'
    });
  } catch (error) {
    console.error('Error updating disease category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update disease category'
    });
  }
});

// DELETE /api/disease-categories/:id - Delete disease category (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const success = await diseaseCategoryDB.delete(req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Disease category not found'
      });
    }

    res.json({
      success: true,
      message: 'Disease category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting disease category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete disease category'
    });
  }
});

// GET /api/disease-categories/:id/diseases - Get diseases in a specific category
router.get('/:id/diseases', async (req, res) => {
  try {
    // This would require importing diseaseDB and filtering by categoryId
    // For now, return a placeholder response
    res.json({
      success: true,
      data: [],
      message: 'Feature to be implemented - get diseases by category'
    });
  } catch (error) {
    console.error('Error fetching diseases by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch diseases by category'
    });
  }
});

export default router;