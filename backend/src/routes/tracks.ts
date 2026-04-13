import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db';
import { uploadToS3 } from '../s3';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// GET /api/tracks
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tracks ORDER BY recorded_at DESC, uploaded_at DESC'
    );
    const tracks = (rows as any[]).map((row) => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      album: row.album,
      duration: row.duration,
      recordedAt: row.recorded_at,
      uploadedAt: row.uploaded_at,
      audioUrl: row.audio_url,
      coverUrl: row.cover_url,
      members: row.members,
      playCount: row.play_count,
    }));
    res.json(tracks);
  } catch (err) {
    console.error('트랙 목록 로드 실패:', err);
    res.status(500).json({ error: '트랙 목록 로드 실패' });
  }
});

// POST /api/tracks
router.post(
  '/',
  upload.fields([{ name: 'audio', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { title, artist, recordedAt, members } = req.body;

      if (!title || !artist || !recordedAt) {
        res.status(400).json({ error: '필수 항목(제목, 아티스트, 녹음일)을 입력해주세요.' });
        return;
      }

      const files = req.files as Record<string, Express.Multer.File[]>;
      const audioFile = files?.audio?.[0];

      if (!audioFile) {
        res.status(400).json({ error: 'mp3 파일을 첨부해주세요.' });
        return;
      }

      const id = uuidv4();

      // Upload audio to S3
      const audioKey = `audio/${id}.mp3`;
      const audioUrl = await uploadToS3(audioKey, audioFile.buffer, 'audio/mpeg');

      // Parse members JSON string
      let parsedMembers = [];
      if (members) {
        try {
          parsedMembers = typeof members === 'string' ? JSON.parse(members) : members;
        } catch {
          res.status(400).json({ error: 'members 형식이 올바르지 않습니다.' });
          return;
        }
      }

      await pool.query(
        `INSERT INTO tracks (id, title, artist, album, duration, recorded_at, audio_url, cover_url, members)
         VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)`,
        [id, title, artist, '-', recordedAt, audioUrl, null, JSON.stringify(parsedMembers)]
      );

      res.status(201).json({ id });
    } catch (err) {
      console.error('곡 추가 실패:', err);
      res.status(500).json({ error: '곡 추가에 실패했습니다.' });
    }
  }
);

// PATCH /api/tracks/:id — Lambda가 앨범명/커버 이미지 업데이트할 때 사용
router.patch('/:id', async (req, res) => {
  try {
    const { album, coverUrl } = req.body;
    if (!album && !coverUrl) {
      res.status(400).json({ error: '업데이트할 항목이 없습니다.' });
      return;
    }

    const fields: string[] = [];
    const values: any[] = [];
    if (album)    { fields.push('album = ?');     values.push(album); }
    if (coverUrl) { fields.push('cover_url = ?'); values.push(coverUrl); }
    values.push(req.params.id);

    await pool.query(`UPDATE tracks SET ${fields.join(', ')} WHERE id = ?`, values);
    res.sendStatus(204);
  } catch (err) {
    console.error('트랙 업데이트 실패:', err);
    res.status(500).json({ error: '트랙 업데이트 실패' });
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
