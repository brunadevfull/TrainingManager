import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video?: any;
  categories: any[];
}

export default function VideoModal({ isOpen, onClose, video, categories }: VideoModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    duration: "",
    requiresCertificate: false,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const isEditing = !!video;

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || "",
        description: video.description || "",
        categoryId: video.categoryId?.toString() || "",
        duration: Math.floor(video.duration / 60).toString() || "",
        requiresCertificate: video.requiresCertificate || false,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        categoryId: "",
        duration: "",
        requiresCertificate: false,
      });
    }
    setVideoFile(null);
  }, [video]);

  const createVideoMutation = useMutation({
    mutationFn: (formDataToSend: FormData) => {
      const response = fetch("/api/videos", {
        method: "POST",
        body: formDataToSend,
        credentials: "include",
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Sucesso",
        description: "Vídeo criado com sucesso",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar vídeo",
        variant: "destructive",
      });
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: (videoData: any) => apiRequest("PUT", `/api/videos/${video.id}`, videoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Sucesso",
        description: "Vídeo atualizado com sucesso",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar vídeo",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.duration) {
      toast({
        title: "Erro",
        description: "Título e duração são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (!isEditing && !videoFile) {
      toast({
        title: "Erro",
        description: "Arquivo de vídeo é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (isEditing) {
      // For editing, we don't need to send the video file
      const videoData = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        duration: parseInt(formData.duration) * 60, // Convert minutes to seconds
        requiresCertificate: formData.requiresCertificate,
      };

      updateVideoMutation.mutate(videoData);
    } else {
      // For creating, we need to send form data with the file
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("categoryId", formData.categoryId);
      formDataToSend.append("duration", (parseInt(formData.duration) * 60).toString());
      formDataToSend.append("requiresCertificate", formData.requiresCertificate.toString());
      if (videoFile) {
        formDataToSend.append("video", videoFile);
      }

      createVideoMutation.mutate(formDataToSend);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Erro",
          description: "Apenas arquivos de vídeo são permitidos",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (500MB limit)
      if (file.size > 500 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "O arquivo deve ter no máximo 500MB",
          variant: "destructive",
        });
        return;
      }

      setVideoFile(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Vídeo" : "Novo Vídeo"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="video-file">Arquivo de Vídeo</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="video-file"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('video-file')?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {videoFile ? videoFile.name : "Selecionar arquivo de vídeo"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: MP4, AVI, MOV. Tamanho máximo: 500MB
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="duration">Duração (minutos)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requires-certificate"
              checked={formData.requiresCertificate}
              onCheckedChange={(checked) => setFormData({ ...formData, requiresCertificate: checked as boolean })}
            />
            <Label htmlFor="requires-certificate" className="text-sm">
              Requer certificado de conclusão
            </Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="btn-navy"
              disabled={createVideoMutation.isPending || updateVideoMutation.isPending}
            >
              {isEditing ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
