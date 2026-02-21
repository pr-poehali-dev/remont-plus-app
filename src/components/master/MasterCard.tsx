import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Master, GUARANTEE_LABELS, BUSINESS_LABELS } from "@/components/master/masterTypes";

export default function MasterCard({ master }: { master: Master }) {
  const [expanded, setExpanded] = useState(false);
  const initials = master.full_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{master.full_name}</span>
            {master.verified && (
              <Icon name="BadgeCheck" size={16} className="text-blue-500" />
            )}
            {master.business_status && (
              <Badge variant="secondary" className="text-xs">
                {BUSINESS_LABELS[master.business_status] || master.business_status}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
            {master.rating > 0 && (
              <span className="flex items-center gap-1">
                <Icon name="Star" size={14} className="text-yellow-400 fill-yellow-400" />
                {master.rating.toFixed(1)} ({master.reviews} отзывов)
              </span>
            )}
            {master.experience_years > 0 && (
              <span className="flex items-center gap-1">
                <Icon name="Briefcase" size={14} />
                {master.experience_years} лет
              </span>
            )}
            {master.location && (
              <span className="flex items-center gap-1">
                <Icon name="MapPin" size={14} />
                {master.location}
              </span>
            )}
          </div>
          {master.guarantee_period && master.guarantee_period !== "none" && (
            <div className="mt-2">
              <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                Гарантия: {GUARANTEE_LABELS[master.guarantee_period]}
              </Badge>
            </div>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {master.specializations.map((s) => (
              <Badge key={s} variant="outline" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
          {master.description && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{master.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 flex-wrap">
        {master.phone && (
          <a href={`tel:${master.phone}`}>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
              <Icon name="Phone" size={13} className="mr-1" /> Позвонить
            </Button>
          </a>
        )}
        {master.telegram && (
          <a href={`https://t.me/${master.telegram.replace("@", "")}`} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="text-xs">
              <Icon name="Send" size={13} className="mr-1" /> Telegram
            </Button>
          </a>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-auto text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
        >
          {expanded ? "Свернуть" : "Подробнее"}
          <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size={14} />
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Контакты</p>
            <div className="space-y-1 text-sm text-gray-600">
              {master.phone && (
                <a href={`tel:${master.phone}`} className="flex items-center gap-2 hover:text-orange-500">
                  <Icon name="Phone" size={14} /> {master.phone}
                </a>
              )}
              {master.email && (
                <a href={`mailto:${master.email}`} className="flex items-center gap-2 hover:text-orange-500">
                  <Icon name="Mail" size={14} /> {master.email}
                </a>
              )}
              {master.telegram && (
                <a href={`https://t.me/${master.telegram.replace("@", "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-orange-500">
                  <Icon name="Send" size={14} /> {master.telegram}
                </a>
              )}
              {master.whatsapp && (
                <a href={`https://wa.me/${master.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-orange-500">
                  <Icon name="MessageCircle" size={14} /> {master.whatsapp}
                </a>
              )}
              {master.instagram && (
                <a href={`https://instagram.com/${master.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-orange-500">
                  <Icon name="Instagram" size={14} /> {master.instagram}
                </a>
              )}
              {master.website && (
                <a href={master.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-orange-500">
                  <Icon name="Globe" size={14} /> {master.website}
                </a>
              )}
            </div>
          </div>
          {master.payment_methods && master.payment_methods.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Оплата</p>
              <div className="flex flex-wrap gap-1">
                {master.payment_methods.map((m) => (
                  <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                ))}
              </div>
            </div>
          )}
          {master.guarantee_description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Гарантия</p>
              <p className="text-sm text-gray-600">{master.guarantee_description}</p>
            </div>
          )}
          {master.certificates && master.certificates.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Сертификаты</p>
              <ul className="space-y-1">
                {master.certificates.map((c) => (
                  <li key={c} className="text-sm text-gray-600 flex items-center gap-1">
                    <Icon name="Award" size={14} className="text-orange-400" /> {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {master.portfolio_links && master.portfolio_links.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Портфолио</p>
              <ul className="space-y-1">
                {master.portfolio_links.map((link) => (
                  <li key={link}>
                    <a href={link} target="_blank" rel="noreferrer" className="text-sm text-orange-500 hover:underline flex items-center gap-1">
                      <Icon name="ExternalLink" size={13} /> {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
