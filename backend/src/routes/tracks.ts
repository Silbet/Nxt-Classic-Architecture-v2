import { Router } from 'express';
import { pool } from '../db';

const router = Router();

// GET /api/tracks
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tracks ORDER BY recorded_at DESC, uploaded_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: '트랙 목록 로드 실패' });
  }
});

// POST /api/tracks/:id/play
router.post('/:id/play', async (req, res) => {
  try {
    await pool.query(
      'UPDATE tracks SET play_count = play_count + 1 WHERE id = ?',
      [req.params.id]
    );
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: '조회수 업데이트 실패' });
  }
});

export default router;
