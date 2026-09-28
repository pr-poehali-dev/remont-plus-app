import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = [
  {
    q: "Это бесплатно?",
    a: "Да. Расчёт сметы бесплатный и без ограничений. Платят подрядчики за доступ к заявкам, если вы решите искать исполнителя.",
  },
  {
    q: "Нужно регистрироваться?",
    a: "Нет. Смета считается сразу. Регистрация нужна только если хотите сохранить расчёт или отправить его мастерам.",
  },
  {
    q: "Насколько точен расчёт?",
    a: "Смета отражает рыночные цены вашего региона на момент расчёта. Финальная стоимость зависит от состояния квартиры и выбранных материалов — поэтому расчёт стоит воспринимать как ориентир для переговоров с подрядчиком, а не как договорную цену.",
  },
  {
    q: "Мне будут звонить?",
    a: "Только если вы сами отправите смету мастерам. Без вашего действия контакты никому не передаются.",
  },
  {
    q: "Можно скачать смету?",
    a: "Да, в PDF. Документ можно показать подрядчику или использовать для сравнения предложений.",
  },
];

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function HomeFaq() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight text-center mb-9">
          Частые вопросы
        </h2>

        <Accordion type="single" collapsible className="w-full">
          {FAQ.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold text-gray-900 hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-[15px] text-gray-600 leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
