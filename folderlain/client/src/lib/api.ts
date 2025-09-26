import { apiRequest } from "./queryClient";
import type { AttendanceFormData, AdminLoginData } from "./validations";
import type { Attendance } from "@shared/schema";

export const attendanceApi = {
  getList: async (params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    branch?: string; 
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.branch) searchParams.set('branch', params.branch);
    
    const response = await apiRequest('GET', `/api/attendance?${searchParams}`);
    return response.json() as Promise<{ data: Attendance[]; total: number }>;
  },

  getStats: async () => {
    const response = await apiRequest('GET', '/api/attendance/stats');
    return response.json() as Promise<{
      total: number;
      today: number;
      thisWeek: number;
      activeBranches: number;
      byBranch: Record<string, number>;
      dailyStats: Array<{ date: string; count: number }>;
    }>;
  },

  checkDuplicate: async (type: 'phone' | 'instagram' | 'nameSchool', params: {
    value?: string;
    excludeId?: string;
    nama?: string;
    sekolah?: string;
  }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('type', type);
    if (params.value) searchParams.set('value', params.value);
    if (params.excludeId) searchParams.set('excludeId', params.excludeId);
    if (params.nama) searchParams.set('nama', params.nama);
    if (params.sekolah) searchParams.set('sekolah', params.sekolah);

    const response = await apiRequest('GET', `/api/attendance/check-duplicate?${searchParams}`);
    return response.json() as Promise<{ isDuplicate: boolean }>;
  },

  create: async (data: AttendanceFormData) => {
    const response = await apiRequest('POST', '/api/attendance', data);
    return response.json() as Promise<Attendance>;
  },

  update: async (id: string, data: Partial<AttendanceFormData>) => {
    const response = await apiRequest('PUT', `/api/attendance/${id}`, data);
    return response.json() as Promise<Attendance>;
  },

  delete: async (id: string) => {
    const response = await apiRequest('DELETE', `/api/attendance/${id}`);
    return response.json() as Promise<{ message: string }>;
  },
};

export const adminApi = {
  login: async (data: AdminLoginData) => {
    const response = await apiRequest('POST', '/api/admin/login', data);
    return response.json() as Promise<{ message: string; admin: { id: string; username: string } }>;
  },

  exportData: async (branch?: string) => {
    const searchParams = new URLSearchParams();
    if (branch) searchParams.set('branch', branch);
    
    const response = await apiRequest('GET', `/api/admin/export?${searchParams}`);
    return response;
  },

  clearAll: async () => {
    const response = await apiRequest('POST', '/api/admin/clear-all');
    return response.json() as Promise<{ message: string }>;
  },
};
