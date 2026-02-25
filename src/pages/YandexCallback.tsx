import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

const YANDEX_AUTH_URL = "https://functions.poehali.dev/e79ea16f-9897-425c-8f3a-6944097e6748";

export default function YandexCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("Код авторизации не получен");
      return;
    }

    fetch(`${YANDEX_AUTH_URL}?action=callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        localStorage.setItem("avangard_user", JSON.stringify(data.user));
        localStorage.setItem("avangard_token", data.access_token);
        localStorage.setItem("yandex_auth_refresh_token", data.refresh_token);
        const redirectTo = searchParams.get("state")
          ? sessionStorage.getItem("yandex_auth_redirect") || "/"
          : "/";
        sessionStorage.removeItem("yandex_auth_redirect");
        navigate(redirectTo);
      })
      .catch(() => setError("Ошибка сети"));
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="/login" className="text-blue-600 underline">Вернуться к входу</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent mx-auto mb-4" />
        <p className="text-gray-600">Выполняется вход...</p>
      </div>
    </div>
  );
}