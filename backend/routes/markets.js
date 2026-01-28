import express from 'express';
import { marketDB } from '../services/database.js';

const router = express.Router();

// GET /api/markets - Get all markets
router.get('/', async (req, res) => {
  try {
    const markets = await marketDB.getAll();
    res.json({
      success: true,
      data: markets,
      count: markets.length
    });
  } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch markets'
    });
  }
});

// GET /api/markets/:id - Get market by ID
router.get('/:id', async (req, res) => {
  try {
    const market = await marketDB.getById(req.params.id);
    if (!market) {
      return res.status(404).json({
        success: false,
        error: 'Market not found'
      });
    }
    res.json({
      success: true,
      data: market
    });
  } catch (error) {
    console.error('Error fetching market:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market'
    });
  }
});

// POST /api/markets - Create new market (Admin only)
router.post('/', async (req, res) => {
  try {
    const { name, location, region, chemicals } = req.body;

    // Validation
    if (!name || !location) {
      return res.status(400).json({
        success: false,
        error: 'Name and location are required'
      });
    }

    const marketData = {
      name,
      location,
      region: region || '',
      chemicals: chemicals || []
    };

    const newId = await marketDB.create(marketData);
    if (!newId) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create market'
      });
    }

    res.status(201).json({
      success: true,
      data: { id: newId, ...marketData },
      message: 'Market created successfully'
    });
  } catch (error) {
    console.error('Error creating market:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create market'
    });
  }
});

// PUT /api/markets/:id - Update market (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const { name, location, region, chemicals } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (location) updates.location = location;
    if (region !== undefined) updates.region = region;
    if (chemicals) updates.chemicals = chemicals;

    const success = await marketDB.update(req.params.id, updates);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Market not found'
      });
    }

    res.json({
      success: true,
      message: 'Market updated successfully'
    });
  } catch (error) {
    console.error('Error updating market:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update market'
    });
  }
});

// DELETE /api/markets/:id - Delete market (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const success = await marketDB.delete(req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Market not found'
      });
    }

    res.json({
      success: true,
      message: 'Market deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting market:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete market'
    });
  }
});

// GET /api/markets/location/:location - Get markets by location
router.get('/location/:location', async (req, res) => {
  try {
    const markets = await marketDB.getAll();
    const filtered = markets.filter(market => 
      market.location.toLowerCase().includes(req.params.location.toLowerCase()) ||
      market.region.toLowerCase().includes(req.params.location.toLowerCase())
    );
    
    res.json({
      success: true,
      data: filtered,
      count: filtered.length
    });
  } catch (error) {
    console.error('Error filtering markets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to filter markets'
    });
  }
});

// GET /api/markets/:id/chemicals - Get chemicals available in a specific market
router.get('/:id/chemicals', async (req, res) => {
  try {
    const market = await marketDB.getById(req.params.id);
    if (!market) {
      return res.status(404).json({
        success: false,
        error: 'Market not found'
      });
    }

    res.json({
      success: true,
      data: market.chemicals || [],
      count: market.chemicals?.length || 0
    });
  } catch (error) {
    console.error('Error fetching market chemicals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market chemicals'
    });
  }
});

// PUT /api/markets/:id/chemicals/:chemicalId - Update chemical price/availability in market
router.put('/:id/chemicals/:chemicalId', async (req, res) => {
  try {
    const { price, available } = req.body;
    const market = await marketDB.getById(req.params.id);
    
    if (!market) {
      return res.status(404).json({
        success: false,
        error: 'Market not found'
      });
    }

    const chemicals = market.chemicals || [];
    const chemicalIndex = chemicals.findIndex(c => c.chemicalId === req.params.chemicalId);
    
    if (chemicalIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Chemical not found in this market'
      });
    }

    // Update chemical data
    if (price !== undefined) chemicals[chemicalIndex].price = price;
    if (available !== undefined) chemicals[chemicalIndex].available = available;
    chemicals[chemicalIndex].lastUpdated = new Date().toISOString().split('T')[0];

    const success = await marketDB.update(req.params.id, { chemicals });
    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update chemical'
      });
    }

    res.json({
      success: true,
      message: 'Chemical updated successfully'
    });
  } catch (error) {
    console.error('Error updating market chemical:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update chemical'
    });
  }
});

export default router;