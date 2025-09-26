import { Link } from "wouter";
import AttendanceForm from "@/components/attendance-form";
import { useAttendanceStats } from "@/hooks/use-attendance";
import { GraduationCap, Users, Calendar, TrendingUp, Building } from "lucide-react";

export default function StudentAttendancePage() {
  const { data: stats, isLoading } = useAttendanceStats();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="text-primary text-2xl" />
                <h1 className="text-xl font-bold text-white">InspiraNet Cakrawala</h1>
              </div>
              <div className="hidden md:flex items-center space-x-1 text-sm text-muted-foreground">
                <span className="status-indicator status-online"></span>
                <span>Online</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <button 
                  className="glass px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-all duration-300"
                  data-testid="button-admin"
                >
                  <i className="fas fa-user-shield mr-2"></i>
                  Admin
                </button>
              </Link>
              <div className="text-sm text-muted-foreground">
                © Inspiranet.Official Kabinet Cakrawala
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold text-white mb-4">Sistem Absensi Digital</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Silakan isi formulir absensi di bawah ini dengan lengkap dan benar
            </p>
            
            {/* Live Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary" data-testid="text-total-students">
                  {isLoading ? (
                    <div className="skeleton h-8 w-12 mx-auto rounded"></div>
                  ) : (
                    stats?.total || 0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Total Siswa</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-secondary" data-testid="text-today-count">
                  {isLoading ? (
                    <div className="skeleton h-8 w-8 mx-auto rounded"></div>
                  ) : (
                    stats?.today || 0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Hari Ini</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-accent" data-testid="text-week-count">
                  {isLoading ? (
                    <div className="skeleton h-8 w-12 mx-auto rounded"></div>
                  ) : (
                    stats?.thisWeek || 0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Minggu Ini</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400" data-testid="text-active-branches">
                  {isLoading ? (
                    <div className="skeleton h-8 w-4 mx-auto rounded"></div>
                  ) : (
                    stats?.activeBranches || 0
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Cabang Aktif</div>
              </div>
            </div>
          </div>

          {/* Attendance Form */}
          <AttendanceForm />
        </div>
      </main>
    </div>
  );
}
