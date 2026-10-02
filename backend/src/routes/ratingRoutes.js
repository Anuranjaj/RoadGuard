import express from 'express';
import { getRatings, submitRating } from '../controllers/ratingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getRatings);
router.post('/', submitRating);

export default router;
