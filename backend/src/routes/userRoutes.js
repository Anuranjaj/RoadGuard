import express from 'express';
import { getUsers, getUserById } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', authorize('ADMIN'), getUsers);
router.get('/:id', getUserById);

export default router;
