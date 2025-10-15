import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Check, Clock } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { VideoWithDetails } from "@shared/schema";

interface VideoCardProps {
  video: VideoWithDetails;
  userProgress?: {
    completed: boolean;
    progress: number;
  };
  onPlay: (videoId: number) => void;
}

export default function VideoCard({ video, userProgress, onPlay }: VideoCardProps) {
  const isCompleted = userProgress?.completed || false;
  const progress = userProgress?.progress || 0;

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <div className="video-player h-48 bg-gray-900 flex items-center justify-center">
          <Button
            variant="ghost"
            size="lg"
            className="rounded-full bg-white/90 hover:bg-white text-gray-900"
            onClick={() => onPlay(video.id)}
          >
            <Play className="w-6 h-6" />
          </Button>
        </div>
        <div className="absolute bottom-2 right-2">
          <Badge variant="secondary" className="bg-black/80 text-white">
            <Clock className="w-3 h-3 mr-1" />
            {formatDuration(video.duration)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {video.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge className="badge-navy">
              {video.category?.name || "Sem categoria"}
            </Badge>
            {isCompleted && (
              <Badge className="completion-badge">
                <Check className="w-3 h-3 mr-1" />
                Concluído
              </Badge>
            )}
          </div>
        </div>

        {!isCompleted && progress > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <Button
          className="w-full btn-navy"
          onClick={() => onPlay(video.id)}
        >
          <Play className="w-4 h-4 mr-2" />
          {isCompleted ? "Assistir novamente" : progress > 0 ? "Continuar" : "Assistir"}
        </Button>
      </CardContent>
    </Card>
  );
}
