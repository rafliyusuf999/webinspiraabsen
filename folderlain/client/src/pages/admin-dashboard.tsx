import { useState, useEffect } from "react";
import { Link } from "wouter";
import AdminLogin from "@/components/admin-login";
import DataTable from "@/components/data-table";
import Charts from "@/components/charts";
import { useAttendanceStats, useAttendanceList } from "@/hooks/use-attendance";
import { useExportData, useClearAllData } from "@/hooks/use-admin";
import { GraduationCap, Users, Calendar, TrendingUp, Building, LogOut, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BRANCHES } from "@/lib/constants";
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

export default function AdminDashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [syncCountdown, setSyncCountdown] = useState(10);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data: stats, isLoading: statsLoading } = useAttendanceStats();
  const { data: attendanceData, isLoading: dataLoading, refetch } = useAttendanceList({
    page,
    limit: 10,
    search,
    branch: branchFilter === "all" ? "" : branchFilter,
  });

  const exportMutation = useExportData();
  const clearAllMutation = useClearAllData();

  // Auto-sync countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncCountdown((prev) => {
        if (prev <= 1) {
          if (isLoggedIn) {
            refetch();
          }
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, refetch]);

  const handleExport = (branch?: string) => {
    const exportBranch = branch === "all" ? undefined : branch;
    exportMutation.mutate(exportBranch);
  };

  const handleClearAll = () => {
    clearAllMutation.mutate();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="text-primary text-2xl" />
                <h1 className="text-xl font-bold text-white">InspiraNet Cakrawala - Admin</h1>
              </div>
              <div className="hidden md:flex items-center space-x-1 text-sm text-muted-foreground">
                <span className="status-indicator status-syncing"></span>
                <span>Auto-sync dalam {syncCountdown}s</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm" data-testid="button-student-view">
                  <Users className="mr-2 h-4 w-4" />
                  Siswa
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white">Dashboard Admin</h2>
              <p className="text-muted-foreground">Kelola data absensi siswa InspiraNet Cakrawala</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Siswa</p>
                  <p className="text-3xl font-bold text-white" data-testid="text-admin-total">
                    {statsLoading ? (
                      <div className="skeleton h-8 w-16 rounded"></div>
                    ) : (
                      stats?.total || 0
                    )}
                  </p>
                  <p className="text-green-400 text-sm mt-1">Semua cabang</p>
                </div>
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Users className="text-primary text-xl" />
                </div>
              </div>
            </div>
            
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Absensi Hari Ini</p>
                  <p className="text-3xl font-bold text-white" data-testid="text-admin-today">
                    {statsLoading ? (
                      <div className="skeleton h-8 w-12 rounded"></div>
                    ) : (
                      stats?.today || 0
                    )}
                  </p>
                  <p className="text-secondary text-sm mt-1">Dalam 24 jam terakhir</p>
                </div>
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <Calendar className="text-secondary text-xl" />
                </div>
              </div>
            </div>
            
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Minggu Ini</p>
                  <p className="text-3xl font-bold text-white" data-testid="text-admin-week">
                    {statsLoading ? (
                      <div className="skeleton h-8 w-16 rounded"></div>
                    ) : (
                      stats?.thisWeek || 0
                    )}
                  </p>
                  <p className="text-accent text-sm mt-1">7 hari terakhir</p>
                </div>
                <div className="p-3 bg-accent/20 rounded-lg">
                  <TrendingUp className="text-accent text-xl" />
                </div>
              </div>
            </div>
            
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Cabang Aktif</p>
                  <p className="text-3xl font-bold text-white" data-testid="text-admin-branches">
                    {statsLoading ? (
                      <div className="skeleton h-8 w-8 rounded"></div>
                    ) : (
                      stats?.activeBranches || 0
                    )}
                  </p>
                  <p className="text-green-400 text-sm mt-1">Semua beroperasi</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Building className="text-green-400 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <Charts stats={stats} isLoading={statsLoading} />

          {/* Data Management Section */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 md:mb-0">Data Absensi Siswa</h3>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                {/* Search */}
                <Input
                  type="text"
                  placeholder="Cari nama, sekolah, kota..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-64 bg-white/5 border-white/20"
                  data-testid="input-search"
                />
                
                {/* Filter */}
                <Select value={branchFilter || "all"} onValueChange={setBranchFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/20" data-testid="select-branch-filter">
                    <SelectValue placeholder="Semua Cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Cabang</SelectItem>
                    {BRANCHES.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Export */}
                <Button
                  onClick={() => handleExport(branchFilter)}
                  disabled={exportMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-export"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>

                {/* Clear All */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={clearAllMutation.isPending}
                      data-testid="button-clear-all"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Konfirmasi Hapus Semua Data</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus SEMUA data absensi? 
                        Tindakan ini tidak dapat dibatalkan dan akan menghapus seluruh data secara permanen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleClearAll}
                        className="bg-red-600 hover:bg-red-700"
                        data-testid="button-confirm-clear-all"
                      >
                        Hapus Semua
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Data Table */}
            <DataTable 
              data={attendanceData?.data || []} 
              isLoading={dataLoading}
              total={attendanceData?.total || 0}
              page={page}
              onPageChange={setPage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
