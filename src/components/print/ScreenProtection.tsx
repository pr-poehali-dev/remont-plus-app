import { type ReactNode } from "react";

interface ScreenProtectionProps {
  children: ReactNode;
  active?: boolean;
}

export default function ScreenProtection({ children }: ScreenProtectionProps) {
  return <>{children}</>;
}
