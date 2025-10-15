import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Clock } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";

export default function ProgressPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not logged in
  if (!user) {
    setLocation("/");
    return null;
  }

  const { data: userProgress } = useQuery({
    queryKey: ["/api/users", user.id, "progress"],
    enabled: !!user.id,
  });

  const { data: videos = [] } = useQuery({
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

  // Get detailed progress for each video
  const videoProgress = videos.map((video: any) => {
    const completion = userProgress?.completions?.find((c: any) => c.videoId === video.id);
    return {
      ...video,
      completed: !!completion,
      completedAt: completion?.completedAt,
      certificateIssued: completion?.certificateIssued || false,
    };
  });

  return (
    <div className="min-h-screen bg-[var(--navy-light)]">
      <Navbar />
      
      <div className="flex">
        <Sidebar className="w-64 flex-shrink-0" />
        
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Meu Progresso</h1>
            <Button variant="outline" className="btn-navy-outline">
              <Download className="w-4 h-4 mr-2" />
              Baixar Certificado
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Progresso Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Conclusão</span>
                      <span>{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-4" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-[var(--navy-primary)]">
                        {stats.completedVideos}
                      </p>
                      <p className="text-sm text-muted-foreground">Concluídos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[var(--navy-warning)]">
                        {stats.totalVideos - stats.completedVideos}
                      </p>
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[var(--navy-success)]">
                        {stats.certificates}
                      </p>
                      <p className="text-sm text-muted-foreground">Certificados</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo Total de Estudo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-[var(--navy-primary)]">
                      {formatWatchTime(stats.totalWatchTime)}
                    </p>
                    <p className="text-sm text-muted-foreground">Horas assistidas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico Detalhado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vídeo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Conclusão</TableHead>
                      <TableHead>Certificado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videoProgress.map((video: any) => (
                      <TableRow key={video.id}>
                        <TableCell className="font-medium">{video.title}</TableCell>
                        <TableCell>
                          <Badge className="badge-navy">
                            {video.category?.name || "Sem categoria"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDuration(video.duration)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {video.completed ? (
                            <Badge className="completion-badge">Concluído</Badge>
                          ) : (
                            <Badge variant="secondary">Pendente</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {video.completedAt ? formatDate(video.completedAt) : "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {video.certificateIssued ? "Disponível" : "Não disponível"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
