import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/ErrorBoundary";
import RouteLoader from "./components/RouteLoader";
import PopupOrchestrator from "./components/PopupOrchestrator";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const AIChat = lazy(() => import("./pages/AIChat"));
const Designer = lazy(() => import("./pages/Designer"));
const DesignerStage = lazy(() => import("./pages/DesignerStage"));
const Calculator = lazy(() => import("./pages/Calculator"));
const Catalog = lazy(() => import("./pages/Catalog"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Projects = lazy(() => import("./pages/Projects"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));
const YandexCallback = lazy(() => import("./pages/YandexCallback"));
const Showroom = lazy(() => import("./pages/Showroom"));
const Tariffs = lazy(() => import("./pages/Tariffs"));
const LemanaProCatalog = lazy(() => import("./pages/LemanaProCatalog"));
const Prices = lazy(() => import("./pages/Prices"));
const Masters = lazy(() => import("./pages/Masters"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const EstimatePrint = lazy(() => import("./pages/EstimatePrint"));
const DocsPrint = lazy(() => import("./pages/DocsPrint"));
const Windows = lazy(() => import("./pages/Windows"));
const WindowPrint = lazy(() => import("./pages/WindowPrint"));
const Ceilings = lazy(() => import("./pages/Ceilings"));
const CeilingPrint = lazy(() => import("./pages/CeilingPrint"));
const Flooring = lazy(() => import("./pages/Flooring"));
const FlooringPrint = lazy(() => import("./pages/FlooringPrint"));
const Partner = lazy(() => import("./pages/Partner"));
const Electrics = lazy(() => import("./pages/Electrics"));
const ElectricsPrint = lazy(() => import("./pages/ElectricsPrint"));
const Bathroom = lazy(() => import("./pages/Bathroom"));
const BathroomPrint = lazy(() => import("./pages/BathroomPrint"));
const NewbuildRenovation = lazy(() => import("./pages/NewbuildRenovation"));
const NewbuildPrint = lazy(() => import("./pages/NewbuildPrint"));
const TurnkeyRenovation = lazy(() => import("./pages/TurnkeyRenovation"));
const TurnkeyPrint = lazy(() => import("./pages/TurnkeyPrint"));
const Organizer = lazy(() => import("./pages/Organizer"));
const Expert = lazy(() => import("./pages/Expert"));
const BathHouse = lazy(() => import("./pages/BathHouse"));
const BathHousePrint = lazy(() => import("./pages/BathHousePrint"));
const FrameHouse = lazy(() => import("./pages/FrameHouse"));
const FrameHousePrint = lazy(() => import("./pages/FrameHousePrint"));
const RbcParser = lazy(() => import("./pages/RbcParser"));
const OfficeCalc = lazy(() => import("./pages/OfficeCalc"));
const CityLanding = lazy(() => import("./pages/CityLanding"));
const Furniture = lazy(() => import("./pages/Furniture"));
const ReadyProjects = lazy(() => import("./pages/ReadyProjects"));
const Account = lazy(() => import("./pages/Account"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PriceMonitor = lazy(() => import("./pages/PriceMonitor"));
const Planoplan = lazy(() => import("./pages/Planoplan"));
const InteriorPlanner = lazy(() => import("./pages/InteriorPlanner"));
const Homestaging = lazy(() => import("./pages/Homestaging"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
              <Suspense fallback={<RouteLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/furniture" element={<Furniture />} />
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
                  <Route path="/office" element={<OfficeCalc />} />
                  <Route path="/city/:slug" element={<CityLanding />} />
                  <Route path="/ready-projects" element={<ReadyProjects />} />
                  <Route path="/price-monitor" element={<PriceMonitor />} />
                  <Route path="/planoplan" element={<Planoplan />} />
                  <Route path="/interior-planner" element={<InteriorPlanner />} />
                  <Route path="/homestaging" element={<Homestaging />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
            <PopupOrchestrator />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
