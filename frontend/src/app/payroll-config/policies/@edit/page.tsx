'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { payrollPoliciesApi } from '@/lib/api';
import { PayrollPolicy, UpdatePayrollPolicyDto, ConfigStatus, PolicyType, Applicability } from '@/types/payroll-config';
import { Button } from '@/components/ui/Button';
import { FormInput, FormTextarea, FormSelect } from '@/components/ui/FormInput';

const policyTypeOptions = [
  { value: PolicyType.ALLOWANCE, label: 'Allowance' },
  { value: PolicyType.DEDUCTION, label: 'Deduction' },
  { value: PolicyType.BENEFIT, label: 'Benefit' },
  { value: PolicyType.MISCONDUCT, label: 'Misconduct' },
  { value: PolicyType.LEAVE, label: 'Leave' },
];

const applicabilityOptions = [
  { value: Applicability.AllEmployees, label: 'All Employees' },
  { value: Applicability.FULL_TIME, label: 'Full Time Employees' },
  { value: Applicability.PART_TIME, label: 'Part Time Employees' },
  { value: Applicability.CONTRACTORS, label: 'Contractors' },
];

function EditPolicyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('edit');
  const [policy, setPolicy] = useState<PayrollPolicy | null>(null);
  const [formData, setFormData] = useState<UpdatePayrollPolicyDto>({
    policyName: '',
    policyType: PolicyType.ALLOWANCE,
    description: '',
    effectiveDate: '',
    ruleDefinition: {
      percentage: 0,
      fixedAmount: 0,
      thresholdAmount: 1,
    },
    applicability: Applicability.AllEmployees,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadPolicy = async () => {
      if (!id) {
        setFetching(false);
        return;
      }
      try {
        const data = await payrollPoliciesApi.getById(id);
        setPolicy(data);
        setFormData({
          policyName: data.policyName,
          policyType: data.policyType,
          description: data.description,
          effectiveDate: data.effectiveDate.split('T')[0],
          ruleDefinition: data.ruleDefinition,
          applicability: data.applicability,
        });
        if (data.status !== ConfigStatus.DRAFT) {
          alert('Only draft policies can be edited');
          router.push('/payroll-config/policies');
        }
      } catch (error) {
        console.error('Error loading policy:', error);
        alert('Failed to load policy');
        router.push('/payroll-config/policies');
      } finally {
        setFetching(false);
      }
    };
    loadPolicy();
  }, [id, router]);

  if (!id) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.policyName?.trim()) {
      setErrors({ policyName: 'Policy Name is required' });
      return;
    }
    if (!formData.description?.trim()) {
      setErrors({ description: 'Description is required' });
      return;
    }
    if (!formData.effectiveDate) {
      setErrors({ effectiveDate: 'Effective Date is required' });
      return;
    }

    setLoading(true);
    try {
      await payrollPoliciesApi.update(id, formData);
      router.push('/payroll-config/policies');
      router.refresh();
    } catch (error: any) {
      console.error('Error updating policy:', error);
      alert(error.message || 'Failed to update policy');
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative z-[101]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Edit Payroll Policy</h2>
            <button
              onClick={() => router.push('/payroll-config/policies')}
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
              label="Policy Name"
              value={formData.policyName || ''}
              onChange={(e) => setFormData({ ...formData, policyName: e.target.value })}
              required
              error={errors.policyName}
            />
            <FormSelect
              label="Policy Type"
              value={formData.policyType || PolicyType.ALLOWANCE}
              onChange={(e) => setFormData({ ...formData, policyType: e.target.value as PolicyType })}
              options={policyTypeOptions}
              required
            />
            <FormTextarea
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              error={errors.description}
              rows={3}
            />
            <FormInput
              label="Effective Date"
              type="date"
              value={formData.effectiveDate || ''}
              onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
              required
              error={errors.effectiveDate}
            />
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Rule Definition</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormInput
                  label="Percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.ruleDefinition?.percentage || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ruleDefinition: { ...(formData.ruleDefinition || { percentage: 0, fixedAmount: 0, thresholdAmount: 1 }), percentage: parseFloat(e.target.value) || 0 },
                    })
                  }
                  required
                />
                <FormInput
                  label="Fixed Amount"
                  type="number"
                  min="0"
                  value={formData.ruleDefinition?.fixedAmount || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ruleDefinition: { ...(formData.ruleDefinition || { percentage: 0, fixedAmount: 0, thresholdAmount: 1 }), fixedAmount: parseFloat(e.target.value) || 0 },
                    })
                  }
                  required
                />
                <FormInput
                  label="Threshold Amount"
                  type="number"
                  min="1"
                  value={formData.ruleDefinition?.thresholdAmount || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ruleDefinition: { ...(formData.ruleDefinition || { percentage: 0, fixedAmount: 0, thresholdAmount: 1 }), thresholdAmount: parseFloat(e.target.value) || 1 },
                    })
                  }
                  required
                />
              </div>
            </div>
            <FormSelect
              label="Applicability"
              value={formData.applicability || Applicability.AllEmployees}
              onChange={(e) => setFormData({ ...formData, applicability: e.target.value as Applicability })}
              options={applicabilityOptions}
              required
            />
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/payroll-config/policies')}
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

export default function EditPolicyPage() {
  return (
    <Suspense fallback={null}>
      <EditPolicyForm />
    </Suspense>
  );
}

