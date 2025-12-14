'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { payGradesApi } from '@/lib/api';
import { PayGrade, ConfigStatus } from '@/types/payroll-config';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatNumber } from '@/lib/format';

export default function PayGradesPage() {
  const [payGrades, setPayGrades] = useState<PayGrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayGrades();
  }, []);

  const loadPayGrades = async () => {
    try {
      setLoading(true);
      const data = await payGradesApi.getAll();
      setPayGrades(data);
    } catch (error) {
      console.error('Error loading pay grades:', error);
      alert('Failed to load pay grades');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (payGrade: PayGrade) => {
    if (!confirm('Are you sure you want to delete this pay grade?')) return;

    try {
      await payGradesApi.delete(payGrade._id);
      loadPayGrades();
    } catch (error: any) {
      console.error('Error deleting pay grade:', error);
      alert(error.message || 'Failed to delete pay grade');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pay Grades</h1>
        <Link href="/payroll-config/pay-grades?create=true">
          <Button>Create Pay Grade</Button>
        </Link>
      </div>

      <Table headers={['Grade', 'Base Salary', 'Gross Salary', 'Department ID', 'Position ID', 'Status', 'Actions']}>
        {payGrades.map((payGrade) => (
          <TableRow key={payGrade._id}>
            <TableCell>{payGrade.grade}</TableCell>
            <TableCell>{formatNumber(payGrade.baseSalary)}</TableCell>
            <TableCell>{formatNumber(payGrade.grossSalary)}</TableCell>
            <TableCell>{payGrade.departmentId || 'N/A'}</TableCell>
            <TableCell>{payGrade.positionId || 'N/A'}</TableCell>
            <TableCell>
              <StatusBadge status={payGrade.status} />
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Link href={`/payroll-config/pay-grades?edit=${payGrade._id}`}>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={payGrade.status !== ConfigStatus.DRAFT}
                  >
                    Edit
                  </Button>
                </Link>
                <Link href={`/payroll-config/pay-grades?status=${payGrade._id}`}>
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
                  onClick={() => handleDelete(payGrade)}
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
