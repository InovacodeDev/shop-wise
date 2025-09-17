import { useAuth } from "@/hooks/use-auth";
import { useI18n } from '@/hooks/useI18n';
import { useEffect, useMemo, useState, type FC } from "react";

// Minimal, type-safe HistoryTab stub to keep project compiling during migration.
type UIItem = { id: string; name?: string; quantity: number; price: number };
type UIPurchase = { id: string; storeName?: string; date: Date; totalAmount?: number; items: UIItem[] };

export const HistoryTab: FC = () => {
  const { t } = useI18n();
  const { profile } = useAuth();
  const [purchases, setPurchases] = useState<UIPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!profile?.familyId) {
        if (mounted) setLoading(false);
        return;
      }
      // Keep empty for now; full implementation will be restored incrementally.
      if (mounted) setPurchases([]);
      if (mounted) setLoading(false);
    }
    void load();
    return () => { mounted = false; };
  }, [profile]);

  const total = useMemo(() => purchases.reduce((s, p) => s + (p.totalAmount ?? p.items.reduce((si, it) => si + (it.price || 0), 0)), 0), [purchases]);

  return (
    <div>
      <h3>{t('purchaseHistory')}</h3>
      <div>{loading ? t('loading') : `${purchases.length} purchases`}</div>
      <div>{`Total: ${total}`}</div>
    </div>
  );
};
