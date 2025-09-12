import { createFileRoute } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import PremiumFeatureGuard from '@/components/subscription/PremiumFeatureGuard';
import { SideBarLayout } from '@/components/layout/sidebar-layout';
import type { FeatureCode, CreditCard } from '@/types/api';
import { apiService } from '@/services/api';

export const Route = createFileRoute('/credit-cards/' as any)({
  component: CreditCardsPage,
});

function CreditCardsPage() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<CreditCard[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const c = await apiService.getCreditCards();
        setCards(c);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SideBarLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-4">Credit Cards</h1>
        <PremiumFeatureGuard feature={'advanced_finances' as FeatureCode}>
          <div className="p-0">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-3">
                {cards.map((c) => (
                  <div key={c._id} className="rounded border p-3">
                    <div className="font-medium">{c.name} •••• {c.lastFourDigits}</div>
                    <div className="text-sm">Limit: ${c.creditLimit.toFixed(2)} • Balance: ${c.currentBalance.toFixed(2)} • Available: ${c.availableLimit.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PremiumFeatureGuard>
      </div>
    </SideBarLayout>
  );
}

