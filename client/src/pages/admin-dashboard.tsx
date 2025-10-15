import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import StatsCard from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Video, 
  Eye, 
  Award, 
  UserPlus, 
  Plus,
  FileText,
  Download,
  Shield
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!user) {
      setLocation("/");
    } else if (!isAdmin) {
      setLocation("/dashboard");
    }
  }, [user, isAdmin, setLocation]);

  if (!user || !isAdmin) {
    return null;
  }

  const { data: systemStats } = useQuery({
    queryKey: ["/api/stats/system"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const stats = systemStats || {
    totalUsers: 0,
    totalVideos: 0,
    totalViews: 0,
    totalCertificates: 0,
  };

  // Get recent activity (last 5 users)
  const recentUsers = users.slice(-5).reverse();

  return (
    <div className="min-h-screen bg-[var(--navy-light)]">
      <Navbar />
      
      <div className="flex">
        <Sidebar className="w-64 flex-shrink-0" />
        
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <Badge className="military-badge">
              <Shield className="w-4 h-4 mr-1" />
              Administrador PAPEM-35
            </Badge>
          </div>

          {/* Admin Statistics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Total de Usuários"
              value={stats.totalUsers}
              icon={Users}
            />
            <StatsCard
              title="Vídeos Ativos"
              value={stats.totalVideos}
              icon={Video}
            />
            <StatsCard
              title="Visualizações"
              value={stats.totalViews}
              icon={Eye}
            />
            <StatsCard
              title="Certificados"
              value={stats.totalCertificates}
              icon={Award}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center text-[var(--papem-header)]">
                    <Users className="w-5 h-5 mr-2 text-[var(--papem-gold)]" />
                    Atividade Recente do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUsers.map((user: any) => (
                      <div key={user.id} className="flex items-center p-3 border rounded-lg">
                        <UserPlus className="w-5 h-5 text-green-500 mr-3" />
                        <div className="flex-1">
                          <p className="font-medium">Usuário cadastrado</p>
                          <p className="text-sm text-muted-foreground">
                            {user.name} - NIP: {user.nip}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(user.createdAt)}
                        </span>
                      </div>
                    ))}
                    
                    {recentUsers.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-3" />
                        <p>Nenhuma atividade recente</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center text-[var(--papem-header)]">
                    <Plus className="w-5 h-5 mr-2 text-[var(--papem-gold)]" />
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button 
                      className="w-full button-modern" 
                      onClick={() => setLocation("/users")}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Novo Usuário
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full button-outline-modern"
                      onClick={() => setLocation("/video-management")}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Novo Vídeo
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full button-outline-modern"
                      onClick={() => setLocation("/reports")}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Gerar Relatório
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full button-outline-modern"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Backup Sistema
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
