import { useState } from "react";
import { useUpdateAttendance, useDeleteAttendance } from "@/hooks/use-attendance";
import { BRANCHES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Attendance } from "@shared/schema";
import type { AttendanceFormData } from "@/lib/validations";

interface DataTableProps {
  data: Attendance[];
  isLoading: boolean;
  total: number;
  page: number;
  onPageChange: (page: number) => void;
}

export default function DataTable({ data, isLoading, total, page, onPageChange }: DataTableProps) {
  const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<AttendanceFormData>>({});
  
  const updateMutation = useUpdateAttendance();
  const deleteMutation = useDeleteAttendance();

  const itemsPerPage = 10;
  const totalPages = Math.ceil(total / itemsPerPage);
  const showingStart = (page - 1) * itemsPerPage + 1;
  const showingEnd = Math.min(page * itemsPerPage, total);

  const handleEdit = (record: Attendance) => {
    setEditingRecord(record);
    setEditFormData({
      nama: record.nama,
      kelas: record.kelas,
      telepon: record.telepon,
      instagram: record.instagram,
      sekolah: record.sekolah,
      kota: record.kota,
      provinsi: record.provinsi,
      cabang: record.cabang,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRecord || !editFormData) return;
    
    try {
      await updateMutation.mutateAsync({
        id: editingRecord.id,
        data: editFormData as AttendanceFormData,
      });
      setEditingRecord(null);
      setEditFormData({});
    } catch (error) {
      console.error("Edit failed:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const getBranchColor = (branch: string) => {
    switch (branch) {
      case 'InspiraNet_Cakrawala_1':
        return 'bg-primary/20 text-primary';
      case 'InspiraNet_Cakrawala_2':
        return 'bg-secondary/20 text-secondary';
      case 'InspiraNet_Cakrawala_3':
        return 'bg-accent/20 text-accent';
      case 'InspiraNet_Cakrawala_4':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  const getBranchName = (branchId: string) => {
    const branch = BRANCHES.find(b => b.id === branchId);
    return branch ? branch.name.replace('InspiraNet ', '') : branchId;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-16 w-full rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-white font-medium">Nama</th>
              <th className="px-4 py-3 text-left text-white font-medium">Kelas</th>
              <th className="px-4 py-3 text-left text-white font-medium">Telepon</th>
              <th className="px-4 py-3 text-left text-white font-medium">Instagram</th>
              <th className="px-4 py-3 text-left text-white font-medium">Sekolah</th>
              <th className="px-4 py-3 text-left text-white font-medium">Kota</th>
              <th className="px-4 py-3 text-left text-white font-medium">Cabang</th>
              <th className="px-4 py-3 text-left text-white font-medium">Waktu</th>
              <th className="px-4 py-3 text-left text-white font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((record) => (
              <tr 
                key={record.id} 
                className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                data-testid={`row-attendance-${record.id}`}
              >
                <td className="px-4 py-3 text-white font-medium" data-testid={`text-name-${record.id}`}>
                  {record.nama}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{record.kelas}</td>
                <td className="px-4 py-3 text-muted-foreground">{record.telepon}</td>
                <td className="px-4 py-3 text-muted-foreground">@{record.instagram}</td>
                <td className="px-4 py-3 text-muted-foreground">{record.sekolah}</td>
                <td className="px-4 py-3 text-muted-foreground">{record.kota}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getBranchColor(record.cabang)}`}>
                    {getBranchName(record.cabang)}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {new Date(record.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    {/* Edit Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(record)}
                          className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border-blue-600/30"
                          data-testid={`button-edit-${record.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card border-white/10">
                        <DialogHeader>
                          <DialogTitle className="text-white">Edit Data Siswa</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-nama" className="text-white">Nama Lengkap</Label>
                              <Input
                                id="edit-nama"
                                value={editFormData.nama || ""}
                                onChange={(e) => setEditFormData({...editFormData, nama: e.target.value})}
                                className="bg-white/5 border-white/20 text-white"
                                data-testid="input-edit-nama"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-kelas" className="text-white">Kelas</Label>
                              <Input
                                id="edit-kelas"
                                value={editFormData.kelas || ""}
                                onChange={(e) => setEditFormData({...editFormData, kelas: e.target.value})}
                                className="bg-white/5 border-white/20 text-white"
                                data-testid="input-edit-kelas"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-telepon" className="text-white">Telepon</Label>
                              <Input
                                id="edit-telepon"
                                value={editFormData.telepon || ""}
                                onChange={(e) => setEditFormData({...editFormData, telepon: e.target.value})}
                                className="bg-white/5 border-white/20 text-white"
                                data-testid="input-edit-telepon"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-instagram" className="text-white">Instagram</Label>
                              <Input
                                id="edit-instagram"
                                value={editFormData.instagram || ""}
                                onChange={(e) => setEditFormData({...editFormData, instagram: e.target.value})}
                                className="bg-white/5 border-white/20 text-white"
                                data-testid="input-edit-instagram"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-sekolah" className="text-white">Sekolah</Label>
                              <Input
                                id="edit-sekolah"
                                value={editFormData.sekolah || ""}
                                onChange={(e) => setEditFormData({...editFormData, sekolah: e.target.value})}
                                className="bg-white/5 border-white/20 text-white"
                                data-testid="input-edit-sekolah"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-kota" className="text-white">Kota</Label>
                              <Input
                                id="edit-kota"
                                value={editFormData.kota || ""}
                                onChange={(e) => setEditFormData({...editFormData, kota: e.target.value})}
                                className="bg-white/5 border-white/20 text-white"
                                data-testid="input-edit-kota"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-4 mt-6">
                            <Button
                              variant="outline"
                              onClick={() => setEditingRecord(null)}
                              className="bg-white/10 hover:bg-white/20 border-white/20"
                              data-testid="button-cancel-edit"
                            >
                              Batal
                            </Button>
                            <Button
                              onClick={handleSaveEdit}
                              disabled={updateMutation.isPending}
                              className="bg-gradient-to-r from-primary to-secondary"
                              data-testid="button-save-edit"
                            >
                              {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Delete Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border-red-600/30"
                          data-testid={`button-delete-${record.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data {record.nama}? 
                            Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(record.id)}
                            className="bg-red-600 hover:bg-red-700"
                            data-testid={`button-confirm-delete-${record.id}`}
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-muted-foreground">
          Menampilkan {showingStart}-{showingEnd} dari {total} data
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="bg-white/10 hover:bg-white/20 border-white/20"
            data-testid="button-prev-page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
            return (
              <Button
                key={pageNum}
                size="sm"
                variant={page === pageNum ? "default" : "outline"}
                onClick={() => onPageChange(pageNum)}
                className={
                  page === pageNum
                    ? "bg-primary hover:bg-primary/80"
                    : "bg-white/10 hover:bg-white/20 border-white/20"
                }
                data-testid={`button-page-${pageNum}`}
              >
                {pageNum}
              </Button>
            );
          })}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="bg-white/10 hover:bg-white/20 border-white/20"
            data-testid="button-next-page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
