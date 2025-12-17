'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { allowancesApi } from '@/lib/api';
import { Allowance, ConfigStatus } from '@/types/payroll-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@/components/ui/shadcn';
import { Button } from '@/components/ui/shadcn';
import { formatNumber } from '@/lib/format';

export default function AllowancesPage() {
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllowances();
  }, []);

  const loadAllowances = async () => {
    try {
      setLoading(true);
      const data = await allowancesApi.getAll();
      setAllowances(data);
    } catch (error) {
      console.error('Error loading allowances:', error);
      alert('Failed to load allowances');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (allowance: Allowance) => {
    if (!confirm('Are you sure you want to delete this allowance?')) return;

    try {
      await allowancesApi.delete(allowance._id);
      loadAllowances();
    } catch (error: any) {
      console.error('Error deleting allowance:', error);
      alert(error.message || 'Failed to delete allowance');
    }
  };

  if (loading) {
    return null; // Let the loading.tsx handle the loading state
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Allowances</h1>
        <Link href="/payroll-config/allowances?create=true">
          <Button>Create Allowance</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allowances.map((allowance) => (
            <TableRow key={allowance._id}>
              <TableCell>{allowance.name}</TableCell>
              <TableCell>{formatNumber(allowance.amount)}</TableCell>
              <TableCell>
                {(() => {
                  const map: Record<string, { label: string; variant: any }> = {
                    [ConfigStatus.DRAFT]: { label: 'Draft', variant: 'secondary' },
                    [ConfigStatus.APPROVED]: { label: 'Approved', variant: 'default' },
                    [ConfigStatus.REJECTED]: { label: 'Rejected', variant: 'destructive' },
                  };
                  const s = map[allowance.status] || { label: allowance.status, variant: 'default' };
                  return <Badge variant={s.variant}>{s.label}</Badge>;
                })()}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link href={`/payroll-config/allowances?edit=${allowance._id}`}>
                    <Button
                      size="sm"
                      variant="success"
                      disabled={allowance.status !== ConfigStatus.DRAFT}
                    >
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/payroll-config/allowances?status=${allowance._id}`}>
                    <Button
                      size="sm"
                      variant="primary"
                    >
                      Change Status
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(allowance)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
