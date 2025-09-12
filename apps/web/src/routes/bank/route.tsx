import { createFileRoute } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import PremiumFeatureGuard from '@/components/subscription/PremiumFeatureGuard';
import { SideBarLayout } from '@/components/layout/sidebar-layout';
import type { FeatureCode, BankAccount, BankTransaction } from '@/types/api';
import { apiService } from '@/services/api';

export const Route = createFileRoute('/bank/' as any)({
  component: BankPage,
});

function BankPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [tx, setTx] = useState<Record<string, BankTransaction[]>>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await apiService.getBankAccounts();
        setAccounts(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sync = async (accountId: string) => {
    await apiService.syncBankAccount(accountId);
    const list = await apiService.getBankTransactions(accountId);
    setTx((prev) => ({ ...prev, [accountId]: list }));
  };

  const loadTransactions = async (accountId: string) => {
    const list = await apiService.getBankTransactions(accountId);
    setTx((prev) => ({ ...prev, [accountId]: list }));
  };

  return (
    <SideBarLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-4">Bank Accounts</h1>
        <PremiumFeatureGuard feature={'bank_integration' as FeatureCode}>
          <div className="p-0">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-3">
                {accounts.map((a) => (
                  <div key={a._id} className="rounded border p-3">
                    <div className="font-medium">{a.bankName} ••••{a.accountNumber.slice(-4)}</div>
                    <div className="text-sm text-muted-foreground">Balance: ${a.balance.toFixed(2)}</div>
                    <div className="flex gap-2 mt-2">
                      <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm" onClick={() => sync(a._id)}>{'Sync'}</button>
                      <button className="px-3 py-1 rounded bg-gray-600 text-white text-sm" onClick={() => loadTransactions(a._id)}>{'View transactions'}</button>
                    </div>
                    {tx[a._id] && (
                      <div className="mt-3 text-sm">
                        {tx[a._id].map((t) => (
                          <div key={t._id} className="flex justify-between border-b py-1">
                            <span>{t.description}</span>
                            <span>${t.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
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


