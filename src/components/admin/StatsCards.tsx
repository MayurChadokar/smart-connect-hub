import { motion } from "framer-motion";
import { Users, CalendarDays, TrendingUp, Building2 } from "lucide-react";

interface StatsCardsProps {
  totalSubmissions: number;
  todaySubmissions: number;
  departments: number;
}

export function StatsCards({ totalSubmissions, todaySubmissions, departments }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Registrations",
      value: totalSubmissions,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Today's Submissions",
      value: todaySubmissions,
      icon: CalendarDays,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Departments",
      value: departments,
      icon: Building2,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Growth Rate",
      value: todaySubmissions > 0 ? `+${todaySubmissions}` : "0",
      icon: TrendingUp,
      color: "text-accent-foreground",
      bgColor: "bg-accent",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
