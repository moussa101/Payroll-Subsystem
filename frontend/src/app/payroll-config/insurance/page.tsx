'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { insuranceApi } from '@/lib/api';
import { InsuranceBracket, ConfigStatus } from '@/types/payroll-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@/components/ui/shadcn';
import { Button } from '@/components/ui/shadcn';
import { formatNumber } from '@/lib/format';

export default function InsurancePage() {
  const [insuranceBrackets, setInsuranceBrackets] = useState<InsuranceBracket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsuranceBrackets();
  }, []);

  const loadInsuranceBrackets = async () => {
    try {
      setLoading(true);
      const data = await insuranceApi.getAll();
      setInsuranceBrackets(data);
    } catch (error) {
      console.error('Error loading insurance brackets:', error);
      alert('Failed to load insurance brackets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (insurance: InsuranceBracket) => {
    if (!confirm('Are you sure you want to delete this insurance bracket?')) return;

    try {
      await insuranceApi.delete(insurance._id);
      loadInsuranceBrackets();
    } catch (error: any) {
      console.error('Error deleting insurance bracket:', error);
      alert(error.message || 'Failed to delete insurance bracket');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Insurance Brackets</h1>
        <Link href="/payroll-config/insurance?create=true">
          <Button>Create Insurance Bracket</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Min Salary</TableHead>
            <TableHead>Max Salary</TableHead>
            <TableHead>Employee Rate (%)</TableHead>
            <TableHead>Employer Rate (%)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {insuranceBrackets.map((insurance) => (
            <TableRow key={insurance._id}>
              <TableCell>{insurance.name}</TableCell>
              <TableCell>{formatNumber(insurance.minSalary)}</TableCell>
              <TableCell>{formatNumber(insurance.maxSalary)}</TableCell>
              <TableCell>{insurance.employeeRate}%</TableCell>
              <TableCell>{insurance.employerRate}%</TableCell>
              <TableCell>
                {(() => {
                  const map: Record<string, { label: string; variant: any }> = {
                    [ConfigStatus.DRAFT]: { label: 'Draft', variant: 'secondary' },
                    [ConfigStatus.APPROVED]: { label: 'Approved', variant: 'default' },
                    [ConfigStatus.REJECTED]: { label: 'Rejected', variant: 'destructive' },
                  };
                  const s = map[insurance.status] || { label: insurance.status, variant: 'default' };
                  return <Badge variant={s.variant}>{s.label}</Badge>;
                })()}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link href={`/payroll-config/insurance?edit=${insurance._id}`}>
                    <Button
                      size="sm"
                      variant="success"
                      disabled={insurance.status !== ConfigStatus.DRAFT}
                    >
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/payroll-config/insurance?status=${insurance._id}`}>
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
                    onClick={() => handleDelete(insurance)}
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
