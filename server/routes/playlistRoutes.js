import { Router } from 'express';
import { addTrack, createPlaylist, getPlaylists, removeTrack } from '../controllers/playlistController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', getPlaylists);
router.post('/', createPlaylist);
router.post('/:playlistId/tracks', addTrack);
router.delete('/:playlistId/tracks/:trackId', removeTrack);

export default router;
