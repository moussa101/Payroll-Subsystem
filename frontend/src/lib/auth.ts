// Matches backend SystemRole in src/employee-profile/enums/employee-profile.enums.ts
// Keeping full list for type safety when reading user data, but we only strictly enforce payroll roles
export enum UserRole {
    DEPARTMENT_EMPLOYEE = 'department employee',
    DEPARTMENT_HEAD = 'department head',
    HR_MANAGER = 'HR Manager',
    HR_EMPLOYEE = 'HR Employee',
    PAYROLL_SPECIALIST = 'Payroll Specialist',
    PAYROLL_MANAGER = 'Payroll Manager',
    SYSTEM_ADMIN = 'System Admin',
    LEGAL_POLICY_ADMIN = 'Legal & Policy Admin',
    RECRUITER = 'Recruiter',
    FINANCE_STAFF = 'Finance Staff',
    JOB_CANDIDATE = 'Job Candidate',
    HR_ADMIN = 'HR Admin',
}

// Only Payroll-related permissions needed for this subsystem
export enum Permission {
    MANAGE_PAYROLL = 'MANAGE_PAYROLL',
    APPROVE_PAYROLL = 'APPROVE_PAYROLL',
    VIEW_OWN_PAYSLIP = 'VIEW_OWN_PAYSLIP',
}

export interface User {
    id: string;
    name: string;
    role: UserRole;
}

// Mapping only for roles relevant to Payroll Execution
export const ROLE_PERMISSIONS: Partial<Record<UserRole, Permission[]>> = {
    [UserRole.PAYROLL_SPECIALIST]: [
        Permission.MANAGE_PAYROLL,
        Permission.APPROVE_PAYROLL,
    ],
    [UserRole.PAYROLL_MANAGER]: [
        Permission.MANAGE_PAYROLL,
        Permission.APPROVE_PAYROLL,
    ],
    [UserRole.FINANCE_STAFF]: [
        Permission.APPROVE_PAYROLL,
    ],
    [UserRole.LEGAL_POLICY_ADMIN]: [
        Permission.MANAGE_PAYROLL,
    ],
    [UserRole.DEPARTMENT_EMPLOYEE]: [
        Permission.VIEW_OWN_PAYSLIP,
    ],
    // System Admin typically has everything, adding for safety
    [UserRole.SYSTEM_ADMIN]: [
        Permission.MANAGE_PAYROLL,
        Permission.APPROVE_PAYROLL,
        Permission.VIEW_OWN_PAYSLIP,
    ],
};

// Mock function to get current user
export const getCurrentUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const hasPermission = (requiredPermission: Permission): boolean => {
    const user = getCurrentUser();
    if (!user) return false;

    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(requiredPermission);
};

// Specific permission checks for Payroll
export const canInitiatePayroll = () => hasPermission(Permission.MANAGE_PAYROLL);
export const canSubmitCorrection = () => hasPermission(Permission.MANAGE_PAYROLL);
export const canApprovePayroll = () => hasPermission(Permission.APPROVE_PAYROLL);
export const canExecutePayment = () => {
    // Finance staff specifically needs to execute payment
    const user = getCurrentUser();
    return user?.role === UserRole.FINANCE_STAFF;
};

// Hook for use in components
import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        setUser(getCurrentUser());
    }, []);

    const checkPermission = (permission: Permission) => {
        if (!user) return false;
        const userPermissions = ROLE_PERMISSIONS[user.role] || [];
        return userPermissions.includes(permission);
    };

    return {
        user,
        isAuthenticated: !!user,
        isSpecialist: user?.role === UserRole.PAYROLL_SPECIALIST,
        isManager: user?.role === UserRole.PAYROLL_MANAGER,
        isFinance: user?.role === UserRole.FINANCE_STAFF,
        hasPermission: checkPermission,
        // Expose permission checks as booleans for convenience
        canInitiate: checkPermission(Permission.MANAGE_PAYROLL),
        canCorrect: checkPermission(Permission.MANAGE_PAYROLL),
        canApprove: checkPermission(Permission.APPROVE_PAYROLL),
        canPay: user?.role === UserRole.FINANCE_STAFF
    };
};
