import express from 'express';
import {
  acceptRequest,
  cancelRequest,
  createServiceRequest,
  getActiveRequests,
  getMyServiceRequests,
  getServiceRequestById,
  passRequest,
  updateAdditionalCharges,
  updateServiceRequestStatus,
} from '../controllers/serviceRequestController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateObjectId, validateServiceRequestStatus } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyServiceRequests);
router.post('/', createServiceRequest);
router.get('/active', authorize('ADMIN'), getActiveRequests);
router.patch('/:id/charges', validateObjectId('id'), authorize('PARTNER'), updateAdditionalCharges);
router.get('/:id', validateObjectId('id'), getServiceRequestById);
router.post('/:id/accept', validateObjectId('id'), authorize('PARTNER'), acceptRequest);
router.post('/:id/pass', validateObjectId('id'), authorize('PARTNER'), passRequest);
router.post('/:id/cancel', validateObjectId('id'), cancelRequest);
router.patch('/:id/status', validateObjectId('id'), validateServiceRequestStatus, updateServiceRequestStatus);

export default router;
