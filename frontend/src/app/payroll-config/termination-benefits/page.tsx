'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { terminationBenefitsApi } from '@/app/payroll-config/client';
import { TerminationBenefit, ConfigStatus } from '@/types/payroll-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/format';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

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
    } catch (error) {
      console.error('Error deleting termination benefit:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete termination benefit';
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
            <h1 className="text-3xl font-semibold text-foreground">Termination Benefits</h1>
            <p className="text-muted-foreground text-sm">Manage severance packages and approval state.</p>
          </div>
          <Link href="/payroll-config/termination-benefits?create=true">
            <Button>Create termination benefit</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Termination benefit list</CardTitle>
            <CardDescription>Amounts, terms, and status with quick actions.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Terms</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {terminationBenefits.map((benefit) => (
                  <TableRow key={benefit._id}>
                    <TableCell className="font-medium">{benefit.name}</TableCell>
                    <TableCell>{formatNumber(benefit.amount)}</TableCell>
                    <TableCell className="max-w-xl">{benefit.terms || 'N/A'}</TableCell>
                    <TableCell>
                      {(() => {
                        const map: Record<string, { label: string; variant: BadgeVariant }> = {
                          [ConfigStatus.DRAFT]: { label: 'Draft', variant: 'secondary' },
                          [ConfigStatus.APPROVED]: { label: 'Approved', variant: 'default' },
                          [ConfigStatus.REJECTED]: { label: 'Rejected', variant: 'destructive' },
                        };
                        const s = map[benefit.status] || { label: benefit.status, variant: 'default' };
                        return <Badge variant={s.variant}>{s.label}</Badge>;
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/payroll-config/termination-benefits?edit=${benefit._id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={benefit.status !== ConfigStatus.DRAFT}
                          >
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/payroll-config/termination-benefits?status=${benefit._id}`}>
                          <Button size="sm" variant="secondary">
                            Change status
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
