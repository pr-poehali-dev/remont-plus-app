import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CookieBanner from "./CookieBanner";
import ChatWidget from "./ChatWidget";
import InstallPWABanner from "./pwa/InstallPWABanner";
import LeadCapturePopup from "./LeadCapturePopup";
import FloatingContacts from "./FloatingContacts";

const HIDDEN_PATH_PREFIXES = [
  "/estimate/print",
  "/docs/print",
  "/bathroom/print",
  "/ceilings/print",
  "/flooring/print",
  "/electrics/print",
  "/windows/print",
  "/newbuild/print",
  "/turnkey/print",
  "/bathhouse/print",
  "/framehouse/print",
];

const ADMIN_PATH_PREFIXES = ["/admin", "/dashboard", "/account", "/profile"];

export default function PopupOrchestrator() {
  const { pathname } = useLocation();
  const [showCookie, setShowCookie] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const [showPWA, setShowPWA] = useState(false);

  const isPrint = HIDDEN_PATH_PREFIXES.some((p) => pathname.startsWith(p));
  const isAdmin = ADMIN_PATH_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isPrint) return;

    const cookieAccepted = localStorage.getItem("cookie_accepted");
    if (!cookieAccepted) {
      const t = setTimeout(() => setShowCookie(true), 1500);
      return () => clearTimeout(t);
    }

    if (isAdmin) return;

    const leadShown = sessionStorage.getItem("lead_popup_shown");
    if (!leadShown) {
      const t = setTimeout(() => setShowLead(true), 25000);
      return () => clearTimeout(t);
    }
  }, [isPrint, isAdmin, pathname]);

  useEffect(() => {
    if (isPrint || isAdmin) return;
    if (showCookie || showLead) return;

    const pwaDismissed = localStorage.getItem("pwa_install_dismissed");
    if (!pwaDismissed) {
      const t = setTimeout(() => setShowPWA(true), 45000);
      return () => clearTimeout(t);
    }
  }, [showCookie, showLead, isPrint, isAdmin]);

  if (isPrint) return null;

  return (
    <>
      {showCookie && <CookieBanner />}
      {!showCookie && showLead && <LeadCapturePopup />}
      {!showCookie && !showLead && showPWA && <InstallPWABanner />}
      {!isAdmin && <FloatingContacts />}
      {!isAdmin && <ChatWidget />}
    </>
  );
}
