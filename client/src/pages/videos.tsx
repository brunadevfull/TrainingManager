import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import VideoCard from "@/components/video-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function Videos() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Redirect if not logged in
  if (!user) {
    setLocation("/");
    return null;
  }

  const { data: videos = [] } = useQuery({
    queryKey: ["/api/videos"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: userProgress } = useQuery({
    queryKey: ["/api/users", user.id, "progress"],
    enabled: !!user.id,
  });

  // Filter videos based on search and category
  const filteredVideos = videos.filter((video: any) => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || 
                           video.categoryId?.toString() === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get user progress for each video
  const getVideoProgress = (videoId: number) => {
    const completion = userProgress?.completions?.find((c: any) => c.videoId === videoId);
    return {
      completed: !!completion,
      progress: completion?.progress || 0,
    };
  };

  const handlePlayVideo = (videoId: number) => {
    setLocation(`/video/${videoId}`);
  };

  return (
    <div className="min-h-screen bg-[var(--navy-light)]">
      <Navbar />
      
      <div className="flex">
        <Sidebar className="w-64 flex-shrink-0" />
        
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Catálogo de Vídeos</h1>
            <div className="flex items-center space-x-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas as Categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Buscar vídeos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Button className="btn-navy">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "all" 
                  ? "Nenhum vídeo encontrado com os filtros aplicados" 
                  : "Nenhum vídeo disponível"}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video: any) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  userProgress={getVideoProgress(video.id)}
                  onPlay={handlePlayVideo}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
