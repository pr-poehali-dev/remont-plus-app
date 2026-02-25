import type { BathHouseConfig } from "./BathHouseTypes";
import BathHouseFormStructure from "./BathHouseFormStructure";
import BathHouseFormInterior from "./BathHouseFormInterior";
import BathHouseFormExtras from "./BathHouseFormExtras";

interface Props {
  config: BathHouseConfig;
  onChange: (patch: Partial<BathHouseConfig>) => void;
}

export default function BathHouseConfigForm({ config, onChange }: Props) {
  return (
    <div className="space-y-1">
      <BathHouseFormStructure config={config} onChange={onChange} />
      <BathHouseFormInterior config={config} onChange={onChange} />
      <BathHouseFormExtras config={config} onChange={onChange} />
    </div>
  );
}
