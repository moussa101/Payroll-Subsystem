'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { terminationBenefitsApi } from '@/lib/api';
import { TerminationBenefit, ConfigStatus } from '@/types/payroll-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@/components/ui/shadcn';
import { Button } from '@/components/ui/shadcn';
import { formatNumber } from '@/lib/format';

export default function TerminationBenefitsPage() {
  const [terminationBenefits, setTerminationBenefits] = useState<TerminationBenefit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTerminationBenefits();
  }, []);

  const loadTerminationBenefits = async () => {
    try {
      setLoading(true);
      const data = await terminationBenefitsApi.getAll();
      setTerminationBenefits(data);
    } catch (error) {
      console.error('Error loading termination benefits:', error);
      alert('Failed to load termination benefits');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (benefit: TerminationBenefit) => {
    if (!confirm('Are you sure you want to delete this termination benefit?')) return;

    try {
      await terminationBenefitsApi.delete(benefit._id);
      loadTerminationBenefits();
    } catch (error: any) {
      console.error('Error deleting termination benefit:', error);
      alert(error.message || 'Failed to delete termination benefit');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Termination Benefits</h1>
        <Link href="/payroll-config/termination-benefits?create=true">
          <Button>Create Termination Benefit</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Terms</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {terminationBenefits.map((benefit) => (
            <TableRow key={benefit._id}>
              <TableCell>{benefit.name}</TableCell>
              <TableCell>{formatNumber(benefit.amount)}</TableCell>
              <TableCell>{benefit.terms || 'N/A'}</TableCell>
              <TableCell>
                {(() => {
                  const map: Record<string, { label: string; variant: any }> = {
                    [ConfigStatus.DRAFT]: { label: 'Draft', variant: 'secondary' },
                    [ConfigStatus.APPROVED]: { label: 'Approved', variant: 'default' },
                    [ConfigStatus.REJECTED]: { label: 'Rejected', variant: 'destructive' },
                  };
                  const s = map[benefit.status] || { label: benefit.status, variant: 'default' };
                  return <Badge variant={s.variant}>{s.label}</Badge>;
                })()}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link href={`/payroll-config/termination-benefits?edit=${benefit._id}`}>
                    <Button
                      size="sm"
                      variant="success"
                      disabled={benefit.status !== ConfigStatus.DRAFT}
                    >
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/payroll-config/termination-benefits?status=${benefit._id}`}>
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
                    onClick={() => handleDelete(benefit)}
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
