'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { payrollPoliciesApi } from '@/lib/api';
import { PayrollPolicy, ConfigStatus } from '@/types/payroll-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@/components/ui/shadcn';
import { Button } from '@/components/ui/shadcn';
import { formatDateReadable } from '@/lib/format';

function PayrollPoliciesPage() {
  const [policies, setPolicies] = useState<PayrollPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const data = await payrollPoliciesApi.getAll();
      setPolicies(data);
    } catch (error) {
      console.error('Error loading policies:', error);
      alert('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (policy: PayrollPolicy) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;

    try {
      await payrollPoliciesApi.delete(policy._id);
      loadPolicies();
    } catch (error: any) {
      console.error('Error deleting policy:', error);
      alert(error.message || 'Failed to delete policy');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Payroll Policies</h1>
        <Link href="/payroll-config/policies?create=true">
          <Button>Create Policy</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Policy Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Applicability</TableHead>
            <TableHead>Effective Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((policy) => (
            <TableRow key={policy._id}>
              <TableCell>{policy.policyName}</TableCell>
              <TableCell>{policy.policyType}</TableCell>
              <TableCell>{policy.applicability}</TableCell>
              <TableCell>{formatDateReadable(policy.effectiveDate)}</TableCell>
              <TableCell>
                {(() => {
                  const map: Record<string, { label: string; variant: any }> = {
                    [ConfigStatus.DRAFT]: { label: 'Draft', variant: 'secondary' },
                    [ConfigStatus.APPROVED]: { label: 'Approved', variant: 'default' },
                    [ConfigStatus.REJECTED]: { label: 'Rejected', variant: 'destructive' },
                  };
                  const s = map[policy.status] || { label: policy.status, variant: 'default' };
                  return <Badge variant={s.variant}>{s.label}</Badge>;
                })()}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link href={`/payroll-config/policies?edit=${policy._id}`}>
                    <Button
                      size="sm"
                      variant="success"
                      disabled={policy.status !== ConfigStatus.DRAFT}
                    >
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/payroll-config/policies?status=${policy._id}`}>
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
                    onClick={() => handleDelete(policy)}
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

export default PayrollPoliciesPage;

