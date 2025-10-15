import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Check, 
  Clock, 
  User,
  ArrowLeft
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

export default function VideoPlayer() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [watchedPercentage, setWatchedPercentage] = useState(0);
  const [hasCompletedVideo, setHasCompletedVideo] = useState(false);
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const lastTrackedSegmentRef = useRef(-1);

  // Redirect if not logged in
  if (!user) {
    setLocation("/");
    return null;
  }

  const videoId = parseInt(id || "0");

  const { data: video, isLoading } = useQuery({
    queryKey: ["/api/videos", videoId],
    enabled: !!videoId,
  });

  const { data: userProgress } = useQuery({
    queryKey: ["/api/users", user.id, "progress"],
    enabled: !!user.id,
  });

  const trackViewMutation = useMutation({
    mutationFn: (data: { duration: number }) => 
      apiRequest("POST", `/api/videos/${videoId}/view`, data),
  });

  const completeVideoMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/videos/${videoId}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user.id, "progress"] });
      toast({
        title: "Parabéns!",
        description: "Vídeo concluído com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao marcar vídeo como concluído",
        variant: "destructive",
      });
    },
  });

  // Check if user has already completed this video
  const isVideoCompleted = userProgress?.completions?.some(
    (completion: any) => completion.videoId === videoId
  );

  useEffect(() => {
    if (isVideoCompleted) {
      setHasCompletedVideo(true);
    }
  }, [isVideoCompleted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const total = video.duration;
      setCurrentTime(current);
      setDuration(total);
      
      if (total > 0) {
        const percentage = (current / total) * 100;
        setWatchedPercentage(percentage);
        
        // Track view every 30 seconds
        const currentSegment = Math.floor(current / 30);
        if (currentSegment > 0 && currentSegment !== lastTrackedSegmentRef.current) {
          lastTrackedSegmentRef.current = currentSegment;
          trackViewMutation.mutate({ duration: currentSegment * 30 });
        }
        
        // Consider video completed when 95% watched
        if (percentage >= 95 && !hasCompletedVideo) {
          setHasCompletedVideo(true);
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [hasCompletedVideo, trackViewMutation]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSeek = (percentage: number) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const newTime = (percentage / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const handleCompleteVideo = () => {
    if (!confirmationChecked) {
      toast({
        title: "Confirmação necessária",
        description: "Você precisa confirmar que assistiu ao vídeo completo",
        variant: "destructive",
      });
      return;
    }

    completeVideoMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--navy-light)]">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--navy-primary)] mb-4"></div>
            <p>Carregando vídeo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-[var(--navy-light)]">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">Vídeo não encontrado</p>
            <Button onClick={() => setLocation("/videos")} className="mt-4">
              Voltar aos vídeos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--navy-light)]">
      <Navbar />
      
      <div className="flex">
        <Sidebar className="w-64 flex-shrink-0" />
        
        <div className="flex-1 p-6">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => setLocation("/videos")}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{video.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {video.uploader?.name || "Sistema"}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDuration(video.duration)}
                </div>
                <Badge className="badge-navy">
                  {video.category?.name || "Sem categoria"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-0">
                  <div className="relative bg-black rounded-t-lg">
                    <video
                      ref={videoRef}
                      className="w-full h-96 object-contain"
                      src={`/api/videos/${videoId}/stream`}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      controls={false}
                    />
                    
                    {/* Custom Video Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="mb-2">
                        <div className="flex items-center space-x-2 text-white text-sm">
                          <span>{formatDuration(currentTime)}</span>
                          <div className="flex-1">
                            <Progress
                              value={(currentTime / duration) * 100}
                              className="h-2 cursor-pointer"
                              onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const percentage = ((e.clientX - rect.left) / rect.width) * 100;
                                handleSeek(percentage);
                              }}
                            />
                          </div>
                          <span>{formatDuration(duration)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={togglePlay}
                            className="text-white hover:bg-white/10"
                          >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMute}
                            className="text-white hover:bg-white/10"
                          >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          </Button>
                          
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                            className="w-20"
                          />
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleFullscreen}
                          className="text-white hover:bg-white/10"
                        >
                          <Maximize className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {video.description || "Sem descrição disponível"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Progresso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Assistido</span>
                        <span>{Math.round(watchedPercentage)}%</span>
                      </div>
                      <Progress value={watchedPercentage} className="h-3" />
                    </div>
                    
                    {isVideoCompleted && (
                      <div className="text-center">
                        <Badge className="completion-badge">
                          <Check className="w-4 h-4 mr-1" />
                          Vídeo Concluído
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {hasCompletedVideo && !isVideoCompleted && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Confirmar Conclusão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="completion-check"
                          checked={confirmationChecked}
                          onCheckedChange={(checked) => setConfirmationChecked(checked as boolean)}
                        />
                        <label htmlFor="completion-check" className="text-sm">
                          Confirmo que assisti ao vídeo completo
                        </label>
                      </div>
                      
                      <Button
                        className="w-full btn-navy"
                        onClick={handleCompleteVideo}
                        disabled={!confirmationChecked || completeVideoMutation.isPending}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {completeVideoMutation.isPending ? "Confirmando..." : "Confirmar Conclusão"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
