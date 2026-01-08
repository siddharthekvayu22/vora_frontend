import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const UserRegistrationChart = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Transform the API data into chart-friendly format
  const chartData = data.labels.map((date, index) => ({
    date: new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    }),
    fullDate: date,
    selfRegistration: data.selfRegistration[index],
    adminCreation: data.adminCreation[index],
    total: data.selfRegistration[index] + data.adminCreation[index]
  }));

  // Theme-aware colors
  const colors = {
    selfReg: isDark ? '#10b981' : '#059669',
    admin: isDark ? '#3b82f6' : '#2563eb',
    grid: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    text: isDark ? '#d1d5db' : '#6b7280',
    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-4 min-w-[200px]">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.selfReg }}></div>
                <span className="text-sm text-muted-foreground">Self Registration</span>
              </div>
              <span className="font-medium" style={{ color: colors.selfReg }}>{data.selfRegistration}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.admin }}></div>
                <span className="text-sm text-muted-foreground">Admin Created</span>
              </div>
              <span className="font-medium" style={{ color: colors.admin }}>{data.adminCreation}</span>
            </div>
            <div className="border-t border-border pt-1 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="font-bold text-primary">{data.total}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend component
  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex items-center justify-center gap-6 mb-4">
        {payload.map((entry) => (
          <div key={entry.value} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-foreground">
              {entry.value === 'selfRegistration' ? 'Self Registration' : 'Admin Created'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Calculate totals for summary
  const totalSelfReg = data.selfRegistration.reduce((a, b) => a + b, 0);
  const totalAdminCreated = data.adminCreation.reduce((a, b) => a + b, 0);
  const grandTotal = totalSelfReg + totalAdminCreated;

  return (
    <div className="space-y-6">
      {/* Chart Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">User Registration Trends</h3>
          <p className="text-sm text-muted-foreground">
            Registration patterns over the last {data.labels.length} days
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{grandTotal}</div>
          <div className="text-xs text-muted-foreground">Total Users</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6 shadow-lg">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="selfRegGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.selfReg} stopOpacity={isDark ? 0.4 : 0.3} />
                <stop offset="95%" stopColor={colors.selfReg} stopOpacity={isDark ? 0.1 : 0.05} />
              </linearGradient>
              <linearGradient id="adminGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.admin} stopOpacity={isDark ? 0.4 : 0.3} />
                <stop offset="95%" stopColor={colors.admin} stopOpacity={isDark ? 0.1 : 0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={colors.grid}
              opacity={0.6}
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: colors.text }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: colors.text }}
              domain={[0, 'dataMax + 1']}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend content={<CustomLegend />} />

            {/* Reference line for average */}
            <ReferenceLine
              y={grandTotal / data.labels.length}
              stroke={colors.text}
              strokeDasharray="5 5"
              opacity={0.7}
              label={{
                value: "Avg",
                position: "insideTopRight",
                style: { fill: colors.text, fontSize: '12px' }
              }}
            />

            <Area
              type="monotone"
              dataKey="selfRegistration"
              stackId="1"
              stroke={colors.selfReg}
              strokeWidth={2}
              fill="url(#selfRegGradient)"
              dot={{ fill: colors.selfReg, strokeWidth: 2, r: 4 }}
              activeDot={{
                r: 6,
                stroke: colors.selfReg,
                strokeWidth: 2,
                fill: isDark ? '#1f2937' : '#ffffff',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }}
            />

            <Area
              type="monotone"
              dataKey="adminCreation"
              stackId="1"
              stroke={colors.admin}
              strokeWidth={2}
              fill="url(#adminGradient)"
              dot={{ fill: colors.admin, strokeWidth: 2, r: 4 }}
              activeDot={{
                r: 6,
                stroke: colors.admin,
                strokeWidth: 2,
                fill: isDark ? '#1f2937' : '#ffffff',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">{totalSelfReg}</span>
            </div>
            <div>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                Admin Created
              </div>
              <div className="text-sm text-emerald-600/70 dark:text-emerald-400/70">
                {((totalAdminCreated / grandTotal) * 100 || 0).toFixed(1)}% of total
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">{totalAdminCreated}</span>
            </div>
            <div>
              <div className="font-semibold text-blue-600 dark:text-blue-400">
                Self Registrations
              </div>
              <div className="text-sm text-blue-600/70 dark:text-blue-400/70">
                {((totalSelfReg / grandTotal) * 100 || 0).toFixed(1)}% of total
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">{grandTotal}</span>
            </div>
            <div>
              <div className="font-semibold text-primary">
                Total Users
              </div>
              <div className="text-sm text-primary/70">
                Avg: {(grandTotal / data.labels.length).toFixed(1)} per day
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegistrationChart;