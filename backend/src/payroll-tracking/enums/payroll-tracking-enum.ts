export enum ClaimStatus {
  UNDER_REVIEW = 'under review',
  PENDING_MANAGER_APPROVAL = 'pending payroll Manager approval',
  PENDING_FINANCE_APPROVAL = 'pending finance approval',
  APPROVED = 'approved',// when finance approves
  REJECTED = 'rejected'
}
export enum DisputeStatus {
  UNDER_REVIEW = 'under review',
  PENDING_MANAGER_APPROVAL = 'pending payroll Manager approval',
  PENDING_FINANCE_APPROVAL = 'pending finance approval',
  APPROVED = 'approved',// when finance approves
  REJECTED = 'rejected'
}
export enum RefundStatus {
  PENDING = 'pending',
  PAID = 'paid' // when payroll execution
}
