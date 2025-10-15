import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { formatNIP } from "@/lib/utils";
import InstitutionalHeader from "@/components/institutional-header";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isLoading, user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nip: "",
    password: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nip || !formData.password) {
      toast({
        title: "Erro",
        description: "NIP e senha são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      await login(formData);
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleNipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedNip = formatNIP(value);
    setFormData({ ...formData, nip: formattedNip });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with naval patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-tl from-blue-900/50 via-transparent to-indigo-900/50"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
      </div>
      
      <InstitutionalHeader />
      
      <div className="relative z-10 flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          {/* Decorative elements */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
          
          <Card className="relative shadow-2xl border-0 bg-white/90 backdrop-blur-lg overflow-hidden">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--papem-header)] via-[var(--papem-gold)] to-[var(--papem-header)]"></div>
            
            <CardContent className="p-8 relative">
              {/* Decorative corner elements */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-[var(--papem-gold)] opacity-50"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-[var(--papem-gold)] opacity-50"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-[var(--papem-gold)] opacity-50"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-[var(--papem-gold)] opacity-50"></div>
              
              <div className="text-center mb-8">
                <div className="relative flex items-center justify-center mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--papem-header)] to-[var(--papem-gold)] rounded-full w-28 h-28 blur-xl opacity-20 animate-pulse"></div>
                  <div className="relative bg-white p-3 rounded-full shadow-lg border-4 border-[var(--papem-gold)]">
                    <img 
                      src="/attached_assets/PAPEM - BRASÃO_1752587523720.png" 
                      alt="Brasão PAPEM-35" 
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--papem-header)] to-[var(--papem-gold)] bg-clip-text text-transparent mb-2 tracking-wider">
                  PAPEM-35
                </h1>
                <div className="w-16 h-1 bg-gradient-to-r from-[var(--papem-header)] to-[var(--papem-gold)] mx-auto mb-3"></div>
                <p className="text-sm text-gray-700 font-medium">Sistema de Adestramento</p>
                <p className="text-xs text-gray-500 mt-1 italic">Marinha do Brasil</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="nip" className="text-[var(--papem-header)] font-bold text-sm flex items-center">
                    <div className="w-2 h-2 bg-[var(--papem-gold)] rounded-full mr-2"></div>
                    NIP
                  </Label>
                  <div className="relative">
                    <Input
                      id="nip"
                      type="text"
                      placeholder="11.1111.11"
                      value={formData.nip}
                      onChange={handleNipChange}
                      maxLength={10}
                      required
                      className="h-14 text-center text-lg font-mono border-2 border-gray-300 focus:border-[var(--papem-header)] focus:ring-4 focus:ring-[var(--papem-header)]/20 bg-white/80 backdrop-blur-sm shadow-inner transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-[var(--papem-header)] font-bold text-sm flex items-center">
                    <div className="w-2 h-2 bg-[var(--papem-gold)] rounded-full mr-2"></div>
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      placeholder="Digite sua senha"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="h-14 border-2 border-gray-300 focus:border-[var(--papem-header)] focus:ring-4 focus:ring-[var(--papem-header)]/20 bg-white/80 backdrop-blur-sm shadow-inner transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-14 bg-[var(--papem-header)] hover:bg-[var(--papem-header)]/90 text-white font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Entrando...</span>
                      </div>
                    ) : (
                      "ENTRAR"
                    )}
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-600 mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-[var(--papem-header)]" />
                    <span className="font-semibold">Acesso Restrito</span>
                  </div>
                  <p className="text-xs">Marinha do Brasil - Sistema Oficial</p>
                </div>

                <div className="text-center text-xs text-gray-500 mt-4 p-3 bg-gray-50/80 rounded-lg">
                  <p className="font-medium mb-1">Credenciais de Teste:</p>
                  <p className="text-[var(--papem-header)] font-mono">Admin: 12.3456.78</p>
                  <p className="text-[var(--papem-header)] font-mono">Usuário: 98.7654.32</p>
                  <p className="mt-1 text-gray-400">Senha: password</p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}