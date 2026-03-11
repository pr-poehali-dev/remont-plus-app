import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { fmt, calcWorkTotal, calcMaterialsTotal, calcInteriorTotal } from "@/types/readyProjects";
import { WorkTab, MaterialsTab, InteriorTab, OverviewTab } from "@/components/ready-projects/ProjectTabs";
import type { Project } from "@/types/readyProjects";

type Tab = "overview" | "work" | "materials" | "interior";

export function ProjectCard({ project }: { project: Project }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [open, setOpen] = useState(false);

  const workTotal = calcWorkTotal(project);
  const matTotal = calcMaterialsTotal(project);
  const intTotal = calcInteriorTotal(project);
  const grand = workTotal + matTotal + intTotal;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Обзор", icon: "LayoutDashboard" },
    { id: "work", label: "Смета работ", icon: "Hammer" },
    { id: "materials", label: "Материалы", icon: "Package" },
    { id: "interior", label: "Мебель", icon: "Sofa" },
  ];

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-72 overflow-hidden">
        <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <div
          className={`absolute top-4 left-4 bg-gradient-to-r ${project.accentFrom} ${project.accentTo} text-white text-sm font-black px-4 py-1.5 rounded-full shadow-lg`}
        >
          {project.area} м²
        </div>
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
          {project.style}
        </div>
        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-white/70 text-xs font-medium mb-1">{project.subtitle}</p>
          <h3 className="text-white text-2xl font-black leading-tight">{project.title}</h3>
          <p className="text-white/60 text-sm mt-1 flex items-center gap-1.5">
            <Icon name="DoorOpen" size={12} />
            {project.rooms}
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.map((t) => (
            <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{t}</span>
          ))}
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-5">{project.description}</p>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Работы", value: workTotal, icon: "Hammer" },
            { label: "Материалы", value: matTotal, icon: "Package" },
            { label: "Мебель", value: intTotal, icon: "Sofa" },
          ].map((cell) => (
            <div key={cell.label} className="bg-gray-50 rounded-2xl p-3 text-center">
              <Icon name={cell.icon as never} size={14} className="text-gray-300 mx-auto mb-1" />
              <div className="text-xs text-gray-400 mb-1">{cell.label}</div>
              <div className="font-bold text-gray-900 text-xs leading-tight tabular-nums">{fmt(cell.value)}</div>
            </div>
          ))}
        </div>

        <div
          className={`bg-gradient-to-r ${project.accentFrom} ${project.accentTo} rounded-2xl p-4 flex items-center justify-between mb-5 shadow-sm`}
        >
          <div>
            <div className="text-white/70 text-xs mb-0.5">Полный бюджет</div>
            <div className="text-white/90 text-xs">работы + материалы + мебель</div>
          </div>
          <div className="text-white text-xl font-black tabular-nums">{fmt(grand)}</div>
        </div>

        <Button
          variant={open ? "default" : "outline"}
          className={`w-full rounded-xl ${open ? "bg-gray-900 text-white hover:bg-gray-800" : ""}`}
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <><Icon name="ChevronUp" size={16} className="mr-2" />Свернуть</>
          ) : (
            <><Icon name="FileText" size={16} className="mr-2" />Открыть полную смету</>
          )}
        </Button>

        {open && (
          <div className="mt-6">
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 flex-1 text-xs py-2.5 px-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    tab === t.id
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon name={t.icon as never} size={13} />
                  {t.label}
                </button>
              ))}
            </div>
            {tab === "overview" && <OverviewTab project={project} />}
            {tab === "work" && <WorkTab sections={project.workSections} />}
            {tab === "materials" && <MaterialsTab materials={project.materials} />}
            {tab === "interior" && <InteriorTab elements={project.interiorElements} />}
          </div>
        )}
      </div>
    </div>
  );
}
