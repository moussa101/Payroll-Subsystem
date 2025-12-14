'use client';

import React, { useState, useEffect } from 'react';
import { companySettingsApi } from '@/lib/api';
import { CompanySettings, CreateCompanySettingsDto, UpdateCompanySettingsDto } from '@/types/payroll-config';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FormInput, FormSelect } from '@/components/ui/FormInput';
import { formatDateReadable } from '@/lib/format';

export default function CompanySettingsPage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateCompanySettingsDto>({
    payDate: '',
    timeZone: '',
    currency: 'EGP',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await companySettingsApi.get();
      setSettings(data);
      if (data) {
        setFormData({
          payDate: data.payDate ? new Date(data.payDate).toISOString().split('T')[0] : '',
          timeZone: data.timeZone || '',
          currency: data.currency || 'EGP',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Settings might not exist yet, that's okay
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (settings) {
      setFormData({
        payDate: settings.payDate ? new Date(settings.payDate).toISOString().split('T')[0] : '',
        timeZone: settings.timeZone || '',
        currency: settings.currency || 'EGP',
      });
    }
    setErrors({});
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (settings) {
        await companySettingsApi.update(formData);
      } else {
        await companySettingsApi.create(formData as CreateCompanySettingsDto);
      }
      setIsEditModalOpen(false);
      loadSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert(error.message || 'Failed to save settings');
    }
  };

  const timeZoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
    { value: 'Africa/Cairo', label: 'Africa/Cairo (EET)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  ];

  const currencyOptions = [
    { value: 'EGP', label: 'EGP - Egyptian Pound' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
  ];

  if (loading) {
    return null; // Let the loading.tsx handle the loading state
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>
        <Button onClick={handleEdit}>{settings ? 'Edit Settings' : 'Create Settings'}</Button>
      </div>

      {settings ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Pay Date</label>
              <p className="mt-1 text-lg text-gray-900">
                {formatDateReadable(settings.payDate)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Time Zone</label>
              <p className="mt-1 text-lg text-gray-900">{settings.timeZone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Currency</label>
              <p className="mt-1 text-lg text-gray-900">{settings.currency || 'EGP'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">No company settings configured yet.</p>
          <Button onClick={handleEdit}>Create Settings</Button>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={settings ? 'Edit Company Settings' : 'Create Company Settings'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Pay Date"
            type="date"
            value={formData.payDate}
            onChange={(e) => setFormData({ ...formData, payDate: e.target.value })}
            required
            error={errors.payDate}
          />
          <FormSelect
            label="Time Zone"
            value={formData.timeZone}
            onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
            options={timeZoneOptions}
            required
            error={errors.timeZone}
          />
          <FormSelect
            label="Currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            options={currencyOptions}
            error={errors.currency}
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {settings ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

