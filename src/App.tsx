
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/AdminPanel";
import { ChatGPTPlaygroundPage } from "@/components/extensions/chatgpt-polza/ChatGPTPlaygroundPage";
import { YasenAdminPanel } from "@/components/admin/YasenAdminPanel";
import { VoiceChat } from "@/components/voice/VoiceChat";

const queryClient = new QueryClient();
const CHATGPT_API_URL = "https://functions.poehali.dev/00a8f93c-2a78-4e87-83ba-786960f47f06";

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chatgpt" element={<ChatGPTPlaygroundPage apiUrl={CHATGPT_API_URL} defaultModel="openai/gpt-4o-mini" />} />
            <Route path="/admin" element={<YasenAdminPanel />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
            <Route path="/yasen" element={<VoiceChat />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;