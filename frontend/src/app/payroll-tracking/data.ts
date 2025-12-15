export type ClaimRecord = {
  claimId: string;
  claimType: string;
  description: string;
  employee: string;
  amount: number;
  approvedAmount?: number;
  status: string;
  financeOwner?: string;
  updatedOn: string;
};

export type DisputeRecord = {
  disputeId: string;
  description: string;
  employee: string;
  payslipId: string;
  status: string;
  payrollOwner?: string;
  updatedOn: string;
};

export type RefundRecord = {
  refundId: string;
  reference: string;
  referenceType: "Claim" | "Dispute";
  reason: string;
  amount: number;
  status: string;
  payrollRun?: string;
  updatedOn: string;
};
