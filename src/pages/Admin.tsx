import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminMaterialsTab, { type Material } from "@/components/admin/AdminMaterialsTab";
import AdminProductsTab, { type Product } from "@/components/admin/AdminProductsTab";
import AdminStatsTab from "@/components/admin/AdminStatsTab";
import AdminPortfolioTab, { type PortfolioItem } from "@/components/admin/AdminPortfolioTab";
import AdminReviewsTab, { type ReviewItem } from "@/components/admin/AdminReviewsTab";
import AdminShowroomTab, { type ShowroomItemDB } from "@/components/admin/AdminShowroomTab";
import AdminBlogTab from "@/components/admin/AdminBlogTab";
import AdminPartnerLeadsTab, { type PartnerLead } from "@/components/admin/AdminPartnerLeadsTab";
import AdminReportTab from "@/components/admin/AdminReportTab";
import AdminLegalTab from "@/components/admin/AdminLegalTab";
import AdminMarketingTab from "@/components/admin/AdminMarketingTab";
import AdminSalesTab from "@/components/admin/AdminSalesTab";
import AdminMediaTab from "@/components/admin/AdminMediaTab";
import AdminVideosTab from "@/components/admin/AdminVideosTab";
import AdminCompanyParserTab from "@/components/admin/AdminCompanyParserTab";
import AdminVisitorLeadsTab from "@/components/admin/AdminVisitorLeadsTab";

const SUPPLIERS_URL = 'https://functions.poehali.dev/735f02a5-eb3f-4e4b-b378-7564c92b8e00';
const MATERIALS_URL = 'https://functions.poehali.dev/dd454a25-9f55-4cfb-9e59-736a4a1256fd';
const ADMIN_API = 'https://functions.poehali.dev/874af9cd-edd6-471e-b6d4-e68c828e6dca';
const PARTNER_LEAD_URL = 'https://functions.poehali.dev/89a93896-7725-4f8e-b42b-561db9546fd8';
const SHOWROOM_URL = 'https://functions.poehali.dev/00d5617d-4889-4550-bc82-d94492e380ba';

export default function Admin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [showroomItems, setShowroomItems] = useState<ShowroomItemDB[]>([]);
  const [partnerLeads, setPartnerLeads] = useState<PartnerLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("avangard_user");
    if (!saved) { navigate("/login"); return; }
    try {
      const u = JSON.parse(saved);
      if (u.role !== "admin") { navigate("/"); return; }
    } catch { navigate("/login"); return; }

    loadProducts();
    loadMaterials();
    loadPortfolio();
    loadReviews();
    loadShowroom();
    loadPartnerLeads();
  }, []);

  const loadPartnerLeads = async () => {
    try {
      const res = await fetch(PARTNER_LEAD_URL, {
        headers: { "X-Admin-Token": "admin2025" },
      });
      if (res.ok) {
        const data = await res.json();
        setPartnerLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Error loading partner leads:', error);
    }
  };

  const loadShowroom = async () => {
    try {
      const res = await fetch(SHOWROOM_URL);
      if (res.ok) {
        const data = await res.json();
        setShowroomItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading showroom:', error);
    }
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(SUPPLIERS_URL);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      const response = await fetch(MATERIALS_URL);
      if (response.ok) {
        const data = await response.json();
        setMaterials(data.materials || []);
      }
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  };

  const loadPortfolio = async () => {
    try {
      const response = await fetch(`${ADMIN_API}?action=portfolio`, {
        headers: { "X-Admin-Token": "admin2025" },
      });
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data.items || []);
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await fetch(`${ADMIN_API}?action=reviews`, {
        headers: { "X-Admin-Token": "admin2025" },
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data.items || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumbs
        items={[
          { label: "Главная", path: "/" },
          { label: "Личный кабинет", path: "/profile" },
          { label: "Админ-панель", path: "/admin" }
        ]}
      />
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Админ-панель</h1>
                <p className="text-sm text-gray-600">Управление контентом сайта</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="showroom" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="showroom" className="gap-1.5">
              <Icon name="Layers" className="h-4 w-4" />
              Шоурум
              {showroomItems.length > 0 && <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 h-4">{showroomItems.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-1.5">
              <Icon name="Image" className="h-4 w-4" />
              Портфолио
              {portfolio.length > 0 && <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 h-4">{portfolio.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-1.5">
              <Icon name="MessageSquare" className="h-4 w-4" />
              Отзывы
              {reviews.length > 0 && <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 h-4">{reviews.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="materials" className="gap-1.5">
              <Icon name="Layers" className="h-4 w-4" />
              Материалы
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5">
              <Icon name="Package" className="h-4 w-4" />
              Товары
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-1.5">
              <Icon name="Video" className="h-4 w-4" />
              Видео
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-1.5">
              <Icon name="ImagePlay" className="h-4 w-4" />
              Медиатека
            </TabsTrigger>
            <TabsTrigger value="blog" className="gap-1.5">
              <Icon name="Newspaper" className="h-4 w-4" />
              Блог
            </TabsTrigger>
            <TabsTrigger value="partner-leads" className="gap-1.5">
              <Icon name="Handshake" className="h-4 w-4" />
              Партнёры
              {partnerLeads.filter(l => l.status === "new").length > 0 && (
                <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 h-4">
                  {partnerLeads.filter(l => l.status === "new").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-1.5">
              <Icon name="BarChart3" className="h-4 w-4" />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="report" className="gap-1.5">
              <Icon name="FileSpreadsheet" className="h-4 w-4" />
              Отчёт
            </TabsTrigger>
            <TabsTrigger value="legal" className="gap-1.5">
              <Icon name="Scale" className="h-4 w-4" />
              Юрист
            </TabsTrigger>
            <TabsTrigger value="marketing" className="gap-1.5">
              <Icon name="Sparkles" className="h-4 w-4" />
              Маркетолог
            </TabsTrigger>
            <TabsTrigger value="sales" className="gap-1.5">
              <Icon name="TrendingUp" className="h-4 w-4" />
              Продажи
            </TabsTrigger>
            <TabsTrigger value="leads-parser" className="gap-1.5">
              <Icon name="DatabaseZap" className="h-4 w-4" />
              Лидогенерация
            </TabsTrigger>
            <TabsTrigger value="company-parser" className="gap-1.5">
              <Icon name="Building2" className="h-4 w-4" />
              База компаний
            </TabsTrigger>
            <TabsTrigger value="visitor-leads" className="gap-1.5">
              <Icon name="Users" className="h-4 w-4" />
              Подписчики
            </TabsTrigger>
          </TabsList>

          <TabsContent value="showroom">
            <AdminShowroomTab items={showroomItems} onReload={loadShowroom} />
          </TabsContent>

          <TabsContent value="portfolio">
            <AdminPortfolioTab items={portfolio} onReload={loadPortfolio} />
          </TabsContent>

          <TabsContent value="reviews">
            <AdminReviewsTab items={reviews} onReload={loadReviews} />
          </TabsContent>

          <TabsContent value="materials">
            <AdminMaterialsTab materials={materials} onReload={loadMaterials} />
          </TabsContent>

          <TabsContent value="products">
            <AdminProductsTab products={products} isLoading={isLoading} onReload={loadProducts} />
          </TabsContent>

          <TabsContent value="videos">
            <AdminVideosTab />
          </TabsContent>

          <TabsContent value="media">
            <AdminMediaTab />
          </TabsContent>

          <TabsContent value="blog">
            <AdminBlogTab />
          </TabsContent>

          <TabsContent value="partner-leads">
            <AdminPartnerLeadsTab leads={partnerLeads} onReload={loadPartnerLeads} />
          </TabsContent>

          <TabsContent value="stats">
            <AdminStatsTab materials={materials} products={products} />
          </TabsContent>

          <TabsContent value="report">
            <AdminReportTab />
          </TabsContent>

          <TabsContent value="legal">
            <AdminLegalTab />
          </TabsContent>

          <TabsContent value="marketing">
            <AdminMarketingTab />
          </TabsContent>

          <TabsContent value="sales">
            <AdminSalesTab />
          </TabsContent>
          <TabsContent value="company-parser">
            <AdminCompanyParserTab />
          </TabsContent>

          <TabsContent value="visitor-leads">
            <AdminVisitorLeadsTab />
          </TabsContent>

          <TabsContent value="leads-parser">
            <div className="text-center py-12">
              <a href="/rbc-parser" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-5 bg-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-lg hover:opacity-90 transition-opacity">
                <Icon name="DatabaseZap" className="h-6 w-6" />
                Открыть инструмент парсинга
              </a>
              <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
                Сбор контактов компаний с companies.rbc.ru и orgpage.ru по нужной категории. Выгрузка в CSV для холодной базы.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}