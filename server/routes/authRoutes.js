
import { Router } from 'express';
import { resolveEmailByUsername } from '../controllers/authController.js';

const router = Router();

router.get('/email-by-username', resolveEmailByUsername);

export default router;
