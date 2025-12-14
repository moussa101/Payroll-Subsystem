'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { allowancesApi } from '@/lib/api';
import { Allowance, UpdateAllowanceDto, ConfigStatus } from '@/types/payroll-config';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';

function EditAllowanceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('edit');
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [formData, setFormData] = useState<UpdateAllowanceDto>({
    name: '',
    amount: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadAllowance = async () => {
      if (!id) {
        setFetching(false);
        return;
      }
      try {
        const data = await allowancesApi.getById(id);
        setAllowance(data);
        setFormData({
          name: data.name,
          amount: data.amount,
        });
        if (data.status !== ConfigStatus.DRAFT) {
          alert('Only draft allowances can be edited');
          router.push('/payroll-config/allowances');
        }
      } catch (error) {
        console.error('Error loading allowance:', error);
        alert('Failed to load allowance');
        router.push('/payroll-config/allowances');
      } finally {
        setFetching(false);
      }
    };
    loadAllowance();
  }, [id, router]);

  if (!id) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await allowancesApi.update(id, formData);
      router.push('/payroll-config/allowances');
      router.refresh();
    } catch (error: any) {
      console.error('Error updating allowance:', error);
      alert(error.message || 'Failed to update allowance');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[100]">
        <div className="bg-white rounded-lg p-6 relative z-[101]">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto relative z-[101]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Edit Allowance</h2>
            <button
              onClick={() => router.push('/payroll-config/allowances')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              error={errors.name}
            />
            <FormInput
              label="Amount"
              type="number"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              required
              error={errors.amount}
            />
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/payroll-config/allowances')}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Update
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditAllowancePage() {
  return (
    <Suspense fallback={null}>
      <EditAllowanceForm />
    </Suspense>
  );
}

