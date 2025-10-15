import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const defaultFormState: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function extractErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const [, ...rest] = error.message.split(": ");
    if (rest.length) {
      const potentialJson = rest.join(": ");
      try {
        const parsed = JSON.parse(potentialJson);
        if (typeof parsed === "object" && parsed && "message" in parsed) {
          const { message } = parsed as { message?: string };
          if (message) {
            return message;
          }
        }
      } catch (parseError) {
        // Ignore parse error and fall back to default message
      }
    }
    return error.message;
  }
  return "Erro ao atualizar senha";
}

export default function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const { toast } = useToast();
  const [formState, setFormState] = useState<PasswordForm>(defaultFormState);

  const resetForm = useMemo(
    () => () => {
      setFormState(defaultFormState);
    },
    [],
  );

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changePassword({ currentPassword, newPassword }),
    onSuccess: (message) => {
      toast({
        title: "Sucesso",
        description: message || "Senha atualizada com sucesso",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.currentPassword || !formState.newPassword || !formState.confirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (formState.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (formState.newPassword !== formState.confirmPassword) {
      toast({
        title: "Erro",
        description: "A confirmação deve ser igual à nova senha",
        variant: "destructive",
      });
      return;
    }

    if (formState.currentPassword === formState.newPassword) {
      toast({
        title: "Erro",
        description: "A nova senha deve ser diferente da atual",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: formState.currentPassword,
      newPassword: formState.newPassword,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Trocar Senha</DialogTitle>
          <DialogDescription>
            Atualize a sua senha de acesso. Certifique-se de escolher uma senha forte e manter suas credenciais em segurança.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formState.currentPassword}
              onChange={(event) => setFormState((prev) => ({ ...prev, currentPassword: event.target.value }))}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              type="password"
              value={formState.newPassword}
              onChange={(event) => setFormState((prev) => ({ ...prev, newPassword: event.target.value }))}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formState.confirmPassword}
              onChange={(event) => setFormState((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              autoComplete="new-password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={changePasswordMutation.isPending}>
            {changePasswordMutation.isPending ? "Atualizando..." : "Atualizar Senha"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
