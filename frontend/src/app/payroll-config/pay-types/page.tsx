'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { payTypesApi } from '@/lib/api';
import { PayType, ConfigStatus } from '@/types/payroll-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@/components/ui/shadcn';
import { Button } from '@/components/ui/shadcn';
import { formatNumber } from '@/lib/format';

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
    } catch (error: any) {
      console.error('Error deleting pay type:', error);
      alert(error.message || 'Failed to delete pay type');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Pay Types</h1>
        <Link href="/payroll-config/pay-types?create=true">
          <Button>Create Pay Type</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payTypes.map((payType) => (
            <TableRow key={payType._id}>
              <TableCell>{payType.type}</TableCell>
              <TableCell>{formatNumber(payType.amount)}</TableCell>
              <TableCell>
                {(() => {
                  const map: Record<string, { label: string; variant: any }> = {
                    [ConfigStatus.DRAFT]: { label: 'Draft', variant: 'secondary' },
                    [ConfigStatus.APPROVED]: { label: 'Approved', variant: 'default' },
                    [ConfigStatus.REJECTED]: { label: 'Rejected', variant: 'destructive' },
                  };
                  const s = map[payType.status] || { label: payType.status, variant: 'default' };
                  return <Badge variant={s.variant}>{s.label}</Badge>;
                })()}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link href={`/payroll-config/pay-types?edit=${payType._id}`}>
                    <Button
                      size="sm"
                      variant="success"
                      disabled={payType.status !== ConfigStatus.DRAFT}
                    >
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/payroll-config/pay-types?status=${payType._id}`}>
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
    </div>
  );
}
