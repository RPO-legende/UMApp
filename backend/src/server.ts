import express from "express";
import path from "path";
import { Router } from "express";
import fssync from "fs"
import { getFileAbsById } from "./storage/storage"
import { passport } from "./auth/passport";


const router = Router();
// TSOA + SWAGGER
import { RegisterRoutes } from "./tsoa-routes/routes";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger/swagger.json";

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Set template engine
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// Body parser (tsoa ga potrebuje)
app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

// Static (React build gre sem)
app.use(express.static(path.join(process.cwd(), "public")));

//download file
app.get("/api/notes/:id/download", async (req, res) => {
  const id = req.params.id
  const found = await getFileAbsById(id) 
  if (!found) return res.status(404).send("Not found")
  const { meta, fileAbs } = found
  res.setHeader("Content-Type", meta.mimeType)
  res.setHeader("Content-Disposition", `attachment; filename="${meta.originalFilename}"`)
  fssync.createReadStream(fileAbs).pipe(res)
})
// API routes
app.use("/api",router);
// TSOA routes
RegisterRoutes(router);
// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling middleware for API routes
app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

// Serve React app for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
