import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface FaqItem {
  q: string;
  a: string;
  icon: string;
}

const faqs: FaqItem[] = [
  {
    icon: 'Search',
    q: 'Как искать сайты?',
    a: 'Введите запрос в строку поиска на главной странице или на странице поиска. Система найдёт все сайты из базы, которые соответствуют вашему запросу по названию, описанию или тегам.',
  },
  {
    icon: 'Monitor',
    q: 'Как открыть сайт внутри поисковика?',
    a: 'Нажмите на любой результат поиска — сайт откроется во встроенном просмотрщике прямо внутри приложения. Вы также можете открыть его в новой вкладке по иконке внешней ссылки.',
  },
  {
    icon: 'ShieldX',
    q: 'Как заблокировать сайт?',
    a: 'Перейдите в Админ-панель, введите пароль (admin123), переключитесь на вкладку "Заблокированные" и добавьте URL или его часть с указанием причины. После этого сайт будет недоступен для просмотра.',
  },
  {
    icon: 'Plus',
    q: 'Как добавить сайт в базу?',
    a: 'В Админ-панели на вкладке "Сайты" заполните URL, название, описание и теги нового сайта и нажмите "Добавить". Сайт сразу появится в результатах поиска.',
  },
  {
    icon: 'ShieldCheck',
    q: 'Как работает блокировка рекламы?',
    a: 'Встроенный просмотрщик использует sandbox-режим iframe, который ограничивает выполнение сторонних скриптов и всплывающих окон, что значительно снижает количество рекламы.',
  },
  {
    icon: 'Lock',
    q: 'Какой пароль от админки?',
    a: 'Пароль по умолчанию: admin123. В будущих версиях можно будет изменить его в настройках.',
  },
];

export default function Help() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="min-h-screen pt-14">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-1">Помощь</h1>
        <p className="text-sm text-muted-foreground mb-6">Ответы на частые вопросы</p>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-secondary/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon name={faq.icon} size={20} className="text-primary" />
                  </div>
                  <span className="flex-1 font-medium">{faq.q}</span>
                  <Icon
                    name="ChevronDown"
                    size={18}
                    className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pl-[4.5rem] animate-fade-in">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center animate-fade-in">
          <Icon name="MessageCircle" size={28} className="text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Остались вопросы?</h3>
          <p className="text-sm text-muted-foreground">
            Напишите нам в{' '}
            <a href="https://t.me/+QgiLIa1gFRY4Y2Iy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Telegram-сообщество
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
