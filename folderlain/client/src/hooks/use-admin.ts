import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { AdminLoginData } from "@/lib/validations";

export function useAdminLogin() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: adminApi.login,
    onSuccess: (data) => {
      toast({
        title: "Login berhasil!",
        description: `Selamat datang, ${data.admin.username}`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login gagal!",
        description: error.message || "Username atau password salah",
        variant: "destructive",
      });
    },
  });
}

export function useExportData() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: adminApi.exportData,
    onSuccess: async (response, branch) => {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `absensi-inspiranet-${branch || 'semua'}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Berhasil!",
        description: "Data berhasil diexport",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal!",
        description: error.message || "Gagal export data",
        variant: "destructive",
      });
    },
  });
}

export function useClearAllData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: adminApi.clearAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/stats'] });
      toast({
        title: "Berhasil!",
        description: "Semua data berhasil dihapus",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal!",
        description: error.message || "Gagal menghapus semua data",
        variant: "destructive",
      });
    },
  });
}
