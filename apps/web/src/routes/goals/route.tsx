import { createFileRoute } from '@tanstack/react-router';
import React, { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';

export const Route = createFileRoute('/goals/' as any)({
  component: GoalsPage,
});

function GoalsPage() {
  const router = useRouter();

  useEffect(() => {
    // Goals were merged into the main Insights dashboard. Redirect to /home which now
    // shows both Insights and Goals summary data.
    router.navigate({ to: '/home' });
  }, [router]);

  return null;
}


