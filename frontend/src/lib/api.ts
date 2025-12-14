// API utility functions for payroll configuration

import type {
  CompanySettings,
  CreateCompanySettingsDto,
  UpdateCompanySettingsDto,
  PayGrade,
  CreatePayGradeDto,
  UpdatePayGradeDto,
  PayrollPolicy,
  CreatePayrollPolicyDto,
  UpdatePayrollPolicyDto,
  TaxRule,
  CreateTaxRuleDto,
  UpdateTaxRuleDto,
  InsuranceBracket,
  CreateInsuranceDto,
  UpdateInsuranceDto,
  Allowance,
  CreateAllowanceDto,
  UpdateAllowanceDto,
  PayType,
  CreatePayTypeDto,
  UpdatePayTypeDto,
  SigningBonus,
  CreateSigningBonusDto,
  UpdateSigningBonusDto,
  TerminationBenefit,
  CreateTerminationBenefitDto,
  UpdateTerminationBenefitDto,
  ChangeStatusDto,
} from '../types/payroll-config';

// API base URL - defaults to localhost:3000 (backend default port)
// Can be overridden by setting NEXT_PUBLIC_API_URL environment variable
const API_BASE_URL = 'http://localhost:3000';

// Helper function to get auth token (you'll need to implement auth storage)
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/payroll-config${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorDetails: any = null;
      
      try {
        // Try to get response as text first to see what we're dealing with
        const responseText = await response.clone().text();
        console.error('API Error Response Text:', responseText);
        
        // Try to parse as JSON
        if (responseText) {
          try {
            errorDetails = JSON.parse(responseText);
            console.error('API Error Details (JSON):', errorDetails);
          } catch {
            // Not JSON, use as text
            errorDetails = { message: responseText };
            console.error('API Error Details (Text):', responseText);
          }
        }
        
        errorMessage = errorDetails?.message || errorDetails?.error || response.statusText || errorMessage;
      } catch (parseError) {
        // If we can't read the response at all
        console.error('Failed to parse error response:', parseError);
        errorMessage = response.statusText || `HTTP ${response.status} error`;
      }
      
      throw new Error(errorMessage);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    }
    return {} as T;
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Company Settings
export const companySettingsApi = {
  get: () => apiRequest<CompanySettings>('/settings'),
  create: (data: CreateCompanySettingsDto) => apiRequest<CompanySettings>('/settings', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (data: UpdateCompanySettingsDto) => apiRequest<CompanySettings>('/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Pay Grades
export const payGradesApi = {
  getAll: () => apiRequest<PayGrade[]>('/pay-grades'),
  getById: (id: string) => apiRequest<PayGrade>(`/pay-grades/${id}`),
  create: (data: CreatePayGradeDto) => apiRequest<PayGrade>('/pay-grades', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdatePayGradeDto) => apiRequest<PayGrade>(`/pay-grades/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changeStatus: (id: string, data: ChangeStatusDto) => apiRequest<PayGrade>(`/pay-grades/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest<{ message: string }>(`/pay-grades/${id}`, {
    method: 'DELETE',
  }),
};

// Payroll Policies
export const payrollPoliciesApi = {
  getAll: () => apiRequest<PayrollPolicy[]>('/policies'),
  getById: (id: string) => apiRequest<PayrollPolicy>(`/policies/${id}`),
  create: (data: CreatePayrollPolicyDto) => apiRequest<PayrollPolicy>('/policies', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdatePayrollPolicyDto) => apiRequest<PayrollPolicy>(`/policies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changeStatus: (id: string, data: ChangeStatusDto) => apiRequest<PayrollPolicy>(`/policies/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest<{ message: string }>(`/policies/${id}`, {
    method: 'DELETE',
  }),
};

// Tax Rules
export const taxRulesApi = {
  getAll: () => apiRequest<TaxRule[]>('/tax-rules'),
  getById: (id: string) => apiRequest<TaxRule>(`/tax-rules/${id}`),
  create: (data: CreateTaxRuleDto) => apiRequest<TaxRule>('/tax-rules', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdateTaxRuleDto) => apiRequest<TaxRule>(`/tax-rules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changeStatus: (id: string, data: ChangeStatusDto) => apiRequest<TaxRule>(`/tax-rules/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest<{ message: string }>(`/tax-rules/${id}`, {
    method: 'DELETE',
  }),
};

// Insurance Brackets
export const insuranceApi = {
  getAll: () => apiRequest<InsuranceBracket[]>('/insurance'),
  getById: (id: string) => apiRequest<InsuranceBracket>(`/insurance/${id}`),
  create: (data: CreateInsuranceDto) => apiRequest<InsuranceBracket>('/insurance', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdateInsuranceDto) => apiRequest<InsuranceBracket>(`/insurance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changeStatus: (id: string, data: ChangeStatusDto) => apiRequest<InsuranceBracket>(`/insurance/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest<{ message: string }>(`/insurance/${id}`, {
    method: 'DELETE',
  }),
};

// Allowances
export const allowancesApi = {
  getAll: () => apiRequest<Allowance[]>('/allowances'),
  getById: (id: string) => apiRequest<Allowance>(`/allowances/${id}`),
  create: (data: CreateAllowanceDto) => apiRequest<Allowance>('/allowances', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdateAllowanceDto) => apiRequest<Allowance>(`/allowances/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changeStatus: (id: string, data: ChangeStatusDto) => apiRequest<Allowance>(`/allowances/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest<{ message: string }>(`/allowances/${id}`, {
    method: 'DELETE',
  }),
};

// Pay Types
export const payTypesApi = {
  getAll: () => apiRequest<PayType[]>('/pay-types'),
  getById: (id: string) => apiRequest<PayType>(`/pay-types/${id}`),
  create: (data: CreatePayTypeDto) => apiRequest<PayType>('/pay-types', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdatePayTypeDto) => apiRequest<PayType>(`/pay-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changeStatus: (id: string, data: ChangeStatusDto) => apiRequest<PayType>(`/pay-types/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest<{ message: string }>(`/pay-types/${id}`, {
    method: 'DELETE',
  }),
};

// Signing Bonuses
export const signingBonusesApi = {
  getAll: () => apiRequest<SigningBonus[]>('/signing-bonuses'),
  getById: (id: string) => apiRequest<SigningBonus>(`/signing-bonuses/${id}`),
  create: (data: CreateSigningBonusDto) => apiRequest<SigningBonus>('/signing-bonuses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdateSigningBonusDto) => apiRequest<SigningBonus>(`/signing-bonuses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changeStatus: (id: string, data: ChangeStatusDto) => apiRequest<SigningBonus>(`/signing-bonuses/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest<{ message: string }>(`/signing-bonuses/${id}`, {
    method: 'DELETE',
  }),
};

// Termination Benefits
export const terminationBenefitsApi = {
  getAll: () => apiRequest<TerminationBenefit[]>('/termination-benefits'),
  getById: (id: string) => apiRequest<TerminationBenefit>(`/termination-benefits/${id}`),
  create: (data: CreateTerminationBenefitDto) => apiRequest<TerminationBenefit>('/termination-benefits', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: UpdateTerminationBenefitDto) => apiRequest<TerminationBenefit>(`/termination-benefits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changeStatus: (id: string, data: ChangeStatusDto) => apiRequest<TerminationBenefit>(`/termination-benefits/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest<{ message: string }>(`/termination-benefits/${id}`, {
    method: 'DELETE',
  }),
};

