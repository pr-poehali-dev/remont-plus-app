import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useMeta } from "@/hooks/useMeta";
import SEOMeta from "@/components/SEOMeta";
import { AUTH_URL, DEMO_MASTERS, Master, User } from "@/components/master/masterTypes";
import MasterCard from "@/components/master/MasterCard";
import MastersFilters from "@/components/master/MastersFilters";
import MasterCabinet from "@/components/master/MasterCabinet";
import BuilderDashboard from "@/components/master/BuilderDashboard";

const BUILDER_PLANS = [
  { code: "start", name: "Старт", price: 25000, leads: 5, color: "border-gray-200" },
  { code: "business", name: "Бизнес", price: 59000, leads: 15, color: "border-blue-300", popular: true },
  { code: "pro", name: "Про", price: 99000, leads: 30, color: "border-orange-300" },
  { code: "unlim", name: "Безлимит", price: 200000, leads: null, color: "border-purple-300" },
];

export default function Masters() {
  const navigate = useNavigate();

  useMeta({
    title: "Мастера по ремонту — найти специалиста",
    description: "Каталог мастеров-отделочников по всей России: укладка плитки, покраска, гипсокартон, натяжные потолки. Реальные отзывы, портфолио, гарантии. Свяжитесь напрямую.",
    keywords: "мастера по ремонту, отделочники, найти мастера плитка, ремонт квартиры специалист, бригада ремонт",
    canonical: "/masters",
  });

  useEffect(() => {
    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Как найти мастера по ремонту квартиры?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "На АВАНГАРД вы можете найти проверенных мастеров-отделочников по всей России. Выберите специализацию, регион, изучите портфолио и отзывы — затем свяжитесь напрямую без посредников."
          }
        },
        {
          "@type": "Question",
          "name": "Какие работы выполняют мастера на АВАНГАРД?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Мастера выполняют все виды отделочных работ: укладка плитки, стяжка полов, гипсокартон, покраска и штукатурка стен, натяжные потолки, монтаж напольных покрытий, электромонтаж и сантехника."
          }
        },
        {
          "@type": "Question",
          "name": "Есть ли гарантия на работы мастеров?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Все партнёры АВАНГАРД проходят верификацию. Мастера со значком «Проверенный партнёр» предоставляют гарантию на выполненные работы. Условия гарантии уточняйте напрямую у исполнителя."
          }
        },
        {
          "@type": "Question",
          "name": "В каких городах работают мастера?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Мастера работают по всей России: Москва, Санкт-Петербург, Екатеринбург, Новосибирск, Краснодар, Казань, Нижний Новгород, Самара, Ростов-на-Дону, Тюмень, Челябинск и другие города."
          }
        },
        {
          "@type": "Question",
          "name": "Как стать мастером на АВАНГАРД?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Зарегистрируйтесь как партнёр на странице /partner, заполните профиль с портфолио и специализацией. После модерации (до 24 часов) начнёте получать заявки от клиентов."
          }
        }
      ]
    };

    const id = "faq-jsonld-masters";
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = id;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(faq);

    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("rating");
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showBuilderDashboard, setShowBuilderDashboard] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [contractorId, setContractorId] = useState<number | null>(null);

  const stored = localStorage.getItem("avangard_user");
  const user: User | null = stored ? JSON.parse(stored) : null;

  useEffect(() => {
    fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_masters_list" }),
    })
      .then((r) => r.json())
      .then((data) => {
        const list: Master[] = data.masters || [];
        setMasters(list.length > 0 ? list : DEMO_MASTERS);
      })
      .catch(() => setMasters(DEMO_MASTERS))
      .finally(() => setLoading(false));
  }, [completed]);

  const loadContractorProfile = (cb: (id: number | null) => void) => {
    if (!user) { navigate("/login"); return; }
    fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_master_profile", user_id: user.id }),
    })
      .then((r) => r.json())
      .then((data) => { cb(data.profile?.id ?? null); })
      .catch(() => cb(null));
  };

  const handleBecomeMaster = () => {
    loadContractorProfile((id) => {
      setContractorId(id);
      setShowQuestionnaire(true);
    });
  };

  const handleBuilderLogin = () => {
    loadContractorProfile((id) => {
      setContractorId(id);
      setShowBuilderDashboard(true);
    });
  };

  const filtered = masters
    .filter((m) => {
      const q = search.toLowerCase();
      return (
        m.full_name.toLowerCase().includes(q) ||
        (m.specializations || []).some((s) => s.toLowerCase().includes(q)) ||
        (m.location || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "experience") return b.experience_years - a.experience_years;
      if (sort === "reviews") return b.reviews - a.reviews;
      return 0;
    });

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="CheckCircle" size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Анкета заполнена!</h2>
          <p className="text-gray-500 mb-6">
            Ваш профиль мастера сохранён. Теперь вы будете появляться в каталоге.
          </p>
          <Button
            onClick={() => { setCompleted(false); setShowQuestionnaire(false); }}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Вернуться к каталогу
          </Button>
        </div>
      </div>
    );
  }

  if (showQuestionnaire && user) {
    return (
      <MasterCabinet
        user={user}
        contractorId={contractorId}
        onBack={() => setShowQuestionnaire(false)}
        onComplete={() => setCompleted(true)}
      />
    );
  }

  if (showBuilderDashboard && user) {
    return (
      <BuilderDashboard
        user={user}
        contractorId={contractorId}
        onBack={() => setShowBuilderDashboard(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOMeta
        title="Найти мастера по ремонту — строители и отделочники"
        description="Найдите проверенного мастера по ремонту квартиры, дома или офиса. Строители, отделочники, электрики, сантехники с опытом и отзывами."
        keywords="найти мастера по ремонту, строители отделочники, нанять строителя"
        path="/masters"
      />
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm"
          >
            <Icon name="ArrowLeft" size={16} /> Назад
          </button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Мастера и строители</h1>
              <p className="text-gray-500 mt-1">Проверенные специалисты по ремонту</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleBuilderLogin}
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50 shrink-0"
              >
                <Icon name="Building2" size={16} className="mr-2" />
                Кабинет строителя
              </Button>
              <Button
                onClick={handleBecomeMaster}
                className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
              >
                <Icon name="UserPlus" size={16} className="mr-2" />
                Стать мастером
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Баннер для строительных компаний */}
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-0">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 p-6 md:p-8 mb-2">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute right-12 bottom-0 w-28 h-28 bg-orange-500/20 rounded-full" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="text-white">
              <div className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <Icon name="Building2" size={12} />
                Для строительных компаний
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold mb-1 leading-snug">
                Получайте заявки на ремонт от 1.5 млн ₽
              </h2>
              <p className="text-white/70 text-sm md:text-base max-w-md">
                Автоматическое распределение заявок с калькулятора по 15 городам-миллионникам. Реальные клиенты, проверенный бюджет.
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                {BUILDER_PLANS.map(p => (
                  <div key={p.code} className="text-center">
                    <p className="text-white font-bold">{p.price.toLocaleString("ru-RU")} ₽</p>
                    <p className="text-white/50 text-xs">{p.name} · {p.leads ? `${p.leads} заявок` : "∞"}</p>
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={handleBuilderLogin}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shrink-0 shadow-lg px-7"
            >
              <Icon name="LogIn" size={17} className="mr-2" />
              Подключиться
            </Button>
          </div>
        </div>
      </div>

      {/* Каталог для заказчиков */}
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-0">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 p-6 md:p-8 mb-6">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full" />
          <div className="absolute -right-2 bottom-0 w-28 h-28 bg-white/10 rounded-full" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="text-white">
              <div className="inline-flex items-center gap-1.5 bg-white/20 text-white/90 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <Icon name="FileCheck" size={12} />
                Бесплатно — за 2 минуты
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold mb-1 leading-snug">
                Приходите к мастеру с готовой сметой
              </h2>
              <p className="text-white/85 text-sm md:text-base max-w-md">
                Не торгуйтесь вслепую. Наш калькулятор считает стоимость работ по реальным расценкам — покажите документ, и цена будет честной.
              </p>
            </div>
            <Button
              onClick={() => navigate('/calculator')}
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl shrink-0 shadow-lg shadow-blue-700/20 px-7"
            >
              <Icon name="FileText" size={17} className="mr-2" />
              Составить смету
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <MastersFilters
          search={search}
          sort={sort}
          onSearchChange={setSearch}
          onSortChange={setSort}
        />

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Icon name="Loader2" size={32} className="animate-spin mr-3" />
            Загружаем мастеров...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Icon name="UserX" size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">
              {masters.length === 0 ? "Мастера ещё не зарегистрированы" : "Мастера не найдены"}
            </p>
            {masters.length === 0 && (
              <p className="text-sm mt-1">Станьте первым мастером в каталоге!</p>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">Найдено: {filtered.length}</p>
            <div className="space-y-4">
              {filtered.map((master) => (
                <MasterCard key={master.id} master={master} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
