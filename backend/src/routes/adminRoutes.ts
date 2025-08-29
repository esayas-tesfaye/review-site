import { Router } from 'express';
import { protect, checkRole } from '../middleware/authMiddleware';
import { Role } from '@prisma/client';
import { getAllServicesForAdmin, approveService, rejectService, getAllUsers, promoteUserToAdmin } from '../controllers/adminController';

const router = Router();

// All routes in this file are protected and for admins only
router.use(protect, checkRole([Role.ADMIN]));

router.get('/services', getAllServicesForAdmin);
router.patch('/services/:id/approve', approveService);
router.patch('/services/:id/reject', rejectService);

router.get('/users', getAllUsers);
router.patch('/users/:id/promote', promoteUserToAdmin);

export default router;