'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signingBonusesApi } from '@/app/payroll-config/client';
import { SigningBonus, ConfigStatus } from '@/types/payroll-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/format';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export default function SigningBonusesPage() {
  const [signingBonuses, setSigningBonuses] = useState<SigningBonus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSigningBonuses();
  }, []);

  const loadSigningBonuses = async () => {
    try {
      setLoading(true);
      const data = await signingBonusesApi.getAll();
      setSigningBonuses(data);
    } catch (error) {
      console.error('Error loading signing bonuses:', error);
      alert('Failed to load signing bonuses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bonus: SigningBonus) => {
    if (!confirm('Are you sure you want to delete this signing bonus?')) return;

    try {
      await signingBonusesApi.delete(bonus._id);
      loadSigningBonuses();
    } catch (error) {
      console.error('Error deleting signing bonus:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete signing bonus';
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
            <h1 className="text-3xl font-semibold text-foreground">Signing Bonuses</h1>
            <p className="text-muted-foreground text-sm">Manage signing incentives for positions.</p>
          </div>
          <Link href="/payroll-config/signing-bonuses?create=true">
            <Button>Create signing bonus</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Signing bonus list</CardTitle>
            <CardDescription>Bonus amounts and status per position.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signingBonuses.map((bonus) => (
                  <TableRow key={bonus._id}>
                    <TableCell className="font-medium">{bonus.positionName}</TableCell>
                    <TableCell>{formatNumber(bonus.amount)}</TableCell>
                    <TableCell>
                      {(() => {
                        const map: Record<string, { label: string; variant: BadgeVariant }> = {
                          [ConfigStatus.DRAFT]: { label: 'Draft', variant: 'secondary' },
                          [ConfigStatus.APPROVED]: { label: 'Approved', variant: 'default' },
                          [ConfigStatus.REJECTED]: { label: 'Rejected', variant: 'destructive' },
                        };
                        const s = map[bonus.status] || { label: bonus.status, variant: 'default' };
                        return <Badge variant={s.variant}>{s.label}</Badge>;
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/payroll-config/signing-bonuses?edit=${bonus._id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={bonus.status !== ConfigStatus.DRAFT}
                          >
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/payroll-config/signing-bonuses?status=${bonus._id}`}>
                          <Button size="sm" variant="secondary">
                            Change status
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(bonus)}
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
