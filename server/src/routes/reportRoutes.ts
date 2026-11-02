import { Router } from 'express';
import {
  createReport,
  getReports,
  updateReport,
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

router.use(authenticate);

router.post('/', createReport);
router.get('/', requireAdmin, getReports);
router.patch('/:id', requireAdmin, updateReport);

export default router;
