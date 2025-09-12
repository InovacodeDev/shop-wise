import { createFileRoute } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import PremiumFeatureGuard from '@/components/subscription/PremiumFeatureGuard';
import { SideBarLayout } from '@/components/layout/sidebar-layout';
import type { FeatureCode, BalanceProjection } from '@/types/api';
import { apiService } from '@/services/api';

export const Route = createFileRoute('/projections/' as any)({
  component: ProjectionsPage,
});

function ProjectionsPage() {
  const [loading, setLoading] = useState(true);
  const [projection, setProjection] = useState<BalanceProjection | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiService.getBalanceProjection('3months');
        setProjection(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SideBarLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-4">Balance Projections</h1>
        <PremiumFeatureGuard feature={'advanced_reports' as FeatureCode}>
          <div className="p-0">
            {loading ? (
              <div>Loading...</div>
            ) : projection ? (
              <div className="space-y-2">
                {projection.projections.map((p, idx) => (
                  <div key={idx} className="flex justify-between rounded border p-2 text-sm">
                    <span>{new Date(p.date).toLocaleDateString()}</span>
                    <span>${p.balance.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div>No data</div>
            )}
          </div>
        </PremiumFeatureGuard>
      </div>
    </SideBarLayout>
  );
}


