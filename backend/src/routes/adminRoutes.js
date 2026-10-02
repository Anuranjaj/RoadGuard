import express from 'express';
import {
	getAdminAnalytics,
	getAdminComplaints,
	getAdminPartners,
	getAdminRequests,
	getAdminUsers,
	getDashboardMetrics,
	updateAdminUserStatus,
	updatePartnerVerification,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(protect, authorize('ADMIN'));
router.get('/metrics', getDashboardMetrics);
router.get('/users', getAdminUsers);
router.patch('/users/:id/status', validateObjectId('id'), updateAdminUserStatus);
router.get('/partners', getAdminPartners);
router.patch('/partners/:id/verification', validateObjectId('id'), updatePartnerVerification);
router.get('/requests', getAdminRequests);
router.get('/complaints', getAdminComplaints);
router.get('/analytics', getAdminAnalytics);

export default router;
