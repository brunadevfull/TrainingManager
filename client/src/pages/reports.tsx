import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, BarChart3, Award, Clock, Download } from "lucide-react";
import { exportToCsv, downloadFile } from "@/lib/utils";

export default function Reports() {
  const { user, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!user) {
      setLocation("/");
    } else if (!isAdmin) {
      setLocation("/dashboard");
    }
  }, [user, isAdmin, setLocation]);

  if (!user || !isAdmin) {
    return null;
  }

  const { data: progressReport } = useQuery({
    queryKey: ["/api/reports/progress"],
  });

  const generateProgressReport = () => {
    if (!progressReport) {
      toast({
        title: "Erro",
        description: "Dados não disponíveis para gerar relatório",
        variant: "destructive",
      });
      return;
    }

    const csvData = progressReport.users.map((user: any) => ({
      Nome: user.name,
      NIP: user.nip,
      "Posto/Graduação": user.rank || "-",
      "Vídeos Concluídos": user.completedVideos || 0,
      "Tempo Total (min)": Math.round((user.totalWatchTime || 0) / 60),
      "Certificados": user.certificates || 0,
      "Último Acesso": user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : "-",
    }));

    exportToCsv(csvData, `relatorio-progresso-${new Date().toISOString().split('T')[0]}.csv`);
    
    toast({
      title: "Sucesso",
      description: "Relatório gerado e baixado com sucesso",
    });
  };

  const generateCertificatesReport = () => {
    if (!progressReport) {
      toast({
        title: "Erro",
        description: "Dados não disponíveis para gerar relatório",
        variant: "destructive",
      });
      return;
    }

    const certificatesData = progressReport.users
      .filter((user: any) => user.certificates > 0)
      .map((user: any) => ({
        Nome: user.name,
        NIP: user.nip,
        "Certificados Emitidos": user.certificates,
        "Data Cadastro": new Date(user.createdAt).toLocaleDateString('pt-BR'),
      }));

    exportToCsv(certificatesData, `relatorio-certificados-${new Date().toISOString().split('T')[0]}.csv`);
    
    toast({
      title: "Sucesso",
      description: "Relatório de certificados gerado com sucesso",
    });
  };

  const generateUsageReport = () => {
    if (!progressReport) {
      toast({
        title: "Erro",
        description: "Dados não disponíveis para gerar relatório",
        variant: "destructive",
      });
      return;
    }

    const usageData = progressReport.videos.map((video: any) => ({
      "Título do Vídeo": video.title,
      "Categoria": video.category,
      "Duração (min)": Math.round(video.duration / 60),
      "Visualizações": video.views,
      "Conclusões": video.completions,
      "Taxa de Conclusão (%)": video.views > 0 ? Math.round((video.completions / video.views) * 100) : 0,
    }));

    exportToCsv(usageData, `relatorio-uso-${new Date().toISOString().split('T')[0]}.csv`);
    
    toast({
      title: "Sucesso",
      description: "Relatório de uso gerado com sucesso",
    });
  };

  return (
    <div className="min-h-screen bg-[var(--navy-light)]">
      <Navbar />
      
      <div className="flex">
        <Sidebar className="w-64 flex-shrink-0" />
        
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Relatórios</h1>
            <Button className="btn-navy" onClick={generateProgressReport}>
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Relatório de Progresso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Visualize o progresso geral dos usuários por vídeo e categoria.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full btn-navy-outline"
                  onClick={generateProgressReport}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Gerar
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Relatório de Certificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Lista de todos os certificados emitidos com datas e usuários.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full btn-navy-outline"
                  onClick={generateCertificatesReport}
                >
                  <Award className="w-4 h-4 mr-2" />
                  Gerar
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Relatório de Uso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Estatísticas de uso do sistema e tempo de visualização.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full btn-navy-outline"
                  onClick={generateUsageReport}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Gerar
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Filtros de Relatório</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Últimos 30 dias</SelectItem>
                      <SelectItem value="90">Últimos 3 meses</SelectItem>
                      <SelectItem value="365">Último ano</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="security">Segurança</SelectItem>
                      <SelectItem value="operations">Operações</SelectItem>
                      <SelectItem value="communications">Comunicações</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Select defaultValue="csv">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button className="w-full btn-navy" onClick={generateProgressReport}>
                    <Download className="w-4 h-4 mr-2" />
                    Gerar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
