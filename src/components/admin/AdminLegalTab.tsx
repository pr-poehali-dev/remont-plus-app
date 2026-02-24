import { useState, useEffect } from "react";
import { CONTRACTS_URL, HEADERS, EMPTY } from "./legal/LegalTypes";
import type { Contract } from "./legal/LegalTypes";
import LegalContractList from "./legal/LegalContractList";
import LegalContractDetail from "./legal/LegalContractDetail";
import LegalContractForm from "./legal/LegalContractForm";
import LegalReminders from "./legal/LegalReminders";

export type { Contract };

const REMINDERS_URL = "https://functions.poehali.dev/64c25e95-c949-4599-9348-5d05b5c394b0";

export default function AdminLegalTab() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [stats, setStats] = useState<Record<string, number>>({});

  const [expiring, setExpiring] = useState<Contract[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [form, setForm] = useState<Omit<Contract, "id" | "created_at" | "updated_at">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [tagsInput, setTagsInput] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailContract, setDetailContract] = useState<Contract | null>(null);

  useEffect(() => { load(); loadReminders(); }, [filterStatus, filterType]);

  async function loadReminders() {
    setRemindersLoading(true);
    const res = await fetch(`${REMINDERS_URL}?days=30`, { headers: HEADERS });
    const data = await res.json();
    setExpiring(data.contracts || []);
    setRemindersLoading(false);
  }

  async function sendReminderEmail() {
    setEmailSending(true);
    await fetch(REMINDERS_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ send_email: true }),
    });
    setEmailSending(false);
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
  }

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (filterType) params.set("contract_type", filterType);
    if (search.trim()) params.set("search", search.trim());
    const res = await fetch(`${CONTRACTS_URL}?${params}`, { headers: HEADERS });
    const data = await res.json();
    setContracts(data.contracts || []);
    setStats(data.stats || {});
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setTagsInput("");
    setDialogOpen(true);
  }

  function openEdit(c: Contract) {
    setEditing(c);
    setForm({
      title: c.title, contract_number: c.contract_number, contract_type: c.contract_type,
      counterparty_name: c.counterparty_name, counterparty_inn: c.counterparty_inn,
      counterparty_type: c.counterparty_type, status: c.status, subject: c.subject,
      amount: c.amount, currency: c.currency || "RUB",
      signed_at: c.signed_at ? c.signed_at.split("T")[0] : null,
      valid_from: c.valid_from ? c.valid_from.split("T")[0] : null,
      valid_until: c.valid_until ? c.valid_until.split("T")[0] : null,
      auto_renewal: c.auto_renewal, responsible_person: c.responsible_person,
      file_url: c.file_url, notes: c.notes, tags: c.tags || [],
    });
    setTagsInput((c.tags || []).join(", "));
    setDialogOpen(true);
  }

  function openDetail(c: Contract) {
    setDetailContract(c);
    setDetailOpen(true);
  }

  async function save() {
    setSaving(true);
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    const payload = { ...form, tags };
    if (editing) {
      await fetch(`${CONTRACTS_URL}?id=${editing.id}`, { method: "PUT", headers: HEADERS, body: JSON.stringify(payload) });
    } else {
      await fetch(CONTRACTS_URL, { method: "POST", headers: HEADERS, body: JSON.stringify(payload) });
    }
    setSaving(false);
    setDialogOpen(false);
    load();
  }

  async function remove(id: number) {
    if (!confirm("Удалить договор?")) return;
    await fetch(`${CONTRACTS_URL}?id=${id}`, { method: "DELETE", headers: HEADERS });
    load();
  }

  return (
    <div className="space-y-6">
      <LegalReminders
        contracts={expiring}
        loading={remindersLoading}
        emailSending={emailSending}
        emailSent={emailSent}
        onSendEmail={sendReminderEmail}
        onOpenDetail={openDetail}
      />
      <LegalContractList
        contracts={contracts}
        loading={loading}
        search={search}
        filterStatus={filterStatus}
        filterType={filterType}
        stats={stats}
        onSearchChange={setSearch}
        onFilterStatusChange={setFilterStatus}
        onFilterTypeChange={setFilterType}
        onReload={load}
        onOpenCreate={openCreate}
        onOpenDetail={openDetail}
        onOpenEdit={openEdit}
        onRemove={remove}
      />
      <LegalContractDetail
        open={detailOpen}
        contract={detailContract}
        onClose={() => setDetailOpen(false)}
        onEdit={openEdit}
      />
      <LegalContractForm
        open={dialogOpen}
        editing={editing}
        form={form}
        tagsInput={tagsInput}
        saving={saving}
        onClose={() => setDialogOpen(false)}
        onSave={save}
        onFormChange={setForm}
        onTagsChange={setTagsInput}
      />
    </div>
  );
}