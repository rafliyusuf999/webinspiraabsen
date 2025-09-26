import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { AttendanceFormData } from "@/lib/validations";

export function useAttendanceList(params?: { 
  page?: number; 
  limit?: number; 
  search?: string; 
  branch?: string; 
}) {
  return useQuery({
    queryKey: ['/api/attendance', params],
    queryFn: () => attendanceApi.getList(params),
  });
}

export function useAttendanceStats() {
  return useQuery({
    queryKey: ['/api/attendance/stats'],
    queryFn: () => attendanceApi.getStats(),
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: attendanceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/stats'] });
      toast({
        title: "Berhasil!",
        description: "Data absensi berhasil disimpan",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal!",
        description: error.message || "Gagal menyimpan data absensi",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AttendanceFormData> }) =>
      attendanceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/stats'] });
      toast({
        title: "Berhasil!",
        description: "Data berhasil diperbarui",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal!",
        description: error.message || "Gagal memperbarui data",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: attendanceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/stats'] });
      toast({
        title: "Berhasil!",
        description: "Data berhasil dihapus",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal!",
        description: error.message || "Gagal menghapus data",
        variant: "destructive",
      });
    },
  });
}

export function useCheckDuplicate() {
  return useMutation({
    mutationFn: ({ type, params }: { type: 'phone' | 'instagram' | 'nameSchool', params: {
      value?: string;
      excludeId?: string;
      nama?: string;
      sekolah?: string;
    } }) => attendanceApi.checkDuplicate(type, params),
  });
}
