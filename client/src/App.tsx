import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { useEffect } from "react";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Videos from "@/pages/videos";
import Progress from "@/pages/progress";
import AdminDashboard from "@/pages/admin-dashboard";
import Users from "@/pages/users";
import Reports from "@/pages/reports";
import VideoManagement from "@/pages/video-management";
import VideoPlayer from "@/pages/video-player";
import Documents from "@/pages/documents";
import Announcements from "@/pages/announcements";
import DocumentManagement from "@/pages/document-management";
import AnnouncementManagement from "@/pages/announcement-management";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/videos" component={Videos} />
      <Route path="/progress" component={Progress} />
      <Route path="/documents" component={Documents} />
      <Route path="/announcements" component={Announcements} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/users" component={Users} />
      <Route path="/reports" component={Reports} />
      <Route path="/video-management" component={VideoManagement} />
      <Route path="/document-management" component={DocumentManagement} />
      <Route path="/announcement-management" component={AnnouncementManagement} />
      <Route path="/video/:id" component={VideoPlayer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.title = "PAPEM-35 - Sistema de Adestramento";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
