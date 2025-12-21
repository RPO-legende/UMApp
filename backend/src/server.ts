import express from "express";
import path from "path";
import { Router } from "express";
import fssync from "fs"
import { getFileAbsById } from "./storage/storage"


const router = Router();
// TSOA + SWAGGER
import { RegisterRoutes } from "./tsoa-routes/routes";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger/swagger.json";

const app = express();
const PORT = 3000;

// Set template engine
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// Body parser (tsoa ga potrebuje)
app.use(express.json());

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
// Page route
app.get("/", (req, res) => {
  res.render("index", { title: "Express + React" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
