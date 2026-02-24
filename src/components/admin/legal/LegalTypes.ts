export const CONTRACTS_URL = "https://functions.poehali.dev/0fa5f44f-a6a1-4e4d-ad3b-9596884f37ea";
export const HEADERS = { "Content-Type": "application/json", "X-Admin-Token": "admin2025" };

export interface Contract {
  id: number;
  title: string;
  contract_number: string;
  contract_type: string;
  counterparty_name: string;
  counterparty_inn: string;
  counterparty_type: string;
  status: string;
  subject: string;
  amount: number | null;
  currency: string;
  signed_at: string | null;
  valid_from: string | null;
  valid_until: string | null;
  auto_renewal: boolean;
  responsible_person: string;
  file_url: string;
  notes: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  days_left?: number;
}

export const CONTRACT_TYPES = [
  { value: "partner", label: "Партнёрский" },
  { value: "supplier", label: "Поставщик" },
  { value: "service", label: "Услуги" },
  { value: "rental", label: "Аренда" },
  { value: "employment", label: "Трудовой" },
  { value: "nda", label: "NDA / Конфиденциальность" },
  { value: "other", label: "Прочее" },
];

export const STATUSES = [
  { value: "draft", label: "Черновик", color: "bg-gray-100 text-gray-600" },
  { value: "review", label: "На согласовании", color: "bg-yellow-100 text-yellow-700" },
  { value: "active", label: "Действующий", color: "bg-green-100 text-green-700" },
  { value: "signed", label: "Подписан", color: "bg-blue-100 text-blue-700" },
  { value: "expired", label: "Истёк", color: "bg-red-100 text-red-600" },
  { value: "terminated", label: "Расторгнут", color: "bg-gray-100 text-gray-500" },
];

export const EMPTY: Omit<Contract, "id" | "created_at" | "updated_at"> = {
  title: "",
  contract_number: "",
  contract_type: "partner",
  counterparty_name: "",
  counterparty_inn: "",
  counterparty_type: "company",
  status: "draft",
  subject: "",
  amount: null,
  currency: "RUB",
  signed_at: null,
  valid_from: null,
  valid_until: null,
  auto_renewal: false,
  responsible_person: "",
  file_url: "",
  notes: "",
  tags: [],
};

export interface ContractTemplate {
  id: string;
  label: string;
  icon: string;
  description: string;
  defaults: Partial<Omit<Contract, "id" | "created_at" | "updated_at">>;
  tags: string;
}

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: "agent",
    label: "Агентский",
    icon: "Handshake",
    description: "Агент действует от имени принципала",
    tags: "агентский, партнёр",
    defaults: {
      contract_type: "partner",
      status: "draft",
      subject: "Агент обязуется за вознаграждение совершать по поручению Принципала юридические и иные действия от своего имени, но за счёт Принципала, либо от имени и за счёт Принципала. Агент действует в интересах Принципала в сфере привлечения клиентов и заключения договоров на выполнение ремонтных и отделочных работ.",
      notes: "Вознаграждение агента составляет ___ % от суммы каждой сделки, заключённой при его участии. Отчёт агента предоставляется ежемесячно не позднее 5-го числа следующего месяца. Принципал вправе проверять деятельность агента. Договор соответствует ст. 1005–1011 ГК РФ.",
      auto_renewal: true,
    },
  },
  {
    id: "supply",
    label: "Поставки",
    icon: "Truck",
    description: "Поставка товаров / материалов",
    tags: "поставка, материалы, поставщик",
    defaults: {
      contract_type: "supplier",
      status: "draft",
      subject: "Поставщик обязуется передавать в обусловленные сроки производимые или закупаемые им товары (строительные материалы, отделочные материалы) Покупателю, а Покупатель обязуется принимать эти товары и платить за них определённую денежную сумму. Номенклатура, количество и стоимость товаров определяются Спецификациями, являющимися неотъемлемой частью настоящего договора.",
      notes: "Качество товара должно соответствовать ГОСТ и техническим условиям. Срок поставки — в течение ___ рабочих дней с момента получения заявки. Оплата производится в течение ___ банковских дней после поставки. Ответственность за недостатки товара — ст. 518 ГК РФ. Договор соответствует ст. 506–524 ГК РФ.",
      auto_renewal: false,
    },
  },
  {
    id: "service",
    label: "Оказания услуг",
    icon: "Wrench",
    description: "Выполнение работ / ремонтные услуги",
    tags: "услуги, ремонт, подряд",
    defaults: {
      contract_type: "service",
      status: "draft",
      subject: "Исполнитель обязуется по заданию Заказчика оказать услуги по выполнению ремонтно-отделочных работ в соответствии с техническим заданием (Приложение №1), а Заказчик обязуется оплатить эти услуги. Объём, сроки и стоимость работ определяются Сметой, являющейся неотъемлемой частью настоящего договора.",
      notes: "Исполнитель гарантирует качество работ в течение 12 месяцев с момента подписания акта приёмки. Заказчик вправе осуществлять контроль за ходом работ. Оплата производится: аванс ___ %, остаток — после подписания акта выполненных работ. Договор соответствует ст. 779–783 и гл. 37 ГК РФ.",
      auto_renewal: false,
    },
  },
  {
    id: "nda",
    label: "Конфиденциальность (NDA)",
    icon: "ShieldCheck",
    description: "Защита коммерческой тайны",
    tags: "NDA, конфиденциальность, тайна",
    defaults: {
      contract_type: "nda",
      status: "draft",
      subject: "Стороны обязуются сохранять в тайне и не разглашать третьим лицам конфиденциальную информацию, ставшую им известной в ходе сотрудничества. К конфиденциальной относится информация о ценах, клиентской базе, технологиях, бизнес-процессах и финансовых показателях Сторон.",
      notes: "Обязательства по неразглашению действуют в течение 3 лет после окончания срока договора. За разглашение конфиденциальной информации предусмотрена неустойка в размере ___ руб. Договор соответствует ФЗ №98-ФЗ «О коммерческой тайне» и ст. 857 ГК РФ.",
      auto_renewal: false,
    },
  },
  {
    id: "rental",
    label: "Аренда помещения",
    icon: "Building2",
    description: "Аренда офиса / склада / площадки",
    tags: "аренда, помещение, офис",
    defaults: {
      contract_type: "rental",
      status: "draft",
      subject: "Арендодатель передаёт, а Арендатор принимает во временное пользование нежилое помещение площадью ___ кв.м, расположенное по адресу: ___. Помещение используется для ___. Передача осуществляется по акту приёма-передачи.",
      notes: "Арендная плата составляет ___ руб./мес., НДС не облагается. Оплата — не позднее ___ числа каждого месяца. Арендатор несёт ответственность за сохранность имущества. Расходы на коммунальные услуги — ___. Договор соответствует ст. 606–625 ГК РФ.",
      auto_renewal: true,
    },
  },
];

export function statusBadge(status: string) {
  const s = STATUSES.find(x => x.value === status);
  return s ? s : { label: status, color: "bg-gray-100 text-gray-500" };
}

export function typelabel(type: string) {
  return CONTRACT_TYPES.find(x => x.value === type)?.label ?? type;
}

export function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ru-RU");
}

export function formatAmount(amount: number | null, currency: string) {
  if (amount === null) return "—";
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: currency || "RUB", maximumFractionDigits: 0 }).format(amount);
}