import type { Express } from "express";
import { createServer, type Server } from "http";
import { getReports, getRecentReports } from "./bigquery";

export function registerRoutes(app: Express): Server {
  // Test route
  app.get("/api/test", (req, res) => {
    res.json({ message: "BigQuery API is working!" });
  });

  // Get reports from BigQuery
  app.get("/api/reports", async (req, res) => {
    try {
      const agency = req.query.agency as string;
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;

      const reports = await getReports(agency, month, year);
      res.json({ reports });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  });

  // Get recent reports from BigQuery
  app.get("/api/reports/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const reports = await getRecentReports(limit);
      res.json({ reports });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Failed to fetch recent reports' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
