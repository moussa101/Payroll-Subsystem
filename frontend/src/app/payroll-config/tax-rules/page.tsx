'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { taxRulesApi } from '@/lib/api';
import { TaxRule, ConfigStatus } from '@/types/payroll-config';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

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
        <h1 className="text-3xl font-bold text-gray-900">Tax Rules</h1>
        <Link href="/payroll-config/tax-rules?create=true">
          <Button>Create Tax Rule</Button>
        </Link>
      </div>

      <Table headers={['Name', 'Description', 'Rate (%)', 'Status', 'Actions']}>
        {taxRules.map((taxRule) => (
          <TableRow key={taxRule._id}>
            <TableCell>{taxRule.name}</TableCell>
            <TableCell>{taxRule.description || 'N/A'}</TableCell>
            <TableCell>{taxRule.rate}%</TableCell>
            <TableCell>
              <StatusBadge status={taxRule.status} />
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Link href={`/payroll-config/tax-rules?edit=${taxRule._id}`}>
                  <Button
                    size="sm"
                    variant="secondary"
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
                  variant="danger"
                  onClick={() => handleDelete(taxRule)}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </div>
  );
}

export default TaxRulesPage;

