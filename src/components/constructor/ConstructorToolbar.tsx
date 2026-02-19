import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tool } from './types';
import { roomPresets } from './roomPresets';

interface ToolbarProps {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  showGrid: boolean;
  showDimensions: boolean;
  snapToGrid: boolean;
  zoom: number;
  onToggleGrid: () => void;
  onToggleDimensions: () => void;
  onToggleSnap: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onAddPreset: (presetId: string) => void;
  onExportPDF: () => void;
}

interface ToolButtonProps {
  icon: string;
  fallback?: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  shortcut?: string;
}

function ToolButton({ icon, fallback, label, active, disabled, onClick, shortcut }: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          className={`
            relative flex items-center justify-center w-9 h-9 rounded-md
            transition-colors duration-100
            ${active
              ? 'bg-[#00d4ff]/20 text-[#00d4ff]'
              : 'text-gray-400 hover:bg-[#3a3a5c] hover:text-gray-200'
            }
            ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <Icon name={icon} fallback={fallback} size={18} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="bg-[#1e1e2e] border-[#3a3a5c] text-gray-300 text-xs"
      >
        <p>{label}{shortcut ? ` (${shortcut})` : ''}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function Separator() {
  return <div className="w-px h-6 bg-[#3a3a5c] mx-1" />;
}

export default function ConstructorToolbar({
  tool,
  onToolChange,
  showGrid,
  showDimensions,
  snapToGrid: snapOn,
  zoom,
  onToggleGrid,
  onToggleDimensions,
  onToggleSnap,
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onAddPreset,
  onExportPDF,
}: ToolbarProps) {
  const [presetsOpen, setPresetsOpen] = useState(false);

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-[#252536] border-b border-[#3a3a5c] select-none">
      {/* Drawing tools */}
      <ToolButton
        icon="MousePointer"
        label="\u0412\u044B\u0431\u043E\u0440"
        active={tool === 'select'}
        onClick={() => onToolChange('select')}
        shortcut="V"
      />
      <ToolButton
        icon="PenTool"
        label="\u0421\u0442\u0435\u043D\u0430"
        active={tool === 'wall'}
        onClick={() => onToolChange('wall')}
        shortcut="W"
      />
      <ToolButton
        icon="DoorOpen"
        fallback="Square"
        label="\u0414\u0432\u0435\u0440\u044C"
        active={tool === 'door'}
        onClick={() => onToolChange('door')}
        shortcut="D"
      />
      <ToolButton
        icon="AppWindow"
        fallback="Columns"
        label="\u041E\u043A\u043D\u043E"
        active={tool === 'window'}
        onClick={() => onToolChange('window')}
        shortcut="N"
      />

      {/* Room presets */}
      <DropdownMenu open={presetsOpen} onOpenChange={setPresetsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                className={`
                  flex items-center justify-center w-9 h-9 rounded-md
                  transition-colors duration-100 text-gray-400
                  hover:bg-[#3a3a5c] hover:text-gray-200 cursor-pointer
                `}
              >
                <Icon name="LayoutGrid" size={18} />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            className="bg-[#1e1e2e] border-[#3a3a5c] text-gray-300 text-xs"
          >
            <p>\u0428\u0430\u0431\u043B\u043E\u043D\u044B \u043A\u043E\u043C\u043D\u0430\u0442</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          className="bg-[#252536] border-[#3a3a5c] min-w-[200px]"
          align="start"
        >
          {roomPresets.map((preset) => (
            <DropdownMenuItem
              key={preset.id}
              onClick={() => {
                onAddPreset(preset.id);
                setPresetsOpen(false);
              }}
              className="text-gray-300 hover:bg-[#3a3a5c] hover:text-white focus:bg-[#3a3a5c] focus:text-white cursor-pointer"
            >
              <Icon name={preset.icon} fallback="Square" size={16} className="mr-2 text-[#00d4ff]" />
              <span className="flex-1">{preset.name}</span>
              <span className="text-[10px] text-gray-500 font-mono ml-2">{preset.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolButton
        icon="Ruler"
        label="\u0418\u0437\u043C\u0435\u0440\u0438\u0442\u044C"
        active={tool === 'measure'}
        onClick={() => onToolChange('measure')}
        shortcut="M"
      />
      <ToolButton
        icon="Eraser"
        label="\u041B\u0430\u0441\u0442\u0438\u043A"
        active={tool === 'eraser'}
        onClick={() => onToolChange('eraser')}
        shortcut="E"
      />

      <Separator />

      {/* Undo / Redo */}
      <ToolButton
        icon="Undo2"
        label="\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C"
        onClick={onUndo}
        disabled={!canUndo}
        shortcut="Ctrl+Z"
      />
      <ToolButton
        icon="Redo2"
        label="\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C"
        onClick={onRedo}
        disabled={!canRedo}
        shortcut="Ctrl+Shift+Z"
      />

      <Separator />

      {/* View toggles */}
      <ToolButton
        icon="Grid3x3"
        label="\u0421\u0435\u0442\u043A\u0430"
        active={showGrid}
        onClick={onToggleGrid}
        shortcut="G"
      />
      <ToolButton
        icon="Ruler"
        fallback="Ruler"
        label="\u0420\u0430\u0437\u043C\u0435\u0440\u044B"
        active={showDimensions}
        onClick={onToggleDimensions}
      />
      <ToolButton
        icon="Target"
        fallback="Target"
        label="\u041F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u043A \u0441\u0435\u0442\u043A\u0435"
        active={snapOn}
        onClick={onToggleSnap}
        shortcut="S"
      />

      <Separator />

      {/* Zoom */}
      <ToolButton
        icon="ZoomOut"
        label="\u0423\u043C\u0435\u043D\u044C\u0448\u0438\u0442\u044C"
        onClick={onZoomOut}
      />
      <div className="flex items-center justify-center min-w-[52px] text-[11px] font-mono text-gray-400 select-none">
        {Math.round(zoom * 1000)}%
      </div>
      <ToolButton
        icon="ZoomIn"
        label="\u0423\u0432\u0435\u043B\u0438\u0447\u0438\u0442\u044C"
        onClick={onZoomIn}
      />
      <ToolButton
        icon="Maximize2"
        label="\u0412\u043F\u0438\u0441\u0430\u0442\u044C \u0432 \u044D\u043A\u0440\u0430\u043D"
        onClick={onFitView}
      />

      <Separator />

      {/* Export */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExportPDF}
            className="h-9 px-3 text-gray-400 hover:bg-[#3a3a5c] hover:text-gray-200"
          >
            <Icon name="FileDown" size={16} className="mr-1.5" />
            <span className="text-xs">PDF</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-[#1e1e2e] border-[#3a3a5c] text-gray-300 text-xs"
        >
          <p>\u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u0432 PDF</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
