import express from 'express';
import Vendor from '../models/Vendor.js';
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const vendor = new Vendor(req.body);
    await vendor.save();

    res.status(201).json({
      success: true,
      vendor
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      vendors
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({
      success: true,
      vendor
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({
      success: true,
      vendor
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

export default router;
