import { Router } from 'express';
import { bestArtists, getTrackById, popularTracks, searchTracks } from '../controllers/jamendoController.js';

const router = Router();

router.get('/search', searchTracks);
router.get('/popular', popularTracks);
router.get('/artists-best', bestArtists);
router.get('/track', getTrackById);

export default router;
