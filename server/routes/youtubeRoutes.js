import { Router } from 'express';
import { searchYouTube } from '../controllers/youtubeController.js';

const router = Router();

router.get('/search', searchYouTube);

export default router;
