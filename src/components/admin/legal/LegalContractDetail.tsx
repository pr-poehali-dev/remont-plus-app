import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { statusBadge, typelabel, formatDate, formatAmount } from "./LegalTypes";
import type { Contract } from "./LegalTypes";
import { exportContractPDF, exportContractWord } from "./legalExport";

interface Props {
  open: boolean;
  contract: Contract | null;
  onClose: () => void;
  onEdit: (c: Contract) => void;
}

export default function LegalContractDetail({ open, contract, onClose, onEdit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="FileText" size={18} className="text-indigo-600" />
            {contract?.title}
          </DialogTitle>
        </DialogHeader>
        {contract && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(contract.status).color}`}>
                {statusBadge(contract.status).label}
              </span>
              {contract.contract_number && (
                <span className="text-gray-500">№{contract.contract_number}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Контрагент</p>
                <p className="font-medium">{contract.counterparty_name}</p>
                {contract.counterparty_inn && <p className="text-xs text-gray-400">ИНН: {contract.counterparty_inn}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Тип договора</p>
                <p className="font-medium">{typelabel(contract.contract_type)}</p>
              </div>
              {contract.amount !== null && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Сумма</p>
                  <p className="font-bold text-indigo-700">{formatAmount(contract.amount, contract.currency)}</p>
                </div>
              )}
              {contract.responsible_person && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Ответственный</p>
                  <p className="font-medium">{contract.responsible_person}</p>
                </div>
              )}
            </div>
            {contract.subject && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Предмет договора</p>
                <p className="text-gray-700">{contract.subject}</p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Подписан", val: formatDate(contract.signed_at) },
                { label: "Начало", val: formatDate(contract.valid_from) },
                { label: "Окончание", val: formatDate(contract.valid_until) },
              ].map(d => (
                <div key={d.label} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-400">{d.label}</p>
                  <p className="text-sm font-medium">{d.val}</p>
                </div>
              ))}
            </div>
            {contract.auto_renewal && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2 text-xs">
                <Icon name="RefreshCw" size={13} />
                Автопролонгация включена
              </div>
            )}
            {contract.notes && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Примечания</p>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-2">{contract.notes}</p>
              </div>
            )}
            {contract.file_url && (
              <a href={contract.file_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 hover:underline text-sm">
                <Icon name="Paperclip" size={14} />
                Открыть файл договора
              </a>
            )}
            {(contract.tags || []).length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {(contract.tags || []).map(t => (
                  <span key={t} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full">{t}</span>
                ))}
              </div>
            )}
            <div className="border-t pt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <Icon name="Download" size={11} />
                Экспорт
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => exportContractPDF(contract)}
                >
                  <Icon name="FileText" size={14} className="mr-1.5" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => exportContractWord(contract)}
                >
                  <Icon name="FileType" size={14} className="mr-1.5" />
                  Word (.rtf)
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => { onClose(); onEdit(contract); }}>
                <Icon name="Pencil" size={14} className="mr-1.5" />
                Редактировать
              </Button>
              <Button variant="outline" onClick={onClose}>Закрыть</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}