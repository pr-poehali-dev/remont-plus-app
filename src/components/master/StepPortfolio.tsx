import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { MasterProfile } from "./types";

interface Props {
  profile: MasterProfile;
  update: (field: keyof MasterProfile, value: unknown) => void;
}

export default function StepPortfolio({ profile, update }: Props) {
  const [newCertificate, setNewCertificate] = useState("");
  const [newLink, setNewLink] = useState("");

  return (
    <div className="space-y-5">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Icon name="Award" size={22} className="text-orange-500" /> Портфолио и сертификаты
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Сертификаты и курсы</label>
        <div className="space-y-2">
          {profile.certificates.map((cert, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <Icon name="FileText" size={16} className="text-orange-500" />
              <span className="text-sm flex-1">{cert}</span>
              <button
                onClick={() => update("certificates", profile.certificates.filter((_, j) => j !== i))}
                className="text-gray-400 hover:text-red-500"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newCertificate}
              onChange={(e) => setNewCertificate(e.target.value)}
              placeholder="Название сертификата или курса"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newCertificate.trim()) {
                  update("certificates", [...profile.certificates, newCertificate.trim()]);
                  setNewCertificate("");
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!newCertificate.trim()}
              onClick={() => {
                if (newCertificate.trim()) {
                  update("certificates", [...profile.certificates, newCertificate.trim()]);
                  setNewCertificate("");
                }
              }}
            >
              <Icon name="Plus" size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ссылки на примеры работ</label>
        <div className="space-y-2">
          {profile.portfolio_links.map((link, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <Icon name="Link" size={16} className="text-blue-500" />
              <a href={link} target="_blank" rel="noreferrer" className="text-sm text-blue-600 flex-1 truncate hover:underline">{link}</a>
              <button
                onClick={() => update("portfolio_links", profile.portfolio_links.filter((_, j) => j !== i))}
                className="text-gray-400 hover:text-red-500"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder="https://..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && newLink.trim()) {
                  update("portfolio_links", [...profile.portfolio_links, newLink.trim()]);
                  setNewLink("");
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!newLink.trim()}
              onClick={() => {
                if (newLink.trim()) {
                  update("portfolio_links", [...profile.portfolio_links, newLink.trim()]);
                  setNewLink("");
                }
              }}
            >
              <Icon name="Plus" size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
        <p className="text-sm text-orange-700">
          <Icon name="Info" size={14} className="inline mr-1" />
          Фото выполненных работ можно будет загрузить позже в личном кабинете
        </p>
      </div>
    </div>
  );
}
