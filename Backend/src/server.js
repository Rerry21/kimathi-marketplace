import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import pool from "./config/db.js";
import { buildCorsOptions, describeCors } from "./config/cors.js";
import { hideServerErrors, notFound, errorHandler } from "./middleware/errors.js";
import listingsRoutes from "./routes/listings.routes.js";
import authRoutes from "./routes/auth.routes.js";
import messagesRoutes from "./routes/messages.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import usersRoutes from "./routes/users.routes.js";
import appealsRoutes from "./routes/appeals.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();

const app = express();

const proxyHops = Number(process.env.TRUST_PROXY);
if (Number.isInteger(proxyHops) && proxyHops > 0) {
  app.set("trust proxy", proxyHops);
}

app.use(helmet());
app.use(cors(buildCorsOptions()));
app.use(hideServerErrors);
app.use(express.json({ limit: "100kb" }));

app.get("/", (req, res) => {
  res.send("Kimathi Marketplace API is running");
});

app.get("/db-test", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use("/listings", listingsRoutes);
app.use("/auth", authRoutes);
app.use("/messages", messagesRoutes);
app.use("/upload", uploadRoutes);
app.use("/reports", reportsRoutes);
app.use("/users", usersRoutes);
app.use("/appeals", appealsRoutes);
app.use("/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(describeCors());
});