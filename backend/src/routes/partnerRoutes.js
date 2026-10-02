import express from 'express';
import {
	createPayoutRequest,
	getNearbyPartners,
	getMyPartnerProfile,
	getMyPayoutRequests,
	getPartners,
	updateMyAvailability,
	updateMyPartnerProfile,
} from '../controllers/partnerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, authorize('PARTNER'), getMyPartnerProfile);
router.patch('/me', protect, authorize('PARTNER'), updateMyPartnerProfile);
router.patch('/me/availability', protect, authorize('PARTNER'), updateMyAvailability);
router.get('/me/payouts', protect, authorize('PARTNER'), getMyPayoutRequests);
router.post('/me/payouts', protect, authorize('PARTNER'), createPayoutRequest);
router.get('/', protect, authorize('ADMIN'), getPartners);
router.get('/nearby', protect, getNearbyPartners);

export default router;
