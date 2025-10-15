import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, KeyRound } from "lucide-react";
import ChangePasswordDialog from "./change-password-dialog";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="nav-header text-white border-b border-[var(--papem-gold)]/20 backdrop-blur-sm">
      <div className="container-fluid px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--papem-gold)]/20 rounded-full blur-sm"></div>
              <div className="relative bg-white/90 p-1.5 rounded-full shadow-md">
                <img 
                  src="/attached_assets/PAPEM - BRASÃO_1752587523720.png" 
                  alt="Brasão PAPEM-35" 
                  className="w-7 h-7 object-contain"
                />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                PAPEM-35
              </h1>
              <p className="text-xs text-white/80 -mt-1">Sistema de Adestramento</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-200">
                <User className="w-4 h-4 mr-2" />
                <span className="font-medium">{user?.name || "Usuário"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border border-gray-200">
              <DropdownMenuItem
                className="hover:bg-gray-50"
                onSelect={(event) => {
                  event.preventDefault();
                  setIsChangePasswordOpen(true);
                }}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Trocar Senha
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-50 text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ChangePasswordDialog
            open={isChangePasswordOpen}
            onOpenChange={setIsChangePasswordOpen}
          />
        </div>
      </div>
    </nav>
  );
}
