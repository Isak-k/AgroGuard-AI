import express from 'express';
import { pendingDiseaseDB, diseaseDB } from '../services/database.js';

const router = express.Router();

// GET /api/pending-diseases - Get all pending diseases
router.get('/', async (req, res) => {
  try {
    const pendingDiseases = await pendingDiseaseDB.getAll();
    res.json({
      success: true,
      data: pendingDiseases,
      count: pendingDiseases.length
    });
  } catch (error) {
    console.error('Error fetching pending diseases:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending diseases'
    });
  }
});

// GET /api/pending-diseases/:id - Get pending disease by ID
router.get('/:id', async (req, res) => {
  try {
    const pendingDisease = await pendingDiseaseDB.getById(req.params.id);
    if (!pendingDisease) {
      return res.status(404).json({
        success: false,
        error: 'Pending disease not found'
      });
    }
    res.json({
      success: true,
      data: pendingDisease
    });
  } catch (error) {
    console.error('Error fetching pending disease:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending disease'
    });
  }
});

// POST /api/pending-diseases - Submit new disease for review
router.post('/', async (req, res) => {
  try {
    const { 
      submittedBy, 
      submitterName, 
      cropType, 
      location, 
      images, 
      description, 
      symptoms 
    } = req.body;

    // Validation
    if (!submittedBy || !cropType || !description) {
      return res.status(400).json({
        success: false,
        error: 'Submitted by, crop type, and description are required'
      });
    }

    const pendingDiseaseData = {
      submittedBy,
      submitterName: submitterName || 'Anonymous',
      cropType,
      location: location || '',
      images: images || [],
      description,
      symptoms: symptoms || [],
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    const newId = await pendingDiseaseDB.create(pendingDiseaseData);
    if (!newId) {
      return res.status(500).json({
        success: false,
        error: 'Failed to submit disease for review'
      });
    }

    res.status(201).json({
      success: true,
      data: { id: newId, ...pendingDiseaseData },
      message: 'Disease submitted for review successfully'
    });
  } catch (error) {
    console.error('Error submitting pending disease:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit disease for review'
    });
  }
});

// PUT /api/pending-diseases/:id/approve - Approve pending disease (Admin only)
router.put('/:id/approve', async (req, res) => {
  try {
    const { diseaseData } = req.body;
    const pendingDisease = await pendingDiseaseDB.getById(req.params.id);
    
    if (!pendingDisease) {
      return res.status(404).json({
        success: false,
        error: 'Pending disease not found'
      });
    }

    if (pendingDisease.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Disease has already been processed'
      });
    }

    // Create new disease from pending data or provided data
    const newDiseaseData = diseaseData || {
      name: { en: `${pendingDisease.cropType} Disease`, om: '', am: '' },
      cropType: pendingDisease.cropType,
      images: pendingDisease.images,
      symptoms: { en: pendingDisease.symptoms, om: [], am: [] },
      treatments: []
    };

    const newDiseaseId = await diseaseDB.create(newDiseaseData);
    if (!newDiseaseId) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create disease'
      });
    }

    // Update pending disease status
    await pendingDiseaseDB.update(req.params.id, { 
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedDiseaseId: newDiseaseId
    });

    res.json({
      success: true,
      message: 'Disease approved and added to database',
      diseaseId: newDiseaseId
    });
  } catch (error) {
    console.error('Error approving pending disease:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve disease'
    });
  }
});

// PUT /api/pending-diseases/:id/reject - Reject pending disease (Admin only)
router.put('/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const pendingDisease = await pendingDiseaseDB.getById(req.params.id);
    
    if (!pendingDisease) {
      return res.status(404).json({
        success: false,
        error: 'Pending disease not found'
      });
    }

    if (pendingDisease.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Disease has already been processed'
      });
    }

    const success = await pendingDiseaseDB.update(req.params.id, { 
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason || 'No reason provided'
    });

    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to reject disease'
      });
    }

    res.json({
      success: true,
      message: 'Disease rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting pending disease:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject disease'
    });
  }
});

// DELETE /api/pending-diseases/:id - Delete pending disease (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const success = await pendingDiseaseDB.delete(req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Pending disease not found'
      });
    }

    res.json({
      success: true,
      message: 'Pending disease deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pending disease:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete pending disease'
    });
  }
});

// GET /api/pending-diseases/status/:status - Get pending diseases by status
router.get('/status/:status', async (req, res) => {
  try {
    const pendingDiseases = await pendingDiseaseDB.getAll();
    const filtered = pendingDiseases.filter(disease => 
      disease.status === req.params.status
    );
    
    res.json({
      success: true,
      data: filtered,
      count: filtered.length
    });
  } catch (error) {
    console.error('Error filtering pending diseases:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to filter pending diseases'
    });
  }
});

export default router;