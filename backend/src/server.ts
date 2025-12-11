import express from 'express';
import path from 'path';
import router from './routes';

const app = express();
const PORT = 3000;

// Set template engine
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// Static (React build gre sem)
app.use(express.static(path.join(process.cwd(), 'public')));

// API routes
app.use(router);

// Page route
app.get('/', (req, res) => {
  res.render('index', { title: 'Express + React' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
