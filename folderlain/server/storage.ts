import { type Attendance, type InsertAttendance, type AdminUser, type InsertAdminUser, type ActivityLog, type InsertActivityLog } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // Attendance methods
  getAttendance(page?: number, limit?: number, search?: string, branch?: string): Promise<{ data: Attendance[], total: number }>;
  getAttendanceById(id: string): Promise<Attendance | undefined>;
  createAttendance(attendance: InsertAttendance, ipAddress?: string): Promise<Attendance>;
  updateAttendance(id: string, attendance: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  deleteAttendance(id: string): Promise<boolean>;
  clearAllAttendance(): Promise<boolean>;
  checkDuplicatePhone(phone: string, excludeId?: string): Promise<boolean>;
  checkDuplicateInstagram(instagram: string, excludeId?: string): Promise<boolean>;
  checkDuplicateNameSchoolToday(nama: string, sekolah: string, excludeId?: string): Promise<boolean>;
  getAttendanceStats(): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    activeBranches: number;
    byBranch: Record<string, number>;
    dailyStats: Array<{ date: string; count: number }>;
  }>;
  
  // Admin methods
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  createAdmin(admin: InsertAdminUser): Promise<AdminUser>;
  updateAdminLastLogin(id: string): Promise<void>;
  
  // Activity log methods
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
}

export class MemStorage implements IStorage {
  private attendanceRecords: Map<string, Attendance>;
  private admins: Map<string, AdminUser>;
  private activityLogs: Map<string, ActivityLog>;

  constructor() {
    this.attendanceRecords = new Map();
    this.admins = new Map();
    this.activityLogs = new Map();
    
    // Create default admin user
    this.initializeDefaultAdmin();
  }

  private async initializeDefaultAdmin() {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin: AdminUser = {
      id: randomUUID(),
      username: "admin",
      password: hashedPassword,
      lastLogin: null,
      isActive: "true"
    };
    this.admins.set(admin.id, admin);
  }

  async getAttendance(page = 1, limit = 10, search = "", branch = ""): Promise<{ data: Attendance[], total: number }> {
    let filtered = Array.from(this.attendanceRecords.values());
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(record => 
        record.nama.toLowerCase().includes(searchLower) ||
        record.sekolah.toLowerCase().includes(searchLower) ||
        record.kota.toLowerCase().includes(searchLower)
      );
    }
    
    if (branch) {
      filtered = filtered.filter(record => record.cabang === branch);
    }
    
    // Sort by created date descending
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);
    
    return { data, total };
  }

  async getAttendanceById(id: string): Promise<Attendance | undefined> {
    return this.attendanceRecords.get(id);
  }

  async createAttendance(insertAttendance: InsertAttendance, ipAddress?: string): Promise<Attendance> {
    const id = randomUUID();
    const attendance: Attendance = {
      ...insertAttendance,
      id,
      ipAddress: ipAddress || null,
      createdAt: new Date(),
    };
    this.attendanceRecords.set(id, attendance);
    return attendance;
  }

  async updateAttendance(id: string, updateData: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const existing = this.attendanceRecords.get(id);
    if (!existing) return undefined;
    
    const updated: Attendance = { ...existing, ...updateData };
    this.attendanceRecords.set(id, updated);
    return updated;
  }

  async deleteAttendance(id: string): Promise<boolean> {
    return this.attendanceRecords.delete(id);
  }

  async clearAllAttendance(): Promise<boolean> {
    this.attendanceRecords.clear();
    return true;
  }

  async checkDuplicatePhone(phone: string, excludeId?: string): Promise<boolean> {
    return Array.from(this.attendanceRecords.values()).some(
      record => record.telepon === phone && record.id !== excludeId
    );
  }

  async checkDuplicateInstagram(instagram: string, excludeId?: string): Promise<boolean> {
    return Array.from(this.attendanceRecords.values()).some(
      record => record.instagram === instagram && record.id !== excludeId
    );
  }

  async checkDuplicateNameSchoolToday(nama: string, sekolah: string, excludeId?: string): Promise<boolean> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    return Array.from(this.attendanceRecords.values()).some(record => {
      const recordDate = new Date(record.createdAt);
      return record.nama === nama && 
             record.sekolah === sekolah && 
             recordDate >= startOfDay && 
             recordDate < endOfDay &&
             record.id !== excludeId;
    });
  }

  async getAttendanceStats(): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    activeBranches: number;
    byBranch: Record<string, number>;
    dailyStats: Array<{ date: string; count: number }>;
  }> {
    const records = Array.from(this.attendanceRecords.values());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const todayRecords = records.filter(r => new Date(r.createdAt) >= today);
    const weekRecords = records.filter(r => new Date(r.createdAt) >= weekAgo);
    
    const byBranch: Record<string, number> = {};
    const branches = new Set<string>();
    
    records.forEach(record => {
      branches.add(record.cabang);
      byBranch[record.cabang] = (byBranch[record.cabang] || 0) + 1;
    });
    
    // Daily stats for the last 7 days
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const count = records.filter(r => {
        const recordDate = new Date(r.createdAt);
        return recordDate >= date && recordDate < nextDate;
      }).length;
      
      dailyStats.push({
        date: date.toLocaleDateString('id-ID', { weekday: 'short' }),
        count
      });
    }
    
    return {
      total: records.length,
      today: todayRecords.length,
      thisWeek: weekRecords.length,
      activeBranches: branches.size,
      byBranch,
      dailyStats
    };
  }

  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.username === username);
  }

  async createAdmin(insertAdmin: InsertAdminUser): Promise<AdminUser> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertAdmin.password, 10);
    const admin: AdminUser = {
      ...insertAdmin,
      id,
      password: hashedPassword,
      lastLogin: null,
      isActive: "true"
    };
    this.admins.set(id, admin);
    return admin;
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    const admin = this.admins.get(id);
    if (admin) {
      admin.lastLogin = new Date();
      this.admins.set(id, admin);
    }
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = randomUUID();
    const log: ActivityLog = {
      ...insertLog,
      id,
      details: insertLog.details || null,
      ipAddress: insertLog.ipAddress || null,
      userAgent: insertLog.userAgent || null,
      createdAt: new Date(),
    };
    this.activityLogs.set(id, log);
    return log;
  }
}

export const storage = new MemStorage();
