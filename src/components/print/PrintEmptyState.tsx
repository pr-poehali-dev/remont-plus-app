interface PrintEmptyStateProps {
  backHref: string;
  accentClass?: string;
  calculatorName?: string;
}

export default function PrintEmptyState({
  backHref,
  accentClass = "text-teal-600",
  calculatorName = "калькулятор",
}: PrintEmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen text-gray-400 p-6">
      <p className="text-center">
        Данные не переданы. Вернитесь в{" "}
        <a href={backHref} className={`${accentClass} underline`}>
          {calculatorName}
        </a>
        .
      </p>
    </div>
  );
}
