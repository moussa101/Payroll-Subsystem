'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { taxRulesApi } from '@/lib/api';
import { TaxRule, ConfigStatus } from '@/types/payroll-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@/components/ui/shadcn';
import { Button } from '@/components/ui/shadcn';

function TaxRulesPage() {
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaxRules();
  }, []);

  const loadTaxRules = async () => {
    try {
      setLoading(true);
      const data = await taxRulesApi.getAll();
      setTaxRules(data);
    } catch (error) {
      console.error('Error loading tax rules:', error);
      alert('Failed to load tax rules');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taxRule: TaxRule) => {
    if (!confirm('Are you sure you want to delete this tax rule?')) return;

    try {
      await taxRulesApi.delete(taxRule._id);
      loadTaxRules();
    } catch (error: any) {
      console.error('Error deleting tax rule:', error);
      alert(error.message || 'Failed to delete tax rule');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Tax Rules</h1>
        <Link href="/payroll-config/tax-rules?create=true">
          <Button>Create Tax Rule</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Rate (%)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {taxRules.map((taxRule) => (
            <TableRow key={taxRule._id}>
              <TableCell>{taxRule.name}</TableCell>
              <TableCell>{taxRule.description || 'N/A'}</TableCell>
              <TableCell>{taxRule.rate}%</TableCell>
              <TableCell>
                {(() => {
                  const map: Record<string, { label: string; variant: any }> = {
                    [ConfigStatus.DRAFT]: { label: 'Draft', variant: 'secondary' },
                    [ConfigStatus.APPROVED]: { label: 'Approved', variant: 'default' },
                    [ConfigStatus.REJECTED]: { label: 'Rejected', variant: 'destructive' },
                  };
                  const s = map[taxRule.status] || { label: taxRule.status, variant: 'default' };
                  return <Badge variant={s.variant}>{s.label}</Badge>;
                })()}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link href={`/payroll-config/tax-rules?edit=${taxRule._id}`}>
                    <Button
                      size="sm"
                      variant="success"
                      disabled={taxRule.status !== ConfigStatus.DRAFT}
                    >
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/payroll-config/tax-rules?status=${taxRule._id}`}>
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
                    onClick={() => handleDelete(taxRule)}
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

export default TaxRulesPage;

