'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signingBonusesApi } from '@/lib/api';
import { SigningBonus, ConfigStatus } from '@/types/payroll-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@/components/ui/shadcn';
import { Button } from '@/components/ui/shadcn';
import { formatNumber } from '@/lib/format';

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
    } catch (error: any) {
      console.error('Error deleting signing bonus:', error);
      alert(error.message || 'Failed to delete signing bonus');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Signing Bonuses</h1>
        <Link href="/payroll-config/signing-bonuses?create=true">
          <Button>Create Signing Bonus</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Position Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signingBonuses.map((bonus) => (
            <TableRow key={bonus._id}>
              <TableCell>{bonus.positionName}</TableCell>
              <TableCell>{formatNumber(bonus.amount)}</TableCell>
              <TableCell>
                {(() => {
                  const map: Record<string, { label: string; variant: any }> = {
                    [ConfigStatus.DRAFT]: { label: 'Draft', variant: 'secondary' },
                    [ConfigStatus.APPROVED]: { label: 'Approved', variant: 'default' },
                    [ConfigStatus.REJECTED]: { label: 'Rejected', variant: 'destructive' },
                  };
                  const s = map[bonus.status] || { label: bonus.status, variant: 'default' };
                  return <Badge variant={s.variant}>{s.label}</Badge>;
                })()}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link href={`/payroll-config/signing-bonuses?edit=${bonus._id}`}>
                    <Button
                      size="sm"
                      variant="success"
                      disabled={bonus.status !== ConfigStatus.DRAFT}
                    >
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/payroll-config/signing-bonuses?status=${bonus._id}`}>
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
    </div>
  );
}
