import { z } from "zod";

export const attendanceFormSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter").regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh berisi huruf dan spasi"),
  kelas: z.string().min(1, "Kelas wajib diisi"),
  telepon: z.string().regex(/^(\+62|08)[0-9]{8,12}$/, "Format nomor telepon tidak valid"),
  instagram: z.string().min(3, "Username Instagram minimal 3 karakter").max(30, "Username Instagram maksimal 30 karakter").regex(/^[a-zA-Z0-9._]+$/, "Username Instagram hanya boleh berisi huruf, angka, titik, dan garis bawah"),
  sekolah: z.string().min(1, "Asal sekolah wajib diisi"),
  kota: z.string().min(1, "Kota wajib diisi"),
  provinsi: z.string().min(1, "Provinsi wajib dipilih"),
  cabang: z.string().min(1, "Cabang wajib dipilih"),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type AttendanceFormData = z.infer<typeof attendanceFormSchema>;
export type AdminLoginData = z.infer<typeof adminLoginSchema>;
