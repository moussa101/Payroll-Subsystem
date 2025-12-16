"use client";

import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

// 1. Data & Types
import { MOCK_CYCLE } from '@/lib/mock-payroll';
import { UserRole } from '@/types/payroll-execution';

// 2. Custom Components
import { AuditLog } from '@/components/payroll-execution/AuditLog';
import { RiskAssessment } from '@/components/payroll-execution/RiskAssessment';

// 3. Shadcn UI Components
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ApprovalCenter() {
  // --- STATE ---
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('PAYROLL_MANAGER');
  const [cycle, setCycle] = useState(MOCK_CYCLE);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- MODAL STATE ---
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isUnfreezeModalOpen, setIsUnfreezeModalOpen] = useState(false);
  const [justification, setJustification] = useState('');

  // --- HELPER: Simulate Network Request ---
  const performAction = (action: () => void) => {
    setIsLoading(true);
    setTimeout(() => {
      action();
      setIsLoading(false);
    }, 1500); 
  };

  // --- HANDLERS ---
  const handleApprove = () => {
    performAction(() => {
      if (currentUserRole === 'PAYROLL_MANAGER') {
        // Manager sends to Finance [cite: 268]
        setCycle({ ...cycle, status: 'WAITING_FINANCE_APPROVAL' });
      } else if (currentUserRole === 'FINANCE_STAFF') {
     
        setCycle({ ...cycle, status: 'PAID' });
      }
    });
  };

  const handleReject = () => {
    if (!justification.trim()) return;
    performAction(() => {
      const newLog = {
        action: 'REJECTED',
        user: currentUserRole,
        timestamp: new Date().toLocaleString(),
        reason: justification
      };
      
 
      setCycle({ ...cycle, status: 'REJECTED', auditLog: [...cycle.auditLog, newLog] });
      
      setIsRejectModalOpen(false);
      setJustification('');
    });
  };

  const handleUnfreeze = () => {
    if (!justification.trim()) return;
    performAction(() => {
      const newLog = {
        action: 'UNFROZEN',
        user: currentUserRole,
        timestamp: new Date().toLocaleString(),
        reason: justification
      };
      
      
      setCycle({ ...cycle, status: 'REVIEWING_BY_MANAGER', auditLog: [...cycle.auditLog, newLog] });
      
      setIsUnfreezeModalOpen(false);
      setJustification('');
    });
  };

  // Helper to determine Badge color
  // We strictly tell TypeScript this returns one of the allowed Badge variants
  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    if (status === 'PAID') return 'default'; 
    if (status === 'REJECTED') return 'destructive'; 
    return 'secondary'; 
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        
        {/* --- DEV TOOLS (Delete before production) --- */}
        <div className="bg-white p-3 rounded-lg border shadow-sm flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Simulate Role:</span>
            <Button 
              variant={currentUserRole === 'PAYROLL_MANAGER' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setCurrentUserRole('PAYROLL_MANAGER')}
            >
              Manager
            </Button>
            <Button 
              variant={currentUserRole === 'FINANCE_STAFF' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setCurrentUserRole('FINANCE_STAFF')}
            >
              Finance
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm">
             Current Status: 
             <Badge variant={getStatusBadgeVariant(cycle.status)}>
               {cycle.status.replace(/_/g, " ")}
             </Badge>
          </div>
        </div>

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Payroll Approval Center</h1>
            <p className="text-muted-foreground mt-1">Reviewing Period: <span className="font-semibold text-foreground">{cycle.period}</span></p>
          </div>
          
          <div className="flex gap-3">
            {/* Logic to show buttons based on Role & Status */}
            {((currentUserRole === 'PAYROLL_MANAGER' && cycle.status === 'REVIEWING_BY_MANAGER') || 
              (currentUserRole === 'FINANCE_STAFF' && cycle.status === 'WAITING_FINANCE_APPROVAL')) && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={isLoading}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Cycle
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  {currentUserRole === 'FINANCE_STAFF' ? 'Execute Payment' : 'Approve Payroll'}
                </Button>
              </>
            )}
             
             [cite_start]{/* Unfreeze Button for Manager [cite: 272] */}
             {currentUserRole === 'PAYROLL_MANAGER' && cycle.status === 'PAID' && (
               <Button 
                variant="secondary"
                onClick={() => setIsUnfreezeModalOpen(true)}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Unfreeze Cycle
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* --- MAIN GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Summary & Risks */}
          <div className="lg:col-span-2 space-y-6">
            
            [cite_start]{/* Financial Cards [cite: 266] */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Gross</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${cycle.summary.totalGross.toLocaleString()}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Taxes & Deductions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">-${cycle.summary.totalTaxes.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="bg-emerald-50/50 border-emerald-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-800">Net Payable</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-700">${cycle.summary.totalNetPayable.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            [cite_start]{/* Risk Assessment Component [cite: 264] */}
            <RiskAssessment anomalies={cycle.anomalies} />
          </div>

          [cite_start]{/* RIGHT COLUMN: Audit Log [cite: 275] */}
          <div className="lg:col-span-1">
            <AuditLog logs={cycle.auditLog} />
          </div>
        </div>

        {/* --- DIALOGS (MODALS) --- */}
        
        {/* Reject Dialog */}
        <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Payroll Cycle</DialogTitle>
              <DialogDescription>
                This action will return the payroll to the Draft stage. A justification is mandatory for the audit log.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea 
                placeholder="Enter rejection reason..." 
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={justification.length < 5 || isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Unfreeze Dialog */}
        <Dialog open={isUnfreezeModalOpen} onOpenChange={setIsUnfreezeModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unfreeze Payroll Cycle</DialogTitle>
              <DialogDescription>
                Unfreezing a Paid cycle is a critical action. Please provide a detailed justification.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea 
                placeholder="Enter justification..." 
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUnfreezeModalOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleUnfreeze}
                disabled={justification.length < 5 || isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Unfreeze
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}