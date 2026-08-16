import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { disputeApi } from '@/api/dispute';
import { transferApi } from '@/api/transfer';
import type { DisputeReason } from '@/types/dispute';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const defaultStatusConfig = { color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock, label: 'Open' };

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  OPEN: defaultStatusConfig,
  UNDER_REVIEW: { color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20', icon: Search, label: 'Under Review' },
  RESOLVED: { color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2, label: 'Resolved' },
  REJECTED: { color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle, label: 'Rejected' },
};

const getStatusConfig = (status: string) => statusConfig[status] ?? defaultStatusConfig;

const reasonLabels: Record<DisputeReason, string> = {
  UNAUTHORIZED: 'Unauthorized Transaction',
  WRONG_AMOUNT: 'Wrong Amount',
  NOT_RECEIVED: 'Not Received',
  DUPLICATE: 'Duplicate Transaction',
  FRAUD: 'Suspected Fraud',
  OTHER: 'Other',
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export function DisputesPage() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  // Form state
  const [transferRef, setTransferRef] = useState('');
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [foundTransferId, setFoundTransferId] = useState<string | null>(null);
  const [searchedTransfer, setSearchedTransfer] = useState<{
    id: string;
    referenceId: string;
    amount: number;
    receiverName: string;
    createdAt: string;
  } | null>(null);

  const disputesQuery = useQuery({
    queryKey: ['disputes', page],
    queryFn: () => disputeApi.getAll(page, 10),
  });

  const disputes = disputesQuery.data?.data?.content ?? [];
  const totalPages = disputesQuery.data?.data?.totalPages ?? 0;
  const totalElements = disputesQuery.data?.data?.totalElements ?? 0;

  // Stats
  const openCount = disputes.filter((d) => d.status === 'OPEN').length;
  const reviewCount = disputes.filter((d) => d.status === 'UNDER_REVIEW').length;
  const resolvedCount = disputes.filter((d) => d.status === 'RESOLVED').length;

  // Search for transfer to dispute
  const searchTransferMutation = useMutation({
    mutationFn: async (keyword: string) => {
      const res = await transferApi.searchTransfers(keyword, 0, 1);
      return res.data?.content?.[0] ?? null;
    },
    onSuccess: (transfer) => {
      if (transfer) {
        setFoundTransferId(transfer.id);
        setSearchedTransfer({
          id: transfer.id,
          referenceId: transfer.referenceId,
          amount: transfer.amount,
          receiverName: transfer.receiverName,
          createdAt: transfer.createdAt,
        });
        toast.success('Transfer found');
      } else {
        setFoundTransferId(null);
        setSearchedTransfer(null);
        toast.error('No transfer found with that reference');
      }
    },
    onError: () => toast.error('Failed to search transfers'),
  });

  const createDisputeMutation = useMutation({
    mutationFn: disputeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      toast.success('Dispute filed successfully');
      setShowCreateForm(false);
      setTransferRef('');
      setReason('');
      setDescription('');
      setFoundTransferId(null);
      setSearchedTransfer(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Failed to file dispute');
    },
  });

  const handleCreateDispute = () => {
    if (!foundTransferId || !reason || !description || description.length < 10) {
      toast.error('Please fill in all required fields (description must be at least 10 characters)');
      return;
    }
    createDisputeMutation.mutate({
      transferId: foundTransferId,
      reason,
      description,
    });
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" /> Transaction Disputes
          </h1>
          <p className="text-muted-foreground mt-1">File and track disputes for your transfers</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" /> File Dispute
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: totalElements, icon: FileWarning, color: 'text-primary', gradient: 'from-indigo-500/10 to-purple-500/10' },
          { label: 'Open', value: openCount, icon: Clock, color: 'text-amber-500', gradient: 'from-amber-500/10 to-orange-500/10' },
          { label: 'Under Review', value: reviewCount, icon: Search, color: 'text-blue-500', gradient: 'from-blue-500/10 to-cyan-500/10' },
          { label: 'Resolved', value: resolvedCount, icon: CheckCircle2, color: 'text-emerald-500', gradient: 'from-emerald-500/10 to-green-500/10' },
        ].map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
            <CardContent className="relative p-4">
              <div className="flex items-center gap-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Create Dispute Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <motion.div variants={itemVariants}>
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" /> File a New Dispute
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Find Transfer */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Search className="h-4 w-4" /> Transfer Reference ID
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter transfer reference ID..."
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        onClick={() => searchTransferMutation.mutate(transferRef)}
                        disabled={!transferRef || searchTransferMutation.isPending}
                      >
                        {searchTransferMutation.isPending ? 'Searching...' : 'Find'}
                      </Button>
                    </div>
                  </div>

                  {/* Found Transfer Preview */}
                  {searchedTransfer && (
                    <div className="rounded-lg bg-muted/50 p-4 border space-y-2">
                      <p className="text-sm font-medium">Transfer Found</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Reference: </span>
                          <span className="font-mono text-xs">{searchedTransfer.referenceId}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount: </span>
                          <span className="font-bold">{formatCurrency(searchedTransfer.amount)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">To: </span>
                          <span>{searchedTransfer.receiverName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date: </span>
                          <span>{formatDate(searchedTransfer.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reason */}
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <div className="flex flex-wrap gap-2">
                      {(Object.entries(reasonLabels) as [DisputeReason, string][]).map(([key, label]) => (
                        <Button
                          key={key}
                          size="sm"
                          variant={reason === key ? 'default' : 'outline'}
                          onClick={() => setReason(reason === key ? '' : key)}
                          className="text-xs"
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> Description
                    </Label>
                    <textarea
                      className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Describe the issue in detail (min 10 characters)..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">{description.length}/2000 characters</p>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateDispute}
                      disabled={!foundTransferId || !reason || description.length < 10 || createDisputeMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
                    >
                      {createDisputeMutation.isPending ? 'Filing...' : 'Submit Dispute'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disputes List */}
      <motion.div variants={itemVariants} className="space-y-3">
        {disputesQuery.isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-muted-foreground">Loading disputes...</p>
            </CardContent>
          </Card>
        ) : disputes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">No Disputes</h3>
              <p className="text-muted-foreground mt-1">You haven't filed any disputes yet</p>
            </CardContent>
          </Card>
        ) : (
          disputes.map((dispute) => {
            const sc = getStatusConfig(dispute.status);
            const StatusIcon = sc.icon;
            const isExpanded = expandedId === dispute.id;

            return (
              <motion.div
                key={dispute.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-md border-l-4 ${
                    dispute.status === 'OPEN'
                      ? 'border-l-amber-500'
                      : dispute.status === 'UNDER_REVIEW'
                      ? 'border-l-blue-500'
                      : dispute.status === 'RESOLVED'
                      ? 'border-l-emerald-500'
                      : 'border-l-red-500'
                  }`}
                  onClick={() => setExpandedId(isExpanded ? null : dispute.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full ${sc.bg} border flex items-center justify-center`}>
                          <StatusIcon className={`h-5 w-5 ${sc.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{reasonLabels[dispute.reason] || dispute.reason}</p>
                          <p className="text-xs text-muted-foreground">
                            {dispute.counterpartyName} · {formatCurrency(dispute.transferAmount)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} border ${sc.color}`}>
                          {sc.label}
                        </div>
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {formatDate(dispute.createdAt)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">Reference ID</p>
                                <p className="font-mono text-xs">{dispute.transferReferenceId}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Transfer Amount</p>
                                <p className="font-bold">{formatCurrency(dispute.transferAmount)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Counterparty</p>
                                <p>{dispute.counterpartyName}</p>
                                <p className="text-xs text-muted-foreground">{dispute.counterpartyEmail}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Filed On</p>
                                <p>{formatDate(dispute.createdAt)}</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Description</p>
                              <p className="text-sm bg-muted/50 rounded-lg p-3 border">{dispute.description}</p>
                            </div>

                            {dispute.resolutionNote && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Resolution Note</p>
                                <p className="text-sm bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/20">
                                  {dispute.resolutionNote}
                                </p>
                              </div>
                            )}

                            {dispute.resolvedAt && (
                              <p className="text-xs text-muted-foreground">
                                Resolved on: {formatDate(dispute.resolvedAt)}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={itemVariants} className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground flex items-center px-3">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
