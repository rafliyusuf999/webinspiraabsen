import { useEffect, useRef } from "react";
import { 
  Chart as ChartJS, 
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  DoughnutController,
  LineController
} from 'chart.js';

ChartJS.register(
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  DoughnutController,
  LineController
);

interface ChartsProps {
  stats?: {
    byBranch: Record<string, number>;
    dailyStats: Array<{ date: string; count: number }>;
  };
  isLoading: boolean;
}

export default function Charts({ stats, isLoading }: ChartsProps) {
  const branchChartRef = useRef<HTMLCanvasElement>(null);
  const timelineChartRef = useRef<HTMLCanvasElement>(null);
  const branchChartInstance = useRef<ChartJS | null>(null);
  const timelineChartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!stats || isLoading) return;

    // Branch Distribution Chart
    if (branchChartRef.current) {
      const ctx = branchChartRef.current.getContext('2d');
      if (ctx) {
        // Destroy existing chart
        if (branchChartInstance.current) {
          branchChartInstance.current.destroy();
        }

        const branchData = Object.entries(stats.byBranch);
        const labels = branchData.map(([branch]) => {
          switch (branch) {
            case 'InspiraNet_Cakrawala_1': return 'Cabang 1';
            case 'InspiraNet_Cakrawala_2': return 'Cabang 2';
            case 'InspiraNet_Cakrawala_3': return 'Cabang 3';
            case 'InspiraNet_Cakrawala_4': return 'Cabang 4';
            default: return branch;
          }
        });
        const data = branchData.map(([, count]) => count);

        branchChartInstance.current = new ChartJS(ctx, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{
              data,
              backgroundColor: [
                'hsl(239, 84%, 67%)',
                'hsl(197, 71%, 73%)',
                'hsl(159, 100%, 36%)',
                'hsl(42, 93%, 56%)'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#94a3b8',
                  padding: 20,
                  usePointStyle: true,
                }
              }
            }
          }
        });
      }
    }

    // Timeline Chart
    if (timelineChartRef.current) {
      const ctx = timelineChartRef.current.getContext('2d');
      if (ctx) {
        // Destroy existing chart
        if (timelineChartInstance.current) {
          timelineChartInstance.current.destroy();
        }

        const labels = stats.dailyStats.map(stat => stat.date);
        const data = stats.dailyStats.map(stat => stat.count);

        timelineChartInstance.current = new ChartJS(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Absensi Harian',
              data,
              borderColor: 'hsl(197, 71%, 73%)',
              backgroundColor: 'hsla(197, 71%, 73%, 0.1)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: 'hsl(197, 71%, 73%)',
              pointBorderColor: 'hsl(197, 71%, 73%)',
              pointBorderWidth: 2,
              pointRadius: 4,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: '#94a3b8'
                }
              },
              x: {
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                  color: '#94a3b8'
                }
              }
            },
            elements: {
              point: {
                hoverRadius: 8
              }
            }
          }
        });
      }
    }

    // Cleanup function
    return () => {
      if (branchChartInstance.current) {
        branchChartInstance.current.destroy();
      }
      if (timelineChartInstance.current) {
        timelineChartInstance.current.destroy();
      }
    };
  }, [stats, isLoading]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Distribusi per Cabang</h3>
          <div className="chart-container">
            <div className="skeleton h-full w-full rounded"></div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Timeline Absensi (7 Hari)</h3>
          <div className="chart-container">
            <div className="skeleton h-full w-full rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Distribusi per Cabang</h3>
        <div className="chart-container">
          <canvas ref={branchChartRef} data-testid="chart-branch-distribution"></canvas>
        </div>
      </div>
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Timeline Absensi (7 Hari)</h3>
        <div className="chart-container">
          <canvas ref={timelineChartRef} data-testid="chart-timeline"></canvas>
        </div>
      </div>
    </div>
  );
}
