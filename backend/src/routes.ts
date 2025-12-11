import { Router } from 'express';

const router = Router();

// Simple API
router.get('/api/hello', (req, res) => {
  res.json({ msg: 'Hello from API!' });
});

export default router;
