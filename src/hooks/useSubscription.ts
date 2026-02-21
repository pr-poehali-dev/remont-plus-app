import { useState, useEffect } from "react";

const SUBS_URL = "https://functions.poehali.dev/52ea78ee-5f41-4904-b547-d60063d9da0a";

export interface Subscription {
  id: number;
  plan_code: string;
  plan_name: string;
  segment: string;
  price: number;
  is_monthly: boolean;
  status: string;
  projects_used: number;
  visualizations_used: number;
  revisions_used: number;
  max_projects: number;
  max_visualizations: number;
  max_revisions: number;
  projects_left: number;
  visualizations_left: number;
  revisions_left: number;
  is_unlimited: boolean;
  has_materials: boolean;
  has_manager: boolean;
  activated_at: string;
  expires_at: string | null;
}

export function useSubscription(userId: number | null) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${SUBS_URL}?user_id=${userId}`);
      const data = await res.json();
      setSubscription(data.subscription || null);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  return { subscription, loading, reload: load };
}
