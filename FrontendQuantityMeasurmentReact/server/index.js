import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Proxy to Java Backend
  app.all("/api/*", async (req, res) => {
    const targetHost = process.env.VITE_API_BASE_URL || "http://localhost:8080";
    const targetPath = req.url.replace(/^\/api/, "");
    const targetUrl = `${targetHost}${targetPath}`;

    console.log(`Proxying ${req.method} ${req.url} -> ${targetUrl}`);

    try {
      const fetchOptions = {
        method: req.method,
        headers: {
          "Content-Type": "application/json",
          ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
        },
      };

      if (!["GET", "HEAD"].includes(req.method)) {
        fetchOptions.body = JSON.stringify(req.body);
      }

      const response = await fetch(targetUrl, fetchOptions);
      const contentType = response.headers.get("content-type");
      const text = await response.text();

      if (contentType && contentType.includes("application/json")) {
        try {
          return res.status(response.status).json(JSON.parse(text));
        } catch (e) {
          return res.status(response.status).send(text);
        }
      }
      
      res.status(response.status).send(text);
    } catch (error) {
      console.error("Proxy Error:", error);
      res.status(500).json({ error: "Proxy Error", message: error.message });
    }
  });

  return app;
}
