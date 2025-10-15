import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Calendar,
  User,
  Clock
} from "lucide-react";
import { formatDateTime, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function Announcements() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  const { data: announcements = [] } = useQuery({
    queryKey: ["/api/announcements"],
  });

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return AlertTriangle;
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      case 'info':
      default:
        return Info;
    }
  };

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'info':
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 3:
        return <Badge variant="destructive">Alta Prioridade</Badge>;
      case 2:
        return <Badge variant="secondary">Média Prioridade</Badge>;
      case 1:
      default:
        return <Badge variant="outline">Baixa Prioridade</Badge>;
    }
  };

  // Filter announcements for current user role
  const filteredAnnouncements = announcements.filter((announcement: any) => {
    if (!announcement.targetRole) return true; // Show to all
    if (announcement.targetRole === 'admin' && user.role === 'admin') return true;
    if (announcement.targetRole === 'user' && user.role === 'user') return true;
    return false;
  });

  // Sort by priority and date
  const sortedAnnouncements = filteredAnnouncements.sort((a: any, b: any) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority; // Higher priority first
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-[var(--navy-light)]">
      <Navbar />
      
      <div className="flex">
        <Sidebar className="w-64 flex-shrink-0" />
        
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Avisos e Comunicados</h1>
            <Badge className="military-badge">
              <Bell className="w-4 h-4 mr-1" />
              PAPEM-35
            </Badge>
          </div>

          {/* Announcements List */}
          <div className="space-y-4">
            {sortedAnnouncements.map((announcement: any) => {
              const Icon = getAnnouncementIcon(announcement.type);
              const isExpired = announcement.expiresAt && new Date(announcement.expiresAt) < new Date();
              
              return (
                <Card 
                  key={announcement.id} 
                  className={cn(
                    "transition-all hover:shadow-lg",
                    isExpired && "opacity-75"
                  )}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "p-2 rounded-full",
                          getAnnouncementColor(announcement.type)
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{announcement.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            {getPriorityBadge(announcement.priority)}
                            {announcement.type && (
                              <Badge variant="outline" className="capitalize">
                                {announcement.type}
                              </Badge>
                            )}
                            {isExpired && (
                              <Badge variant="secondary">Expirado</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="whitespace-pre-wrap text-sm mb-4">
                      {announcement.content}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{announcement.creator?.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(announcement.createdAt)}</span>
                        </div>
                      </div>
                      
                      {announcement.expiresAt && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            Expira em: {formatDate(announcement.expiresAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {sortedAnnouncements.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum aviso disponível</h3>
              <p className="text-muted-foreground">
                Não há avisos ativos no momento
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}