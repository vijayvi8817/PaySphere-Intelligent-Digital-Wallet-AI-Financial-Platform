import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Users, ArrowLeftRight, DollarSign, AlertTriangle,
  Wallet, TrendingUp, UserCheck, Search, ChevronDown, ChevronUp,
  Ban, Eye, ShieldAlert
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/api/admin';
import { getAdminAuditLogs } from '@/api/audit';
import { AuditLog } from '@/types/audit';
import toast from 'react-hot-toast';
import { getPendingKycSubmissions, reviewKycSubmission } from '@/api/kyc';
import { KycDocumentResponse } from '@/types/kyc';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

type Tab = 'overview' | 'users' | 'disputes' | 'kyc' | 'audit';

export function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [userPage, setUserPage] = useState(0);
  const [disputePage, setDisputePage] = useState(0);
  const [kycPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [disputeStatusFilter, setDisputeStatusFilter] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const [kycRejectionReason, setKycRejectionReason] = useState('');
  const [reviewingKycId, setReviewingKycId] = useState<string | null>(null);

  const statsQuery = useQuery({ queryKey: ['admin-stats'], queryFn: adminApi.getStats });
  const stats = statsQuery.data?.data;

  const usersQuery = useQuery({
    queryKey: ['admin-users', userPage, statusFilter, searchTerm],
    queryFn: () => adminApi.getUsers(userPage, 15, statusFilter || undefined, searchTerm || undefined),
    enabled: activeTab === 'users' || activeTab === 'overview',
  });
  const users = usersQuery.data?.data?.content ?? [];

  const disputesQuery = useQuery({
    queryKey: ['admin-disputes', disputePage, disputeStatusFilter],
    queryFn: () => adminApi.getDisputes(disputePage, 15, disputeStatusFilter || undefined),
    enabled: activeTab === 'disputes',
  });
  const disputes = disputesQuery.data?.data?.content ?? [];

  const kycQuery = useQuery({
    queryKey: ['admin-kyc', kycPage],
    queryFn: () => getPendingKycSubmissions(kycPage, 15),
    enabled: activeTab === 'kyc',
  });
  const kycDocs: KycDocumentResponse[] = kycQuery.data?.content ?? [];

  const auditQuery = useQuery({
    queryKey: ['admin-audit'],
    queryFn: () => getAdminAuditLogs(),
    enabled: activeTab === 'audit',
  });
  const auditLogs: AuditLog[] = auditQuery.data ?? [];

  const kycReviewMutation = useMutation({
    mutationFn: ({ kycId, status, reason }: { kycId: string; status: 'APPROVED' | 'REJECTED'; reason?: string }) =>
      reviewKycSubmission(kycId, { status, rejectionReason: reason }),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] }); 
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); 
      setReviewingKycId(null); 
      setKycRejectionReason(''); 
      toast.success('KYC review recorded'); 
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to review KYC'),
  });

  const suspendMutation = useMutation({
    mutationFn: adminApi.suspendUser,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); toast.success('User suspended'); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const activateMutation = useMutation({
    mutationFn: adminApi.activateUser,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); toast.success('User activated'); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.resolveDispute(id, { status, resolutionNote: resolveNote }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-disputes'] }); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); setResolveId(null); setResolveNote(''); toast.success('Dispute updated'); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-primary" /> Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">System overview, user management, disputes, identity verification & SOC audit</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 bg-muted/50 p-1 rounded-lg w-fit flex-wrap">
        {([['overview', 'Overview', TrendingUp], ['users', 'Users', Users], ['disputes', 'Disputes', AlertTriangle], ['kyc', 'KYC Submissions', ShieldCheck], ['audit', 'SOC Security Audit', ShieldAlert]] as [Tab, string, any][]).map(([id, label, Icon]) => (
          <Button key={id} size="sm" variant={activeTab === id ? 'default' : 'ghost'} onClick={() => setActiveTab(id)}
            className={activeTab === id ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg' : ''}>
            <Icon className="h-4 w-4 mr-1.5" />{label}
          </Button>
        ))}
      </motion.div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && stats && (
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-indigo-500', gradient: 'from-indigo-500/10 to-purple-500/10' },
              { label: 'Active Users', value: stats.activeUsers, icon: UserCheck, color: 'text-emerald-500', gradient: 'from-emerald-500/10 to-green-500/10' },
              { label: 'Total Transfers', value: stats.totalTransfers, icon: ArrowLeftRight, color: 'text-blue-500', gradient: 'from-blue-500/10 to-cyan-500/10' },
              { label: 'Open Disputes', value: stats.openDisputes, icon: AlertTriangle, color: 'text-amber-500', gradient: 'from-amber-500/10 to-orange-500/10' },
            ].map((s) => (
              <Card key={s.label} className="relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-50`} />
                <CardContent className="relative p-4">
                  <div className="flex items-center gap-3">
                    <s.icon className={`h-8 w-8 ${s.color}`} />
                    <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Transfer Volume', value: formatCurrency(stats.totalTransferVolume), icon: DollarSign, color: 'text-emerald-500' },
              { label: 'Total Wallet Balance', value: formatCurrency(stats.totalWalletBalance), icon: Wallet, color: 'text-blue-500' },
              { label: 'New Users This Month', value: stats.newUsersThisMonth, icon: TrendingUp, color: 'text-purple-500' },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><s.icon className={`h-5 w-5 ${s.color}`} /></div>
                  <div><p className="text-lg font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or email..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setUserPage(0); }} className="pl-10" />
            </div>
            <div className="flex gap-2">
              {['', 'ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'].map((s) => (
                <Button key={s} size="sm" variant={statusFilter === s ? 'default' : 'outline'} onClick={() => { setStatusFilter(s); setUserPage(0); }} className="text-xs">
                  {s || 'All'}
                </Button>
              ))}
            </div>
          </div>

          {users.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No users found</p></CardContent></Card>
          ) : (
            users.map((user) => (
              <Card key={user.id} className={`border-l-4 ${user.status === 'ACTIVE' ? 'border-l-emerald-500' : user.status === 'SUSPENDED' ? 'border-l-red-500' : 'border-l-amber-500'}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : user.status === 'SUSPENDED' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {user.status}
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:block">{formatDate(user.createdAt)}</span>
                      {expandedUserId === user.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                  {expandedUserId === user.id && (
                    <div className="pt-3 border-t flex gap-2">
                      {user.status !== 'SUSPENDED' ? (
                        <Button size="sm" variant="destructive" onClick={() => suspendMutation.mutate(user.id)} disabled={suspendMutation.isPending}>
                          <Ban className="h-3.5 w-3.5 mr-1" /> Suspend Account
                        </Button>
                      ) : (
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => activateMutation.mutate(user.id)} disabled={activateMutation.isPending}>
                          <UserCheck className="h-3.5 w-3.5 mr-1" /> Activate Account
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      )}

      {/* DISPUTES TAB */}
      {activeTab === 'disputes' && (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex gap-2">
            {['', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'].map((s) => (
              <Button key={s} size="sm" variant={disputeStatusFilter === s ? 'default' : 'outline'} onClick={() => { setDisputeStatusFilter(s); setDisputePage(0); }} className="text-xs">
                {s ? s.replace('_', ' ') : 'All'}
              </Button>
            ))}
          </div>
          {disputes.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><AlertTriangle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No disputes found</p></CardContent></Card>
          ) : (
            disputes.map((d) => (
              <Card key={d.id} className="border-l-4 border-l-amber-500">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{d.reason.replace('_', ' ')} — {d.counterpartyName}</p>
                      <p className="text-xs text-muted-foreground">Ref: {d.transferReferenceId} · {formatCurrency(d.transferAmount)}</p>
                    </div>
                    <Badge variant="outline">{d.status}</Badge>
                  </div>
                  {resolveId === d.id ? (
                    <div className="space-y-2 pt-2 border-t">
                      <Input placeholder="Resolution note..." value={resolveNote} onChange={(e) => setResolveNote(e.target.value)} />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => setResolveId(null)}>Cancel</Button>
                        <Button size="sm" className="bg-emerald-600" onClick={() => resolveMutation.mutate({ id: d.id, status: 'RESOLVED' })} disabled={!resolveNote || resolveMutation.isPending}>Resolve</Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => { setResolveId(d.id); setResolveNote(''); }}>
                      <Eye className="h-3.5 w-3.5 mr-1" /> Review Dispute
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      )}

      {/* KYC TAB */}
      {activeTab === 'kyc' && (
        <motion.div variants={itemVariants} className="space-y-4">
          {kycDocs.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><ShieldCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No pending KYC submissions</p></CardContent></Card>
          ) : (
            kycDocs.map((doc) => (
              <Card key={doc.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{doc.userName} ({doc.userEmail})</p>
                      <p className="text-xs text-muted-foreground">Doc: {doc.documentType} · #{doc.documentNumber}</p>
                    </div>
                    <Badge>{doc.status}</Badge>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white" 
                      onClick={() => kycReviewMutation.mutate({ kycId: doc.id, status: 'APPROVED' })}
                      disabled={kycReviewMutation.isPending}
                    >
                      Approve Identity
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => { setReviewingKycId(doc.id); setKycRejectionReason(''); }}
                    >
                      Reject Submission
                    </Button>
                  </div>

                  {reviewingKycId === doc.id && (
                    <div className="mt-3 p-3 bg-muted/40 rounded-lg border space-y-2">
                      <Input 
                        placeholder="Specify rejection reason..." 
                        value={kycRejectionReason} 
                        onChange={(e) => setKycRejectionReason(e.target.value)} 
                      />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => setReviewingKycId(null)}>Cancel</Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          disabled={!kycRejectionReason || kycReviewMutation.isPending}
                          onClick={() => kycReviewMutation.mutate({ kycId: doc.id, status: 'REJECTED', reason: kycRejectionReason })}
                        >
                          Confirm Rejection
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      )}

      {/* SOC AUDIT TAB */}
      {activeTab === 'audit' && (
        <motion.div variants={itemVariants} className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-500" /> System-Wide Security Audit Stream
              </h3>
              {auditLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No security logs recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 text-xs">
                      <div className="flex items-center gap-3">
                        <Badge variant={log.severity === 'CRITICAL' ? 'destructive' : 'outline'}>
                          {log.severity}
                        </Badge>
                        <span className="font-semibold">{log.userEmail}</span>
                        <span className="text-muted-foreground">[{log.action}]</span>
                        <span className="font-mono text-muted-foreground">{log.details}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground font-mono">
                        <span>{log.ipAddress}</span>
                        <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
