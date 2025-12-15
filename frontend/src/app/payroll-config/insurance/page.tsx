'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { insuranceApi } from '@/lib/api';
import { InsuranceBracket, ConfigStatus } from '@/types/payroll-config';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
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
        <h1 className="text-3xl font-bold text-gray-900">Insurance Brackets</h1>
        <Link href="/payroll-config/insurance?create=true">
          <Button>Create Insurance Bracket</Button>
        </Link>
      </div>

      <Table headers={['Name', 'Min Salary', 'Max Salary', 'Employee Rate (%)', 'Employer Rate (%)', 'Status', 'Actions']}>
        {insuranceBrackets.map((insurance) => (
          <TableRow key={insurance._id}>
            <TableCell>{insurance.name}</TableCell>
            <TableCell>{formatNumber(insurance.minSalary)}</TableCell>
            <TableCell>{formatNumber(insurance.maxSalary)}</TableCell>
            <TableCell>{insurance.employeeRate}%</TableCell>
            <TableCell>{insurance.employerRate}%</TableCell>
            <TableCell>
              <StatusBadge status={insurance.status} />
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Link href={`/payroll-config/insurance?edit=${insurance._id}`}>
                  <Button
                    size="sm"
                    variant="secondary"
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
                  variant="danger"
                  onClick={() => handleDelete(insurance)}
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
