'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { allowancesApi } from '@/app/payroll-config/client';
import { Allowance, ConfigStatus } from '@/types/payroll-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/format';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

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
    } catch (error) {
      console.error('Error deleting allowance:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete allowance';
      alert(message);
    }
  };

  if (loading) {
    return null; // Let the loading.tsx handle the loading state
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-foreground">Allowances</h1>
            <p className="text-muted-foreground text-sm">
              Manage recurring allowance configurations with approvals and status tracking.
            </p>
          </div>
          <Link href="/payroll-config/allowances?create=true">
            <Button>Create allowance</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Allowance list</CardTitle>
            <CardDescription>All allowances with amounts, status, and quick actions.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allowances.map((allowance) => (
                  <TableRow key={allowance._id}>
                    <TableCell className="font-medium">{allowance.name}</TableCell>
                    <TableCell>{formatNumber(allowance.amount)}</TableCell>
                    <TableCell>
                      {(() => {
                        const map: Record<string, { label: string; variant: BadgeVariant }> = {
                          [ConfigStatus.DRAFT]: { label: 'Draft', variant: 'secondary' },
                          [ConfigStatus.APPROVED]: { label: 'Approved', variant: 'default' },
                          [ConfigStatus.REJECTED]: { label: 'Rejected', variant: 'destructive' },
                        };
                        const s = map[allowance.status] || { label: allowance.status, variant: 'default' };
                        return <Badge variant={s.variant}>{s.label}</Badge>;
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/payroll-config/allowances?edit=${allowance._id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={allowance.status !== ConfigStatus.DRAFT}
                          >
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/payroll-config/allowances?status=${allowance._id}`}>
                          <Button size="sm" variant="secondary">
                            Change status
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
