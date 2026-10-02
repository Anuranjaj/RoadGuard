import express from 'express';
import { getServices, createService } from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getServices);
router.post('/', protect, authorize('ADMIN'), createService);

export default router;
