import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SEOMeta from "@/components/SEOMeta";
import { toast } from "sonner";

const REFERRALS_URL = "https://functions.poehali.dev/4d5b1e32-287c-41a5-992c-365d1b58dd97";

interface ReferralStats {
  invited_total: number;
  rewards_count: number;
  rewards_sum: number;
}

interface InvitedUser {
  id: number;
  name: string;
  email: string;
  created_at: string | null;
}

export default function Invite() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [link, setLink] = useState("");
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [invited, setInvited] = useState<InvitedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("avangard_user");
      if (!raw) {
        navigate("/login?redirect=/invite");
        return;
      }
      const u = JSON.parse(raw);
      if (!u?.id) {
        navigate("/login?redirect=/invite");
        return;
      }
      setUserId(u.id);
    } catch {
      navigate("/login?redirect=/invite");
    }
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      fetch(REFERRALS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_my_code", user_id: userId }),
      }).then((r) => r.json()),
      fetch(REFERRALS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_invited_list", user_id: userId }),
      }).then((r) => r.json()),
    ])
      .then(([codeData, listData]) => {
        setCode(codeData?.code || "");
        setLink(codeData?.invite_link || "");
        setStats(codeData?.stats || null);
        setInvited(Array.isArray(listData?.invited) ? listData.invited : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const copy = (text: string, label = "Ссылка") => {
    navigator.clipboard?.writeText(text);
    toast.success(`${label} скопирована`);
  };

  const share = async () => {
    const shareData = {
      title: "АВАНГАРД — Калькулятор ремонта",
      text: "Рассчитай стоимость ремонта за 2 минуты. Лови мою скидку:",
      url: link,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        copy(link);
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <SEOMeta
        title="Пригласи друзей — АВАНГАРД"
        description="Поделитесь сервисом с друзьями и получайте бонусы за каждого приглашённого."
      />
      <SiteHeader />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-white">
            Пригласи друзей — заработай бонусы
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            За каждого друга, который зарегистрируется по вашей ссылке — <b>+500 ₽ на баланс</b>.
            А друг получит скидку 10% на первый платёж.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Приглашено</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats?.invited_total ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Бонусы</div>
              <div className="text-2xl font-bold text-emerald-600">
                {stats?.rewards_sum ?? 0} ₽
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Начислений</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats?.rewards_count ?? 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invite link */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Link2" className="w-5 h-5 text-orange-500" />
              Ваша персональная ссылка
            </CardTitle>
            <CardDescription>
              Поделитесь этой ссылкой с друзьями, коллегами или клиентами
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            ) : (
              <>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <Icon name="Link" className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="flex-1 text-sm text-slate-700 dark:text-slate-200 font-mono truncate">
                    {link}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => copy(link)}>
                    <Icon name="Copy" className="w-4 h-4 mr-1" />
                    Копировать
                  </Button>
                </div>

                <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-lg p-3">
                  <Icon name="Tag" className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    Или код: <b className="font-mono">{code}</b>
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => copy(code, "Код")} className="ml-auto">
                    Копировать
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button onClick={share} className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                    <Icon name="Share2" className="w-4 h-4 mr-1" />
                    Поделиться
                  </Button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Рассчитай ремонт быстро с АВАНГАРДОМ: ${link}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">
                      <Icon name="MessageCircle" className="w-4 h-4 mr-1" />
                      WhatsApp
                    </Button>
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(
                      "Рассчитай ремонт быстро с АВАНГАРДОМ"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">
                      <Icon name="Send" className="w-4 h-4 mr-1" />
                      Telegram
                    </Button>
                  </a>
                  <a
                    href={`https://vk.com/share.php?url=${encodeURIComponent(link)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">
                      <Icon name="Share" className="w-4 h-4 mr-1" />
                      ВКонтакте
                    </Button>
                  </a>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* How it works */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Как это работает</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  icon: "Send",
                  title: "Поделитесь ссылкой",
                  text: "Отправьте друзьям, коллегам, в чаты — где удобно",
                },
                {
                  icon: "UserPlus",
                  title: "Друг регистрируется",
                  text: "Получает скидку 10% на первый платёж",
                },
                {
                  icon: "Wallet",
                  title: "Вы получаете +500 ₽",
                  text: "На баланс, можно потратить на любые услуги",
                },
              ].map((s) => (
                <div key={s.title} className="flex flex-col items-start gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                    <Icon name={s.icon} className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{s.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{s.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invited list */}
        {invited.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Кого вы пригласили</CardTitle>
              <CardDescription>Последние {invited.length} приглашений</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {invited.map((u) => (
                  <div key={u.id} className="py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                      {u.name.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white truncate">
                        {u.name || "Без имени"}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {u.email}
                      </div>
                    </div>
                    {u.created_at && (
                      <div className="text-xs text-slate-400 shrink-0">
                        {new Date(u.created_at).toLocaleDateString("ru-RU")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
