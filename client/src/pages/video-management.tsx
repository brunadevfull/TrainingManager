import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import VideoModal from "@/components/video-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Video, Search, Edit, Trash2, Eye, Calendar } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

export default function VideoManagement() {
  const { user, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);

  // Redirect if not logged in or not admin
  if (!user) {
    setLocation("/");
    return null;
  }

  if (!isAdmin) {
    setLocation("/dashboard");
    return null;
  }

  const { data: videos = [] } = useQuery({
    queryKey: ["/api/videos"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (videoId: number) => apiRequest("DELETE", `/api/videos/${videoId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Sucesso",
        description: "Vídeo excluído com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao excluir vídeo",
        variant: "destructive",
      });
    },
  });

  // Filter videos based on search
  const filteredVideos = videos.filter((video: any) => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteVideo = (videoId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este vídeo?")) {
      deleteVideoMutation.mutate(videoId);
    }
  };

  const handleEditVideo = (video: any) => {
    setEditingVideo(video);
    setShowVideoModal(true);
  };

  const handleCreateVideo = () => {
    setEditingVideo(null);
    setShowVideoModal(true);
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat: any) => cat.id === categoryId);
    return category?.name || "Sem categoria";
  };

  return (
    <div className="min-h-screen bg-[var(--navy-light)]">
      <Navbar />
      
      <div className="flex">
        <Sidebar className="w-64 flex-shrink-0" />
        
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Gestão de Vídeos</h1>
            <Button className="btn-navy" onClick={handleCreateVideo}>
              <Video className="w-4 h-4 mr-2" />
              Novo Vídeo
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Vídeos Cadastrados</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Buscar vídeo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Button className="btn-navy">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Visualizações</TableHead>
                      <TableHead>Data Upload</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVideos.map((video: any) => (
                      <TableRow key={video.id}>
                        <TableCell className="font-medium">{video.title}</TableCell>
                        <TableCell>
                          <Badge className="badge-navy">
                            {getCategoryName(video.categoryId)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDuration(video.duration)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {video.views?.length || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(video.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={video.active ? "default" : "secondary"}>
                            {video.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditVideo(video)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteVideo(video.id)}
                              disabled={deleteVideoMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredVideos.length === 0 && (
                <div className="text-center py-12">
                  <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "Nenhum vídeo encontrado" : "Nenhum vídeo cadastrado"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        video={editingVideo}
        categories={categories}
      />
    </div>
  );
}
