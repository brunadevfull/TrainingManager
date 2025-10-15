import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  PlayCircle,
  TrendingUp,
  Gauge,
  Users,
  FileText,
  Video,
  FolderOpen,
  Bell,
  Download,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { isAdmin, user } = useAuth();
  const [location, setLocation] = useLocation();

  const menuItems = [
    {
      label: "Página Inicial",
      icon: Home,
      path: "/dashboard",
      adminOnly: false,
    },
    {
      label: "Catálogo de Vídeos",
      icon: PlayCircle,
      path: "/videos",
      adminOnly: false,
    },
    {
      label: "Meu Progresso",
      icon: TrendingUp,
      path: "/progress",
      adminOnly: false,
      userOnly: true,
    },
    {
      label: "Documentos",
      icon: FolderOpen,
      path: "/documents",
      adminOnly: false,
    },
    {
      label: "Avisos",
      icon: Bell,
      path: "/announcements",
      adminOnly: false,
    },
  ];

  const adminMenuItems = [
    {
      label: "Painel Admin",
      icon: Gauge,
      path: "/admin",
      adminOnly: true,
    },
    {
      label: "Usuários",
      icon: Users,
      path: "/users",
      adminOnly: true,
    },
    {
      label: "Relatórios",
      icon: FileText,
      path: "/reports",
      adminOnly: true,
    },
    {
      label: "Gestão de Vídeos",
      icon: Video,
      path: "/video-management",
      adminOnly: true,
    },
    {
      label: "Gestão de Documentos",
      icon: Download,
      path: "/document-management",
      adminOnly: true,
    },
    {
      label: "Gestão de Avisos",
      icon: Bell,
      path: "/announcement-management",
      adminOnly: true,
    },
  ];

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  return (
    <div className={cn("sidebar min-h-screen", className)}>
      <div className="p-6">
        <h6 className="text-xs font-semibold text-[var(--papem-header)] uppercase tracking-wider mb-6 flex items-center">
          <div className="w-2 h-2 bg-[var(--papem-gold)] rounded-full mr-2"></div>
          Menu Principal
        </h6>
        
        <div className="space-y-3">
          {menuItems
            .filter(item => {
              if (item.adminOnly && !isAdmin) return false;
              if (item.userOnly && isAdmin) return false;
              return true;
            })
            .map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 group",
                    isActive 
                      ? "bg-gradient-to-r from-[var(--papem-header)] to-[var(--papem-header)] text-white shadow-lg transform scale-105" 
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-[var(--papem-header)] hover:shadow-md hover:transform hover:scale-105"
                  )}
                >
                  <Icon className={cn("w-5 h-5 transition-all", isActive ? "text-white" : "text-gray-500 group-hover:text-[var(--papem-header)]")} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
        </div>

        {isAdmin && (
          <div className="mt-10">
            <h6 className="text-xs font-semibold text-[var(--papem-header)] uppercase tracking-wider mb-6 flex items-center">
              <div className="w-2 h-2 bg-[var(--papem-gold)] rounded-full mr-2"></div>
              Administração
            </h6>
            <div className="space-y-3">
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      "w-full text-left flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 group",
                      isActive 
                        ? "bg-gradient-to-r from-[var(--papem-header)] to-[var(--papem-header)] text-white shadow-lg transform scale-105" 
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-[var(--papem-header)] hover:shadow-md hover:transform hover:scale-105"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 transition-all", isActive ? "text-white" : "text-gray-500 group-hover:text-[var(--papem-header)]")} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
