
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
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
import BlogPost from "./pages/BlogPost";
import Projects from "./pages/Projects";
import Suppliers from "./pages/Suppliers";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import YandexCallback from "./pages/YandexCallback";
import Showroom from "./pages/Showroom";
import Tariffs from "./pages/Tariffs";
import LemanaProCatalog from "./pages/LemanaProCatalog";
import Prices from "./pages/Prices";
import Masters from "./pages/Masters";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import EstimatePrint from "./pages/EstimatePrint";
import DocsPrint from "./pages/DocsPrint";
import Windows from "./pages/Windows";
import WindowPrint from "./pages/WindowPrint";
import Ceilings from "./pages/Ceilings";
import CeilingPrint from "./pages/CeilingPrint";
import Flooring from "./pages/Flooring";
import FlooringPrint from "./pages/FlooringPrint";
import Partner from "./pages/Partner";
import Electrics from "./pages/Electrics";
import ElectricsPrint from "./pages/ElectricsPrint";
import Bathroom from "./pages/Bathroom";
import BathroomPrint from "./pages/BathroomPrint";
import NewbuildRenovation from "./pages/NewbuildRenovation";
import NewbuildPrint from "./pages/NewbuildPrint";
import TurnkeyRenovation from "./pages/TurnkeyRenovation";
import TurnkeyPrint from "./pages/TurnkeyPrint";
import Organizer from "./pages/Organizer";
import Expert from "./pages/Expert";
import BathHouse from "./pages/BathHouse";
import BathHousePrint from "./pages/BathHousePrint";
import FrameHouse from "./pages/FrameHouse";
import FrameHousePrint from "./pages/FrameHousePrint";
import RbcParser from "./pages/RbcParser";
import YukassaCabinet from "./pages/YukassaCabinet";
import OfficeCalc from "./pages/OfficeCalc";
import CityLanding from "./pages/CityLanding";
import NotFound from "./pages/NotFound";
import CookieBanner from "./components/CookieBanner";
import ChatWidget from "./components/ChatWidget";
import InstallPWABanner from "./components/pwa/InstallPWABanner";
import VisitorLeadPopup from "./components/VisitorLeadPopup";
import LeadCapturePopup from "./components/LeadCapturePopup";

const queryClient = new QueryClient();

const App = () => {
  return (
    <HelmetProvider>
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
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/showroom" element={<Showroom />} />
            <Route path="/tariffs" element={<Tariffs />} />
            <Route path="/lemanapro" element={<LemanaProCatalog />} />
            <Route path="/prices" element={<Prices />} />
            <Route path="/masters" element={<Masters />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/estimate/print" element={<EstimatePrint />} />
            <Route path="/docs/print" element={<DocsPrint />} />
            <Route path="/windows" element={<Windows />} />
            <Route path="/windows/print" element={<WindowPrint />} />
            <Route path="/ceilings" element={<Ceilings />} />
            <Route path="/ceilings/print" element={<CeilingPrint />} />
            <Route path="/flooring" element={<Flooring />} />
            <Route path="/flooring/print" element={<FlooringPrint />} />
            <Route path="/partner" element={<Partner />} />
            <Route path="/electrics" element={<Electrics />} />
            <Route path="/electrics/print" element={<ElectricsPrint />} />
            <Route path="/bathroom" element={<Bathroom />} />
            <Route path="/bathroom/print" element={<BathroomPrint />} />
            <Route path="/newbuild" element={<NewbuildRenovation />} />
            <Route path="/newbuild/print" element={<NewbuildPrint />} />
            <Route path="/turnkey" element={<TurnkeyRenovation />} />
            <Route path="/turnkey/print" element={<TurnkeyPrint />} />
            <Route path="/organizer" element={<Organizer />} />
            <Route path="/expert" element={<Expert />} />
            <Route path="/bathhouse" element={<BathHouse />} />
            <Route path="/bathhouse/print" element={<BathHousePrint />} />
            <Route path="/framehouse" element={<FrameHouse />} />
            <Route path="/framehouse/print" element={<FrameHousePrint />} />
            <Route path="/auth/yandex/callback" element={<YandexCallback />} />
            <Route path="/rbc-parser" element={<RbcParser />} />
            <Route path="/yukassa" element={<YukassaCabinet />} />
            <Route path="/office" element={<OfficeCalc />} />
            <Route path="/city/:slug" element={<CityLanding />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieBanner />
          <ChatWidget />
          <InstallPWABanner />
          <VisitorLeadPopup />
          <LeadCapturePopup />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;