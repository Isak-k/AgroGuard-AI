import express from 'express';
import { diseaseDB } from '../services/database.js';

const router = express.Router();

// GET /api/diseases - Get all diseases
router.get('/', async (req, res) => {
  try {
    const diseases = await diseaseDB.getAll();
    res.json({
      success: true,
      data: diseases,
      count: diseases.length
    });
  } catch (error) {
    console.error('Error fetching diseases:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch diseases'
    });
  }
});

// GET /api/diseases/featured - Get featured diseases for home page
router.get('/featured', async (req, res) => {
  try {
    const diseases = await diseaseDB.getAll();
    const featuredDiseases = diseases.filter(disease => disease.featured === true);
    res.json({
      success: true,
      data: featuredDiseases,
      count: featuredDiseases.length
    });
  } catch (error) {
    console.error('Error fetching featured diseases:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured diseases'
    });
  }
});

// GET /api/diseases/search/:cropType - Search diseases by crop type
router.get('/search/:cropType', async (req, res) => {
  try {
    const diseases = await diseaseDB.getAll();
    const filtered = diseases.filter(disease => 
      disease.cropType.toLowerCase().includes(req.params.cropType.toLowerCase())
    );
    
    res.json({
      success: true,
      data: filtered,
      count: filtered.length
    });
  } catch (error) {
    console.error('Error searching diseases:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search diseases'
    });
  }
});

// GET /api/diseases/:id - Get disease by ID
router.get('/:id', async (req, res) => {
  try {
    const disease = await diseaseDB.getById(req.params.id);
    if (!disease) {
      return res.status(404).json({
        success: false,
        error: 'Disease not found'
      });
    }
    res.json({
      success: true,
      data: disease
    });
  } catch (error) {
    console.error('Error fetching disease:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch disease'
    });
  }
});

// POST /api/diseases - Create new disease (Admin only)
router.post('/', async (req, res) => {
  try {
    const { name, cropType, images, symptoms, treatments } = req.body;

    // Validation
    if (!name?.en || !cropType) {
      return res.status(400).json({
        success: false,
        error: 'Name (English) and crop type are required'
      });
    }

    const diseaseData = {
      name: name || { en: '', om: '', am: '' },
      cropType,
      images: images || [],
      symptoms: symptoms || { en: [], om: [], am: [] },
      treatments: treatments || []
    };

    const newId = await diseaseDB.create(diseaseData);
    if (!newId) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create disease'
      });
    }

    res.status(201).json({
      success: true,
      data: { id: newId, ...diseaseData },
      message: 'Disease created successfully'
    });
  } catch (error) {
    console.error('Error creating disease:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create disease'
    });
  }
});

// PUT /api/diseases/:id - Update disease (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const { name, cropType, images, symptoms, treatments } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (cropType) updates.cropType = cropType;
    if (images) updates.images = images;
    if (symptoms) updates.symptoms = symptoms;
    if (treatments) updates.treatments = treatments;

    const success = await diseaseDB.update(req.params.id, updates);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Disease not found'
      });
    }

    res.json({
      success: true,
      message: 'Disease updated successfully'
    });
  } catch (error) {
    console.error('Error updating disease:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update disease'
    });
  }
});

// DELETE /api/diseases/:id - Delete disease (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const success = await diseaseDB.delete(req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Disease not found'
      });
    }

    res.json({
      success: true,
      message: 'Disease deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting disease:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete disease'
    });
  }
});

export default router;