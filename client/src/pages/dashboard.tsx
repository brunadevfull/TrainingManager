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
import { Progress } from "@/components/ui/progress";
import { 
  PlayCircle, 
  Video, 
  PieChart, 
  Award, 
  Check, 
  Play,
  Calendar
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  const { data: userProgress } = useQuery({
    queryKey: ["/api/users", user.id, "progress"],
    enabled: !!user.id,
  });

  const { data: videos } = useQuery({
    queryKey: ["/api/videos"],
  });

  const stats = userProgress?.stats || {
    completedVideos: 0,
    totalVideos: 0,
    totalWatchTime: 0,
    certificates: 0,
  };

  const completionPercentage = stats.totalVideos > 0 
    ? Math.round((stats.completedVideos / stats.totalVideos) * 100)
    : 0;

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const recentVideos = videos?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-[var(--navy-light)]">
      <Navbar />
      
      <div className="flex">
        <Sidebar className="w-64 flex-shrink-0" />
        
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Página Inicial</h1>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(new Date())}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Vídeos Assistidos"
              value={stats.completedVideos}
              icon={PlayCircle}
            />
            <StatsCard
              title="Total Disponível"
              value={stats.totalVideos}
              icon={Video}
            />
            <StatsCard
              title="Progresso"
              value={`${completionPercentage}%`}
              icon={PieChart}
            />
            <StatsCard
              title="Certificados"
              value={stats.certificates}
              icon={Award}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center text-[var(--papem-header)]">
                    <Play className="w-5 h-5 mr-2 text-[var(--papem-gold)]" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userProgress?.completions?.length > 0 ? (
                    <div className="space-y-4">
                      {userProgress.completions.slice(0, 5).map((completion: any) => (
                        <div key={completion.id} className="flex items-center p-3 border rounded-lg">
                          <Check className="w-5 h-5 text-green-500 mr-3" />
                          <div className="flex-1">
                            <p className="font-medium">Vídeo concluído</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(completion.completedAt)}
                            </p>
                          </div>
                          <Badge className="completion-badge">
                            Concluído
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <PlayCircle className="w-12 h-12 mx-auto mb-3" />
                      <p>Nenhuma atividade recente</p>
                      <p className="text-sm">Comece assistindo aos vídeos disponíveis</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Progress Overview */}
            <div>
              <Card className="card-modern mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-[var(--papem-header)]">
                    <PieChart className="w-5 h-5 mr-2 text-[var(--papem-gold)]" />
                    Progresso Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Conclusão</span>
                        <span>{completionPercentage}%</span>
                      </div>
                      <Progress value={completionPercentage} className="h-3" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-semibold text-[var(--navy-primary)]">
                          {stats.completedVideos}
                        </p>
                        <p className="text-xs text-muted-foreground">Concluídos</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-[var(--navy-warning)]">
                          {stats.totalVideos - stats.completedVideos}
                        </p>
                        <p className="text-xs text-muted-foreground">Pendentes</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-[var(--navy-success)]">
                          {stats.certificates}
                        </p>
                        <p className="text-xs text-muted-foreground">Certificados</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center text-[var(--papem-header)]">
                    <Video className="w-5 h-5 mr-2 text-[var(--papem-gold)]" />
                    Próximos Vídeos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentVideos.map((video: any) => (
                      <div key={video.id} className="space-y-2">
                        <h4 className="font-medium text-sm">{video.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          Duração: {Math.floor(video.duration / 60)} min
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full btn-navy-outline"
                          onClick={() => setLocation(`/video/${video.id}`)}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Assistir
                        </Button>
                      </div>
                    ))}
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
