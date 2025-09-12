import { createFileRoute } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import PremiumFeatureGuard from '@/components/subscription/PremiumFeatureGuard';
import { SideBarLayout } from '@/components/layout/sidebar-layout';
import type { FeatureCode, Budget, BudgetProgress } from '@/types/api';
import { apiService } from '@/services/api';

export const Route = createFileRoute('/budgets/' as any)({
  component: BudgetsPage,
});

function BudgetsPage() {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [progress, setProgress] = useState<BudgetProgress[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [b, p] = await Promise.all([
          apiService.getBudgets(),
          apiService.getBudgetProgress(),
        ]);
        setBudgets(b);
        setProgress(p);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SideBarLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-4">Budgets</h1>
        <PremiumFeatureGuard feature={'advanced_finances' as FeatureCode}>
          <div className="p-0">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-3">
                {budgets.map((b) => {
                  const pr = progress.find((x) => x.budgetId === b._id);
                  return (
                    <div key={b._id} className="rounded border p-3">
                      <div className="font-medium">{b.name}</div>
                      <div className="text-sm">Limit: ${b.limit.toFixed(2)} • Period: {b.period}</div>
                      {pr && (
                        <div className="text-sm text-muted-foreground">Used: ${pr.spent.toFixed(2)} ({pr.percentageUsed.toFixed(1)}%)</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </PremiumFeatureGuard>
      </div>
    </SideBarLayout>
  );
}


