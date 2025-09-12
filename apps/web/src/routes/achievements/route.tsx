import { createFileRoute } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import PremiumFeatureGuard from '@/components/subscription/PremiumFeatureGuard';
import { SideBarLayout } from '@/components/layout/sidebar-layout';
import type { FeatureCode, Achievement } from '@/types/api';
import { apiService } from '@/services/api';

export const Route = createFileRoute('/achievements/' as any)({
  component: AchievementsPage,
});

function AchievementsPage() {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiService.getAchievements();
        setAchievements(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SideBarLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-4">Achievements</h1>
        <PremiumFeatureGuard feature={'gamification' as FeatureCode}>
          <div className="p-0">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {achievements.map((a) => (
                  <div key={a._id} className="rounded border p-3">
                    <div className="font-medium">{a.name}</div>
                    <div className="text-sm text-muted-foreground">{a.description}</div>
                    <div className="text-xs mt-2">Points: {a.points}</div>
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


