import express from 'express';
import { getUrlAnalytics, getDashboardStats } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/url/:id', protect, getUrlAnalytics);

export default router;