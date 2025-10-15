import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Search,
  Filter
} from "lucide-react";
import { formatDateTime, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const announcementSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  type: z.enum(["info", "warning", "urgent", "success"]),
  priority: z.enum(["1", "2", "3"]),
  targetRole: z.enum(["all", "admin", "user"]),
  expiresAt: z.string().optional(),
});

export default function AnnouncementManagement() {
  const { user, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (!user || !isAdmin) {
    setLocation("/");
    return null;
  }

  const { data: announcements = [] } = useQuery({
    queryKey: ["/api/announcements"],
  });

  const form = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "info",
      priority: "1",
      targetRole: "all",
      expiresAt: "",
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: z.infer<typeof announcementSchema>) => {
      const payload = {
        ...data,
        priority: parseInt(data.priority),
        targetRole: data.targetRole === "all" ? null : data.targetRole,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      };
      
      return apiRequest("/api/announcements", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({
        title: "Sucesso",
        description: "Aviso criado com sucesso!",
      });
      setIsDialogOpen(false);
      form.reset();
      setEditingAnnouncement(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar aviso. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (announcementId: number) => {
      await apiRequest(`/api/announcements/${announcementId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({
        title: "Sucesso",
        description: "Aviso removido com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover aviso.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof announcementSchema>) => {
    createAnnouncementMutation.mutate(data);
  };

  const filteredAnnouncements = announcements.filter((announcement: any) => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || announcement.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleDelete = (announcementId: number) => {
    if (window.confirm("Tem certeza que deseja remover este aviso?")) {
      deleteAnnouncementMutation.mutate(announcementId);
    }
  };

  const handleEdit = (announcement: any) => {
    setEditingAnnouncement(announcement);
    form.reset({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority.toString(),
      targetRole: announcement.targetRole || "all",
      expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().split('T')[0] : "",
    });
    setIsDialogOpen(true);
  };

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'text-red-600';
      case 'warning':
        return 'text-orange-600';
      case 'success':
        return 'text-green-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  };

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 3:
        return <Badge variant="destructive">Alta</Badge>;
      case 2:
        return <Badge variant="secondary">Média</Badge>;
      case 1:
      default:
        return <Badge variant="outline">Baixa</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--navy-light)]">
      <Navbar />
      
      <div className="flex">
        <Sidebar className="w-64 flex-shrink-0" />
        
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Gestão de Avisos</h1>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Aviso
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingAnnouncement ? "Editar Aviso" : "Criar Novo Aviso"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Título do aviso" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conteúdo</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Conteúdo do aviso" 
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Tipo do aviso" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="info">Informação</SelectItem>
                                <SelectItem value="warning">Aviso</SelectItem>
                                <SelectItem value="urgent">Urgente</SelectItem>
                                <SelectItem value="success">Sucesso</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prioridade</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Prioridade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">Baixa</SelectItem>
                                <SelectItem value="2">Média</SelectItem>
                                <SelectItem value="3">Alta</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="targetRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Público Alvo</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Público" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="admin">Administradores</SelectItem>
                                <SelectItem value="user">Militares</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="expiresAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Expiração (opcional)</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsDialogOpen(false);
                          setEditingAnnouncement(null);
                          form.reset();
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createAnnouncementMutation.isPending}>
                        {createAnnouncementMutation.isPending ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar avisos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="info">Informação</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Announcements List */}
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement: any) => {
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
                        <Icon className={cn("w-6 h-6", getTypeColor(announcement.type))} />
                        <div>
                          <CardTitle className="text-lg">{announcement.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            {getPriorityBadge(announcement.priority)}
                            <Badge variant="outline" className="capitalize">
                              {announcement.type}
                            </Badge>
                            {announcement.targetRole && (
                              <Badge variant="secondary">
                                {announcement.targetRole === "admin" ? "Administradores" : "Militares"}
                              </Badge>
                            )}
                            {isExpired && (
                              <Badge variant="destructive">Expirado</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(announcement)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(announcement.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                          <span>Expira: {formatDate(announcement.expiresAt)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredAnnouncements.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum aviso encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedType !== "all" 
                  ? "Tente ajustar os filtros de busca"
                  : "Clique em 'Novo Aviso' para criar o primeiro aviso"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}