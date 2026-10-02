import express from 'express';
import { createVehicle, deleteVehicle, getVehicles, updateVehicle } from '../controllers/vehicleController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getVehicles);
router.post('/', createVehicle);
router.put('/:id', validateObjectId('id'), updateVehicle);
router.delete('/:id', validateObjectId('id'), deleteVehicle);

export default router;
