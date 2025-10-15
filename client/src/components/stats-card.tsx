import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export default function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
  return (
    <Card className="stats-card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardContent className="p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            {description && (
              <p className="text-xs text-white/70 mt-1">{description}</p>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-white/10 rounded-full blur-sm"></div>
            <Icon className="w-10 h-10 text-white/80 relative z-10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
