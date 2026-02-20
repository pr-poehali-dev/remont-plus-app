import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie_accepted");
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_accepted", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-gray-600 flex-1">
          Мы используем файлы cookie для корректной работы сервиса. Продолжая использование сайта, вы соглашаетесь
          с{" "}
          <Link to="/privacy" className="text-orange-500 hover:underline">
            Политикой конфиденциальности
          </Link>{" "}
          и обработкой персональных данных в соответствии с ФЗ-152.
        </p>
        <Button
          onClick={accept}
          className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
          size="sm"
        >
          Принять
        </Button>
      </div>
    </div>
  );
}
