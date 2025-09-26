import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { attendanceFormSchema, type AttendanceFormData } from "@/lib/validations";
import { useCreateAttendance, useCheckDuplicate } from "@/hooks/use-attendance";
import { BRANCHES, PROVINCES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle } from "lucide-react";

export default function AttendanceForm() {
  const [selectedBranch, setSelectedBranch] = useState("");
  
  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      nama: "",
      kelas: "",
      telepon: "",
      instagram: "",
      sekolah: "",
      kota: "",
      provinsi: "",
      cabang: "",
    },
  });

  const createMutation = useCreateAttendance();
  const checkDuplicateMutation = useCheckDuplicate();

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranch(branchId);
    form.setValue("cabang", branchId);
  };

  const onSubmit = async (data: AttendanceFormData) => {
    // Check for duplicates before submitting
    try {
      const [phoneCheck, instagramCheck, nameSchoolCheck] = await Promise.all([
        checkDuplicateMutation.mutateAsync({ type: 'phone', params: { value: data.telepon } }),
        checkDuplicateMutation.mutateAsync({ type: 'instagram', params: { value: data.instagram } }),
        checkDuplicateMutation.mutateAsync({ type: 'nameSchool', params: { nama: data.nama, sekolah: data.sekolah } }),
      ]);

      if (phoneCheck.isDuplicate) {
        form.setError("telepon", { message: "Nomor telepon sudah terdaftar" });
        return;
      }

      if (instagramCheck.isDuplicate) {
        form.setError("instagram", { message: "Username Instagram sudah terdaftar" });
        return;
      }

      if (nameSchoolCheck.isDuplicate) {
        form.setError("nama", { message: "Nama dan sekolah sudah terdaftar hari ini" });
        return;
      }

      // Submit if no duplicates found
      await createMutation.mutateAsync(data);
      
      // Reset form on success
      form.reset();
      setSelectedBranch("");
    } catch (error) {
      console.error("Error during submission:", error);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8 animate-slide-up">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Lengkap */}
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem className="input-floating-label">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder=" "
                      className="w-full px-3 py-4 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-white"
                      data-testid="input-nama"
                    />
                  </FormControl>
                  <FormLabel className="text-muted-foreground">Nama Lengkap</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kelas */}
            <FormField
              control={form.control}
              name="kelas"
              render={({ field }) => (
                <FormItem className="input-floating-label">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder=" "
                      className="w-full px-3 py-4 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-white"
                      data-testid="input-kelas"
                    />
                  </FormControl>
                  <FormLabel className="text-muted-foreground">Kelas</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nomor Telepon */}
            <FormField
              control={form.control}
              name="telepon"
              render={({ field }) => (
                <FormItem className="input-floating-label">
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder=" "
                      className="w-full px-3 py-4 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-white"
                      data-testid="input-telepon"
                    />
                  </FormControl>
                  <FormLabel className="text-muted-foreground">Nomor Telepon</FormLabel>
                  <div className="text-xs text-muted-foreground mt-1">Format: +62/08xxxxxxxxx</div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Username Instagram */}
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem className="input-floating-label">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder=" "
                      className="w-full px-3 py-4 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-white"
                      data-testid="input-instagram"
                    />
                  </FormControl>
                  <FormLabel className="text-muted-foreground">Username Instagram</FormLabel>
                  <div className="text-xs text-muted-foreground mt-1">Tanpa simbol @</div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Asal Sekolah */}
            <FormField
              control={form.control}
              name="sekolah"
              render={({ field }) => (
                <FormItem className="input-floating-label">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder=" "
                      className="w-full px-3 py-4 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-white"
                      data-testid="input-sekolah"
                    />
                  </FormControl>
                  <FormLabel className="text-muted-foreground">Asal Sekolah</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kota */}
            <FormField
              control={form.control}
              name="kota"
              render={({ field }) => (
                <FormItem className="input-floating-label">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder=" "
                      className="w-full px-3 py-4 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-white"
                      data-testid="input-kota"
                    />
                  </FormControl>
                  <FormLabel className="text-muted-foreground">Kota</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Provinsi */}
            <div className="col-span-1 md:col-span-2">
              <FormField
                control={form.control}
                name="provinsi"
                render={({ field }) => (
                  <FormItem className="input-floating-label">
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger 
                          className="w-full px-3 py-4 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-white"
                          data-testid="select-provinsi"
                        >
                          <SelectValue placeholder="Pilih Provinsi" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVINCES.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormLabel className="text-muted-foreground">Provinsi</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Branch Selection */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Pilih Cabang InspiraNet Cakrawala</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BRANCHES.map((branch) => (
                <div
                  key={branch.id}
                  className={`branch-option rounded-xl p-4 cursor-pointer ${
                    selectedBranch === branch.id ? 'selected' : ''
                  }`}
                  onClick={() => handleBranchSelect(branch.id)}
                  data-testid={`branch-${branch.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                        selectedBranch === branch.id 
                          ? 'bg-primary border-primary' 
                          : 'border-white/30'
                      }`}
                    ></div>
                    <div>
                      <div className="font-medium text-white">{branch.name}</div>
                      <div className="text-sm text-muted-foreground">{branch.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {form.formState.errors.cabang && (
              <p className="text-destructive text-sm mt-2">{form.formState.errors.cabang.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-8">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-primary to-secondary px-8 py-4 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-primary/25 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              data-testid="button-submit"
            >
              <CheckCircle className="w-5 h-5" />
              <span>
                {createMutation.isPending ? 'Menyimpan...' : 'Submit Absensi'}
              </span>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
