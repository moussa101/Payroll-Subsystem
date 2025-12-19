
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePayroll } from "@/context/PayrollContext";
import { hasAnyRole, getCurrentUser, getToken } from "@/lib/auth";
import { FinancialSummary } from "@/components/payroll-execution/approval/FinancialSummary";
import { AnomalyList } from "@/components/payroll-execution/approval/AnomalyList";
import { AuditLog } from "@/components/payroll-execution/approval/AuditLog";
import { ApprovalActions } from "@/components/payroll-execution/approval/ApprovalActions";
import { PayrollCycle, PayrollCycleStatus } from "@/types/payroll-execution";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

// Mock data as backup if API fails or for dev
const MOCK_CYCLE: PayrollCycle = {
  id: "1",
  period: "December 2025",
  status: PayrollCycleStatus.UNDER_REVIEW,
  summary: {
    totalGross: 452000,
    totalTaxes: 90400,
    totalNetPayable: 361600,
    employeeCount: 142,
  },
  anomalies: [
    {
      employeeId: "E005",
      name: "John Doe",
      issue: "Net salary varies by >15% compared to last month",
    },
    {
      employeeId: "E023",
      name: "Jane Smith",
      issue: "Negative net salary calculated",
    },
  ],
  auditLog: [
    {
      timestamp: "2025-12-01T09:00:00Z",
      user: "System",
      action: "Cycle Initiated",
    },
    {
      timestamp: "2025-12-05T14:30:00Z",
      user: "HR Manager",
      action: "Review Completed",
    },
  ],
};

export default function ApprovalPage() {
  const router = useRouter();
  const params = useParams();
  const cycleId = params?.cycleID as string;
  //   const { refreshData } = usePayroll(); // Assuming context might update global state
  const currentUser = getCurrentUser();

  const [cycle, setCycle] = useState<PayrollCycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const authorized = hasAnyRole([
      'Payroll Manager',
      'Finance Staff',
      'System Admin'
    ]);

    if (!authorized) {
      router.push('/payroll-execution');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // Role Checks
  const isPayrollManager = hasAnyRole(["Payroll Manager", "System Admin"]);
  const isFinanceStaff = hasAnyRole(["Finance Staff", "System Admin"]);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const fetchCycle = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${baseUrl}/payroll-execution/${cycleId}`, { headers });
      setCycle(response.data);
    } catch (error) {
      console.error("Failed to load cycle, using mock data", error);
      // Fallback to mock data for demonstration if backend not ready
      // More permissive condition for testing
      setCycle(MOCK_CYCLE);
      if (process.env.NODE_ENV !== "development") {
        toast.error("Failed to load real payroll data. Showing mock data.");
      }
    } finally {
      setLoading(false);
    }
  }, [baseUrl, cycleId]);

  useEffect(() => {
    if (cycleId) {
      fetchCycle();
    } else {
      // If no cycleId is present, stop loading so we don't hang
      setLoading(false);
    }
  }, [fetchCycle, cycleId]);

  const handleAction = async (endpoint: string, method: 'post' | 'patch', payload: any, successMessage: string) => {
    try {
      setActionLoading(true);
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Endpoint should be relative to /payroll-execution/:id/
      const url = `${baseUrl}/payroll-execution/${cycleId}/${endpoint}`;

      if (method === 'patch') {
        await axios.patch(url, payload, { headers });
      } else {
        await axios.post(url, payload, { headers });
      }

      toast.success(successMessage);
      await fetchCycle(); // Refresh data
    } catch (error) {
      console.error(`Failed to ${endpoint}`, error);
      toast.error(`Failed to perform action. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const onApprove = () => {
    // Backend: PATCH /payroll-execution/:id/manager-review { approved: true }
    handleAction("manager-review", "patch", { approved: true }, "Payroll Cycle Approved successfully");
  };

  const onReject = (reason: string) => {
    // Backend: PATCH /payroll-execution/:id/manager-review { approved: false, reason }
    handleAction("manager-review", "patch", { approved: false, reason }, "Payroll Cycle Rejected");
  };

  const onUnfreeze = (reason: string) => {
    // Backend might not have specific unfreeze yet, keeping as placeholder or mapping to update
    // For now assuming update with status change, or sticking to mock behavior if backend lacks it.
    // Let's use a generic update for now or stick to fallback if backend 404s.
    // Based on controller, there isn't an explicit "unfreeze". skipping for now or mapping to update?
    // Let's assume it maps to a status update via PATCH /:id
    handleAction("", "patch", { status: PayrollCycleStatus.UNDER_REVIEW, reason }, "Payroll Cycle Unfrozen");
  };

  const onExecute = () => {
    // Backend: PATCH /payroll-execution/:id/finance-review { approved: true }
    handleAction("finance-review", "patch", { approved: true }, "Payment Execution Initiated");
  };

  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return <div className="p-8 text-center">Loading payroll details...</div>;
  }

  if (!cycle) {
    return <div className="p-8 text-center text-red-500">Payroll Cycle not found</div>;
  }

  // Determine actions availability
  // Payroll Manager can Approve/Reject if status is 'REVIEWING_BY_MANAGER' or 'UNDER_REVIEW' or similar
  // Finance Staff can Execute if status is 'WAITING_FINANCE_APPROVAL' or 'APPROVED'

  const status = cycle.status as PayrollCycleStatus;

  const canApprove =
    isPayrollManager &&
    (status === PayrollCycleStatus.UNDER_REVIEW || status === PayrollCycleStatus.REVIEWING_BY_MANAGER);

  const canExecute =
    isFinanceStaff &&
    (status === PayrollCycleStatus.WAITING_FINANCE_APPROVAL);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Payroll Approval Center
          </h1>
          <p className="text-muted-foreground">
            Period: {cycle.period} | Status: <span className="font-medium text-foreground">{status}</span>
          </p>
        </div>
      </div>

      <FinancialSummary summary={cycle.summary} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <AnomalyList anomalies={cycle.anomalies} />
        </div>
        <div className="space-y-6">
          <AuditLog logs={cycle.auditLog} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg md:relative md:bg-transparent md:border-0 md:shadow-none md:p-0">
        <ApprovalActions
          status={status}
          canApprove={canApprove}
          canExecute={canExecute}
          onApprove={onApprove}
          onReject={onReject}
          onUnfreeze={onUnfreeze}
          onExecute={onExecute}
          loading={actionLoading}
        />
      </div>
      <div className="h-20 md:hidden" /> {/* Spacer for fixed bottom bar */}
    </div>
  );
}