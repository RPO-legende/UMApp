import express from 'express';
import path from 'path';
import router from './routes';

// TSOA + SWAGGER 
import { RegisterRoutes }from "./tsoa-routes/routes";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger/swagger.json";

const app = express();
const PORT = 3000;

// Set template engine
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// Body parser (tsoa ga potrebuje)
app.use(express.json());

// Static (React build gre sem)
app.use(express.static(path.join(process.cwd(), 'public')));

// API routes
app.use(router);
// TSOA routes
RegisterRoutes(router);
// Swagger UI
app.use('/api-docs',swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Page route
app.get('/', (req, res) => {
  res.render('index', { title: 'Express + React' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
