import express from 'express';
import { getImpactStatistics } from '../controllers/impactController.js';

const router = express.Router();

router.get('/', getImpactStatistics);

export default router;
