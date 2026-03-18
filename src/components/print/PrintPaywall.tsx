interface Props {
  children: React.ReactNode;
  docTitle?: string;
  totalSum?: number;
}

export default function PrintPaywall({ children }: Props) {
  return <>{children}</>;
}
