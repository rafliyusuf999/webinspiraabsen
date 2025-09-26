import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAttendanceSchema, insertActivityLogSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get client IP helper
  const getClientIP = (req: Request): string => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  };

  // Attendance endpoints
  app.get("/api/attendance", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const branch = (req.query.branch as string) || "";

      const result = await storage.getAttendance(page, limit, search, branch);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  app.get("/api/attendance/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getAttendanceStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.get("/api/attendance/check-duplicate", async (req: Request, res: Response) => {
    try {
      const { type, value, excludeId, nama, sekolah } = req.query;

      let isDuplicate = false;
      
      if (type === 'phone') {
        isDuplicate = await storage.checkDuplicatePhone(value as string, excludeId as string);
      } else if (type === 'instagram') {
        isDuplicate = await storage.checkDuplicateInstagram(value as string, excludeId as string);
      } else if (type === 'nameSchool') {
        isDuplicate = await storage.checkDuplicateNameSchoolToday(nama as string, sekolah as string, excludeId as string);
      }

      res.json({ isDuplicate });
    } catch (error) {
      res.status(500).json({ message: "Failed to check duplicates" });
    }
  });

  app.post("/api/attendance", async (req: Request, res: Response) => {
    try {
      const validatedData = insertAttendanceSchema.parse(req.body);

      // Check for duplicates
      const phoneExists = await storage.checkDuplicatePhone(validatedData.telepon);
      if (phoneExists) {
        return res.status(400).json({ message: "Nomor telepon sudah terdaftar" });
      }

      const instagramExists = await storage.checkDuplicateInstagram(validatedData.instagram);
      if (instagramExists) {
        return res.status(400).json({ message: "Username Instagram sudah terdaftar" });
      }

      const nameSchoolExists = await storage.checkDuplicateNameSchoolToday(validatedData.nama, validatedData.sekolah);
      if (nameSchoolExists) {
        return res.status(400).json({ message: "Nama dan sekolah sudah terdaftar hari ini" });
      }

      const attendance = await storage.createAttendance(validatedData, getClientIP(req));
      res.status(201).json(attendance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create attendance record" });
    }
  });

  app.put("/api/attendance/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = insertAttendanceSchema.partial().parse(req.body);

      // Check for duplicates if phone or instagram is being updated
      if (validatedData.telepon) {
        const phoneExists = await storage.checkDuplicatePhone(validatedData.telepon, id);
        if (phoneExists) {
          return res.status(400).json({ message: "Nomor telepon sudah terdaftar" });
        }
      }

      if (validatedData.instagram) {
        const instagramExists = await storage.checkDuplicateInstagram(validatedData.instagram, id);
        if (instagramExists) {
          return res.status(400).json({ message: "Username Instagram sudah terdaftar" });
        }
      }

      if (validatedData.nama && validatedData.sekolah) {
        const nameSchoolExists = await storage.checkDuplicateNameSchoolToday(validatedData.nama, validatedData.sekolah, id);
        if (nameSchoolExists) {
          return res.status(400).json({ message: "Nama dan sekolah sudah terdaftar hari ini" });
        }
      }

      const updated = await storage.updateAttendance(id, validatedData);
      if (!updated) {
        return res.status(404).json({ message: "Record not found" });
      }

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update attendance record" });
    }
  });

  app.delete("/api/attendance/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAttendance(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Record not found" });
      }

      res.json({ message: "Record deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete attendance record" });
    }
  });

  // Admin endpoints
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const admin = await storage.getAdminByUsername(username);
      if (!admin || admin.isActive !== "true") {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      await storage.updateAdminLastLogin(admin.id);
      
      // Log the login activity
      await storage.createActivityLog({
        adminId: admin.id,
        action: "login",
        details: "Admin login successful",
        ipAddress: getClientIP(req),
        userAgent: req.headers['user-agent'] || ''
      });

      res.json({ 
        message: "Login successful", 
        admin: { id: admin.id, username: admin.username } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Data tidak valid", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/admin/export", async (req: Request, res: Response) => {
    try {
      const branch = req.query.branch as string;
      const { data } = await storage.getAttendance(1, 1000, "", branch);

      // Create CSV content
      const headers = ['No', 'Nama Lengkap', 'Kelas', 'Telepon', 'Instagram', 'Asal Sekolah', 'Kota', 'Provinsi', 'Cabang', 'Waktu Absensi'];
      const csvContent = [
        headers.join(','),
        ...data.map((record, index) => [
          index + 1,
          `"${record.nama}"`,
          `"${record.kelas}"`,
          record.telepon,
          record.instagram,
          `"${record.sekolah}"`,
          `"${record.kota}"`,
          `"${record.provinsi}"`,
          record.cabang,
          new Date(record.createdAt).toLocaleString('id-ID')
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="absensi-inspiranet-${branch || 'semua'}-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\uFEFF' + csvContent); // Add BOM for proper UTF-8 encoding
    } catch (error) {
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  app.post("/api/admin/clear-all", async (req: Request, res: Response) => {
    try {
      await storage.clearAllAttendance();
      res.json({ message: "All data cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
