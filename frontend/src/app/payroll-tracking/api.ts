import axios from "axios";
import type {
  ClaimRecord,
  DisputeRecord,
  RefundRecord,
} from "./data";

type RefShape = {
  _id?: string;
  name?: string;
  fullName?: string;
  firstName?: string;
  claimId?: string;
  disputeId?: string;
  runId?: string;
};

type Ref = string | RefShape | undefined;

type ClaimApi = {
  _id?: string;
  claimId?: string;
  claimType?: string;
  description?: string;
  employeeId?: Ref;
  financeStaffId?: Ref;
  amount?: number;
  approvedAmount?: number;
  status?: string;
  updatedAt?: string;
  statusHistory?: { status?: string; at?: string; note?: string }[];
};

type DisputeApi = {
  _id?: string;
  disputeId?: string;
  description?: string;
  employeeId?: Ref;
  payrollSpecialistId?: Ref;
  payslipId?: string;
  status?: string;
  updatedAt?: string;
  statusHistory?: { status?: string; at?: string; note?: string }[];
};

type RefundApi = {
  _id?: string;
  refundId?: string;
  claimId?: Ref;
  disputeId?: Ref;
  refundDetails?: {
    description?: string;
    amount?: number;
  };
  amount?: number;
  status?: string;
  paidInPayrollRunId?: Ref;
  updatedAt?: string;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000",
  timeout: 10000,
});

// Helper to handle 404s gracefully
async function fetchWithFallback<T>(endpoint: string, fallback: T): Promise<any> {
  try {
    const res = await api.get(endpoint);
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.warn(`Endpoint ${endpoint} not found (404). Returning empty fallback.`);
      return fallback;
    }
    throw error;
  }
}

export async function getClaims(): Promise<ClaimRecord[]> {
  try {
    const data = await fetchWithFallback("/claims", []);
    const items: ClaimApi[] = Array.isArray(data) ? data : [];
    return items.map((claim: ClaimApi): ClaimRecord => ({
      id: claim._id ?? claim.claimId ?? "N/A",
      claimId: claim.claimId ?? claim._id ?? "N/A",
      claimType: claim.claimType ?? "General",
      description: claim.description ?? "",
      employee: refToLabel(claim.employeeId) ?? "Unknown employee",
      amount: Number(claim.amount) || 0,
      approvedAmount:
        claim.approvedAmount !== undefined ? Number(claim.approvedAmount) : undefined,
      status: claim.status ?? "under review",
      financeOwner: refToLabel(claim.financeStaffId) ?? "Unassigned",
      updatedOn: claim.updatedAt
        ? new Date(claim.updatedAt).toISOString().split("T")[0]
        : "—",
      statusHistory: (claim.statusHistory ?? []).map((h) => ({
        status: h.status ?? "unknown",
        at: h.at ? new Date(h.at).toISOString() : "",
        note: h.note,
      })),
    }));
  } catch (error) {
    console.error("Failed to fetch claims", error);
    return [];
  }
}

export async function getDisputes(): Promise<DisputeRecord[]> {
  try {
    const data = await fetchWithFallback("/disputes", []);
    const items: DisputeApi[] = Array.isArray(data) ? data : [];
    return items.map((dispute: DisputeApi): DisputeRecord => ({
      id: dispute._id ?? dispute.disputeId ?? "N/A",
      disputeId: dispute.disputeId ?? dispute._id ?? "N/A",
      description: dispute.description ?? "",
      employee: refToLabel(dispute.employeeId) ?? "Unknown employee",
      payslipId: dispute.payslipId ?? "Not linked",
      status: dispute.status ?? "under review",
      payrollOwner: refToLabel(dispute.payrollSpecialistId) ?? "Unassigned",
      updatedOn: dispute.updatedAt
        ? new Date(dispute.updatedAt).toISOString().split("T")[0]
        : "—",
      statusHistory: (dispute.statusHistory ?? []).map((h) => ({
        status: h.status ?? "unknown",
        at: h.at ? new Date(h.at).toISOString() : "",
        note: h.note,
      })),
    }));
  } catch (error) {
    console.error("Failed to fetch disputes", error);
    return [];
  }
}

export async function approveClaim(id: string, approvedAmount?: number, resolutionComment?: string) {
  await api.post(`/claims/${id}/approve`, { approvedAmount, resolutionComment });
}

export async function rejectClaim(id: string, rejectionReason?: string) {
  await api.post(`/claims/${id}/reject`, { rejectionReason });
}

export async function approveDispute(id: string, refundAmount?: number, resolutionComment?: string) {
  await api.post(`/disputes/${id}/approve`, { refundAmount, resolutionComment });
}

export async function rejectDispute(id: string, rejectionReason?: string) {
  await api.post(`/disputes/${id}/reject`, { rejectionReason });
}

export async function getRefunds(): Promise<RefundRecord[]> {
  try {
    const data = await fetchWithFallback("/refunds", []);
    const items: RefundApi[] = Array.isArray(data) ? data : [];
    return items.map((refund: RefundApi): RefundRecord => {
      const hasClaim = Boolean(refund.claimId);
      const hasDispute = Boolean(refund.disputeId);
      return {
        refundId: refund.refundId ?? refund._id ?? "N/A",
        reference: hasClaim
          ? refToLabel(refund.claimId, "claimId") ?? "Claim"
          : hasDispute
            ? refToLabel(refund.disputeId, "disputeId") ?? "Dispute"
            : "Unlinked",
        referenceType: hasClaim ? "Claim" : "Dispute",
        reason: refund.refundDetails?.description ?? "Refund",
        amount: Number(refund.refundDetails?.amount ?? refund.amount ?? 0),
        status: refund.status ?? "pending",
        payrollRun: refToLabel(refund.paidInPayrollRunId, "runId") ?? "Unscheduled",
        updatedOn: refund.updatedAt
          ? new Date(refund.updatedAt).toISOString().split("T")[0]
          : "—",
      };
    });
  } catch (error) {
    console.error("Failed to fetch refunds", error);
    return [];
  }
}

export function getApiBaseUrl() {
  return api.defaults.baseURL;
}

function refToLabel(ref: Ref, idKey?: keyof RefShape): string | undefined {
  if (!ref) return undefined;
  if (typeof ref === "string") return ref;
  if (idKey && ref[idKey]) return String(ref[idKey]);
  return (
    ref.name ??
    ref.fullName ??
    ref.firstName ??
    ref._id ??
    (idKey ? (ref[idKey] as string | undefined) : undefined)
  );
}
