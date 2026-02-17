
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AIChat from "./pages/AIChat";
import Designer from "./pages/Designer";
import DesignerStage from "./pages/DesignerStage";
import Calculator from "./pages/Calculator";
import Catalog from "./pages/Catalog";
import Dashboard from "./pages/Dashboard";
import Blog from "./pages/Blog";
import Projects from "./pages/Projects";
import Suppliers from "./pages/Suppliers";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import YandexCallback from "./pages/YandexCallback";
import Showroom from "./pages/Showroom";
import LemanaProCatalog from "./pages/LemanaProCatalog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/designer" element={<Designer />} />
            <Route path="/designer/:stageId" element={<DesignerStage />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/showroom" element={<Showroom />} />
            <Route path="/lemanapro" element={<LemanaProCatalog />} />
            <Route path="/auth/yandex/callback" element={<YandexCallback />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;