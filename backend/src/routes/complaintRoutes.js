import express from 'express';
import { createComplaint, getComplaints, updateComplaint } from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getComplaints);
router.post('/', createComplaint);
router.patch('/:id', validateObjectId('id'), authorize('ADMIN'), updateComplaint);

export default router;
