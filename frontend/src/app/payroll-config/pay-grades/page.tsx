'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { payGradesApi } from '@/app/payroll-config/client';
import { PayGrade, ConfigStatus } from '@/types/payroll-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/format';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

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
    } catch (error) {
      console.error('Error deleting pay grade:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete pay grade';
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
            <h1 className="text-3xl font-semibold text-foreground">Pay Grades</h1>
            <p className="text-muted-foreground text-sm">
              Manage base and gross salary structures across departments and positions.
            </p>
          </div>
          <Link href="/payroll-config/pay-grades?create=true">
            <Button>Create pay grade</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Pay grade list</CardTitle>
            <CardDescription>All grades with salary figures, status, and quick actions.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grade</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead>Gross Salary</TableHead>
                  <TableHead>Department ID</TableHead>
                  <TableHead>Position ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payGrades.map((payGrade) => (
                  <TableRow key={payGrade._id}>
                    <TableCell className="font-medium">{payGrade.grade}</TableCell>
                    <TableCell>{formatNumber(payGrade.baseSalary)}</TableCell>
                    <TableCell>{formatNumber(payGrade.grossSalary)}</TableCell>
                    <TableCell>{payGrade.departmentId || 'N/A'}</TableCell>
                    <TableCell>{payGrade.positionId || 'N/A'}</TableCell>
                    <TableCell>
                      {(() => {
                        const map: Record<string, { label: string; variant: BadgeVariant }> = {
                          [ConfigStatus.DRAFT]: { label: 'Draft', variant: 'secondary' },
                          [ConfigStatus.APPROVED]: { label: 'Approved', variant: 'default' },
                          [ConfigStatus.REJECTED]: { label: 'Rejected', variant: 'destructive' },
                        };
                        const s = map[payGrade.status] || { label: payGrade.status, variant: 'default' };
                        return <Badge variant={s.variant}>{s.label}</Badge>;
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link href={`/payroll-config/pay-grades?edit=${payGrade._id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={payGrade.status !== ConfigStatus.DRAFT}
                          >
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/payroll-config/pay-grades?status=${payGrade._id}`}>
                          <Button size="sm" variant="secondary">
                            Change status
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(payGrade)}
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
