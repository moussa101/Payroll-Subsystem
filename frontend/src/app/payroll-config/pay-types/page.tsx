'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { payTypesApi } from '@/app/payroll-config/client';
import { PayType, ConfigStatus } from '@/types/payroll-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/format';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export default function PayTypesPage() {
  const [payTypes, setPayTypes] = useState<PayType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayTypes();
  }, []);

  const loadPayTypes = async () => {
    try {
      setLoading(true);
      const data = await payTypesApi.getAll();
      setPayTypes(data);
    } catch (error) {
      console.error('Error loading pay types:', error);
      alert('Failed to load pay types');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (payType: PayType) => {
    if (!confirm('Are you sure you want to delete this pay type?')) return;

    try {
      await payTypesApi.delete(payType._id);
      loadPayTypes();
    } catch (error) {
      console.error('Error deleting pay type:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete pay type';
      alert(message);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-foreground">Pay Types</h1>
            <p className="text-muted-foreground text-sm">Manage pay type amounts and approval status.</p>
          </div>
          <Link href="/payroll-config/pay-types?create=true">
            <Button>Create pay type</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Pay type list</CardTitle>
            <CardDescription>All pay types with amounts, status, and quick actions.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payTypes.map((payType) => (
                  <TableRow key={payType._id}>
                    <TableCell className="font-medium">{payType.type}</TableCell>
                    <TableCell>{formatNumber(payType.amount)}</TableCell>
                    <TableCell>
                      {(() => {
                        const map: Record<string, { label: string; variant: BadgeVariant }> = {
                          [ConfigStatus.DRAFT]: { label: 'Draft', variant: 'secondary' },
                          [ConfigStatus.APPROVED]: { label: 'Approved', variant: 'default' },
                          [ConfigStatus.REJECTED]: { label: 'Rejected', variant: 'destructive' },
                        };
                        const s = map[payType.status] || { label: payType.status, variant: 'default' };
                        return <Badge variant={s.variant}>{s.label}</Badge>;
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/payroll-config/pay-types?edit=${payType._id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={payType.status !== ConfigStatus.DRAFT}
                          >
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/payroll-config/pay-types?status=${payType._id}`}>
                          <Button size="sm" variant="secondary">
                            Change status
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(payType)}
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
