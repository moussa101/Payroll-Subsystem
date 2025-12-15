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
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000",
  timeout: 10000,
});

export async function getClaims(): Promise<ClaimRecord[]> {
  try {
    const res = await api.get("/claims");
    const items: ClaimApi[] = Array.isArray(res.data) ? res.data : [];
    return items.map((claim: ClaimApi): ClaimRecord => ({
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
    }));
  } catch (error) {
    console.error("Failed to fetch claims", error);
    throw error;
  }
}

export async function getDisputes(): Promise<DisputeRecord[]> {
  try {
    const res = await api.get("/disputes");
    const items: DisputeApi[] = Array.isArray(res.data) ? res.data : [];
    return items.map((dispute: DisputeApi): DisputeRecord => ({
      disputeId: dispute.disputeId ?? dispute._id ?? "N/A",
      description: dispute.description ?? "",
      employee: refToLabel(dispute.employeeId) ?? "Unknown employee",
      payslipId: dispute.payslipId ?? "Not linked",
      status: dispute.status ?? "under review",
      payrollOwner: refToLabel(dispute.payrollSpecialistId) ?? "Unassigned",
      updatedOn: dispute.updatedAt
        ? new Date(dispute.updatedAt).toISOString().split("T")[0]
        : "—",
    }));
  } catch (error) {
    console.error("Failed to fetch disputes", error);
    throw error;
  }
}

export async function getRefunds(): Promise<RefundRecord[]> {
  try {
    const res = await api.get("/refunds");
    const items: RefundApi[] = Array.isArray(res.data) ? res.data : [];
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
    throw error;
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
