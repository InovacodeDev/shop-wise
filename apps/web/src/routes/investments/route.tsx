import { createFileRoute } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import PremiumFeatureGuard from '@/components/subscription/PremiumFeatureGuard';
import { SideBarLayout } from '@/components/layout/sidebar-layout';
import type { FeatureCode, Investment, InvestmentSummary } from '@/types/api';
import { apiService } from '@/services/api';

export const Route = createFileRoute('/investments/' as any)({
  component: InvestmentsPage,
});

function InvestmentsPage() {
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [summary, setSummary] = useState<InvestmentSummary | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [inv, sum] = await Promise.all([
          apiService.getInvestments(),
          apiService.getInvestmentSummary(),
        ]);
        setInvestments(inv);
        setSummary(sum);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SideBarLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-4">Investments</h1>
        <PremiumFeatureGuard feature={'investments' as FeatureCode}>
          <div className="p-0">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div>
                {summary && (
                  <div className="mb-4 text-sm text-muted-foreground">
                    Total Value: ${summary.currentValue.toFixed(2)} — Profitability: {summary.totalProfitabilityPercent.toFixed(2)}%
                  </div>
                )}
                <div className="space-y-3">
                  {investments.map((inv) => (
                    <div key={inv._id} className="rounded border p-3">
                      <div className="font-medium">{inv.name}</div>
                      <div className="text-sm">Qty: {inv.quantity} • Avg: ${inv.averagePrice.toFixed(2)} • Current: ${Number(inv.currentPrice ?? 0).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PremiumFeatureGuard>
      </div>
    </SideBarLayout>
  );
}


