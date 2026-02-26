import type { FrameHouseConfig } from "./FrameHouseTypes";
import FrameHouseFormStructure from "./FrameHouseFormStructure";
import FrameHouseFormInterior from "./FrameHouseFormInterior";
import FrameHouseFormExtras from "./FrameHouseFormExtras";

interface Props {
  config: FrameHouseConfig;
  onChange: (patch: Partial<FrameHouseConfig>) => void;
}

export default function FrameHouseConfigForm({ config, onChange }: Props) {
  return (
    <div className="space-y-1">
      <FrameHouseFormStructure config={config} onChange={onChange} />
      <FrameHouseFormInterior config={config} onChange={onChange} />
      <FrameHouseFormExtras config={config} onChange={onChange} />
    </div>
  );
}
