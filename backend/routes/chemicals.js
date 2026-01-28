import express from 'express';
import { chemicalDB } from '../services/database.js';

const router = express.Router();

// GET /api/chemicals - Get all chemicals
router.get('/', async (req, res) => {
  try {
    const chemicals = await chemicalDB.getAll();
    res.json({
      success: true,
      data: chemicals,
      count: chemicals.length
    });
  } catch (error) {
    console.error('Error fetching chemicals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chemicals'
    });
  }
});

// GET /api/chemicals/:id - Get chemical by ID
router.get('/:id', async (req, res) => {
  try {
    const chemical = await chemicalDB.getById(req.params.id);
    if (!chemical) {
      return res.status(404).json({
        success: false,
        error: 'Chemical not found'
      });
    }
    res.json({
      success: true,
      data: chemical
    });
  } catch (error) {
    console.error('Error fetching chemical:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chemical'
    });
  }
});

// POST /api/chemicals - Create new chemical (Admin only)
router.post('/', async (req, res) => {
  try {
    const { name, type, activeIngredient, dosage, safetyInstructions } = req.body;

    // Validation
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Name and type are required'
      });
    }

    const chemicalData = {
      name,
      type,
      activeIngredient: activeIngredient || '',
      dosage: dosage || '',
      safetyInstructions: safetyInstructions || { en: '', om: '', am: '' }
    };

    const newId = await chemicalDB.create(chemicalData);
    if (!newId) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create chemical'
      });
    }

    res.status(201).json({
      success: true,
      data: { id: newId, ...chemicalData },
      message: 'Chemical created successfully'
    });
  } catch (error) {
    console.error('Error creating chemical:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create chemical'
    });
  }
});

// PUT /api/chemicals/:id - Update chemical (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const { name, type, activeIngredient, dosage, safetyInstructions } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (type) updates.type = type;
    if (activeIngredient !== undefined) updates.activeIngredient = activeIngredient;
    if (dosage !== undefined) updates.dosage = dosage;
    if (safetyInstructions) updates.safetyInstructions = safetyInstructions;

    const success = await chemicalDB.update(req.params.id, updates);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Chemical not found'
      });
    }

    res.json({
      success: true,
      message: 'Chemical updated successfully'
    });
  } catch (error) {
    console.error('Error updating chemical:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update chemical'
    });
  }
});

// DELETE /api/chemicals/:id - Delete chemical (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const success = await chemicalDB.delete(req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Chemical not found'
      });
    }

    res.json({
      success: true,
      message: 'Chemical deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chemical:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete chemical'
    });
  }
});

// GET /api/chemicals/type/:type - Get chemicals by type
router.get('/type/:type', async (req, res) => {
  try {
    const chemicals = await chemicalDB.getAll();
    const filtered = chemicals.filter(chemical => 
      chemical.type.toLowerCase() === req.params.type.toLowerCase()
    );
    
    res.json({
      success: true,
      data: filtered,
      count: filtered.length
    });
  } catch (error) {
    console.error('Error filtering chemicals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to filter chemicals'
    });
  }
});

export default router;