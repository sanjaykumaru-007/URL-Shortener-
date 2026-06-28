import express from 'express';
import { 
  shortenUrl, 
  getUrls, 
  getUrlById, 
  updateUrl, 
  deleteUrl, 
  redirectUrl,
  getPublicUrl
} from '../controllers/urlController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes (Short link redirect - placed early for performance)
router.get('/r/:shortCode', redirectUrl);
router.get('/public/:shortCode', getPublicUrl);

// Protected routes
router.post('/', protect, shortenUrl);
router.get('/', protect, getUrls);
router.get('/:id', protect, getUrlById);
router.put('/:id', protect, updateUrl);
router.delete('/:id', protect, deleteUrl);
// Public shorten endpoint (anonymous users)
router.post('/public', shortenUrl);

export default router;