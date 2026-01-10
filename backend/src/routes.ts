import { Router } from 'express';
import sql from './db';

const router = Router();

// Simple API
router.get('/api/hello', (req, res) => {
  res.json({ msg: 'Hello from API!' });
});

// Get all faculties
router.get('/api/faculties', async (req, res) => {
  try {
    const faculties = await sql`SELECT * FROM RPO_Projekt.faculty ORDER BY faculty_id`;
    res.json(faculties);
  } catch (error) {
    console.error('Error fetching faculties:', error);
    res.status(500).json({ error: 'Failed to fetch faculties' });
  }
});

// Add a new faculty
router.post('/api/faculties', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Faculty name is required' });
    }
    const [newFaculty] = await sql`
      INSERT INTO RPO_Projekt.faculty (name) 
      VALUES (${name}) 
      RETURNING *
    `;
    res.status(201).json(newFaculty);
  } catch (error) {
    console.error('Error creating faculty:', error);
    res.status(500).json({ error: 'Failed to create faculty' });
  }
});

export default router;
