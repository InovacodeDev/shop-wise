import { createFileRoute } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import PremiumFeatureGuard from '@/components/subscription/PremiumFeatureGuard';
import { SideBarLayout } from '@/components/layout/sidebar-layout';
import type { FeatureCode, EducationalContent } from '@/types/api';
import { apiService } from '@/services/api';

export const Route = createFileRoute('/education/' as any)({
  component: EducationPage,
});

function EducationPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<EducationalContent[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiService.getEducationalContent();
        setItems(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const markRead = async (id: string) => {
    await apiService.markContentAsRead(id);
  };

  const bookmark = async (id: string) => {
    await apiService.bookmarkContent(id);
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-4">Education</h1>
        <PremiumFeatureGuard feature={'education' as FeatureCode}>
          <div className="p-0">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-3">
                {items.map((c) => (
                  <div key={c._id} className="rounded border p-3">
                    <div className="font-medium">{c.title}</div>
                    <div className="text-sm text-muted-foreground">{c.content}</div>
                    <div className="flex gap-2 mt-2">
                      <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm" onClick={() => markRead(c._id)}>Marcar como lido</button>
                      <button className="px-3 py-1 rounded bg-amber-600 text-white text-sm" onClick={() => bookmark(c._id)}>Favoritar</button>
                    </div>
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


