import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatNIP } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

export default function UserModal({ isOpen, onClose, user }: UserModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    nip: "",
    rank: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        nip: user.nip || "",
        rank: user.rank || "",
        password: "",
        confirmPassword: "",
        role: user.role || "user",
      });
    } else {
      setFormData({
        name: "",
        nip: "",
        rank: "",
        password: "",
        confirmPassword: "",
        role: "user",
      });
    }
  }, [user]);

  const createUserMutation = useMutation({
    mutationFn: (userData: any) => apiRequest("POST", "/api/users", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar usuário",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (userData: any) => apiRequest("PUT", `/api/users/${user.id}`, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar usuário",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.nip) {
      toast({
        title: "Erro",
        description: "Nome e NIP são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (!isEditing && !formData.password) {
      toast({
        title: "Erro",
        description: "Senha é obrigatória para novos usuários",
        variant: "destructive",
      });
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "Senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    const userData = {
      name: formData.name,
      nip: formData.nip,
      rank: formData.rank,
      role: formData.role,
      ...(formData.password && { password: formData.password }),
    };

    if (isEditing) {
      updateUserMutation.mutate(userData);
    } else {
      createUserMutation.mutate(userData);
    }
  };

  const handleNipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedNip = formatNIP(value);
    setFormData({ ...formData, nip: formattedNip });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nip">NIP</Label>
            <Input
              id="nip"
              value={formData.nip}
              onChange={handleNipChange}
              maxLength={10}
              placeholder="11.1111.11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rank">Posto/Graduação</Label>
            <Select value={formData.rank} onValueChange={(value) => setFormData({ ...formData, rank: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MN">Marinheiro (MN)</SelectItem>
                <SelectItem value="CB">Cabo (CB)</SelectItem>
                <SelectItem value="3SG">3º Sargento (3SG)</SelectItem>
                <SelectItem value="2SG">2º Sargento (2SG)</SelectItem>
                <SelectItem value="1SG">1º Sargento (1SG)</SelectItem>
                <SelectItem value="SO">Suboficial (SO)</SelectItem>
                <SelectItem value="1T">1º Tenente (1T)</SelectItem>
                <SelectItem value="2T">2º Tenente (2T)</SelectItem>
                <SelectItem value="CT">Capitão-Tenente (CT)</SelectItem>
                <SelectItem value="CC">Capitão de Corveta (CC)</SelectItem>
                <SelectItem value="CF">Capitão de Fragata (CF)</SelectItem>
                <SelectItem value="CMG">Capitão de Mar e Guerra (CMG)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {isEditing ? "Nova Senha (deixe em branco para não alterar)" : "Senha"}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!isEditing}
            />
          </div>

          {formData.password && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Perfil</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="btn-navy"
              disabled={createUserMutation.isPending || updateUserMutation.isPending}
            >
              {isEditing ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
