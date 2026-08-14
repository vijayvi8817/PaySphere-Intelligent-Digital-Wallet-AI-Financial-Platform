import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
} from 'lucide-react';
import { exportApi, downloadBlob } from '@/api/export';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { transferApi } from '@/api/transfer';
import type { Transfer } from '@/types/transfer';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type DirectionFilter = '' | 'sent' | 'received';
type StatusFilter = '' | 'COMPLETED' | 'PENDING' | 'FAILED';

export function TransactionsPage() {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<DirectionFilter>('');
  const [status, setStatus] = useState<StatusFilter>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const isSearching = activeSearch.length > 0;

  const transfersQuery = useQuery({
    queryKey: ['transfers', page, direction, status],
    queryFn: () => transferApi.getTransfers(page, 15, direction || undefined, status || undefined),
    enabled: !isSearching,
  });

  const searchQuery = useQuery({
    queryKey: ['transfers-search', activeSearch, page],
    queryFn: () => transferApi.searchTransfers(activeSearch, page, 15),
    enabled: isSearching,
  });

  const summaryQuery = useQuery({
    queryKey: ['transfer-summary'],
    queryFn: () => transferApi.getSummary(),
  });

  const currentQuery = isSearching ? searchQuery : transfersQuery;
  const transfers = currentQuery.data?.data?.content ?? [];
  const totalPages = currentQuery.data?.data?.totalPages ?? 0;
  const totalElements = currentQuery.data?.data?.totalElements ?? 0;
  const summary = summaryQuery.data?.data;

  const handleSearch = () => {
    setPage(0);
    setActiveSearch(searchKeyword.trim());
  };

  const clearSearch = () => {
    setSearchKeyword('');
    setActiveSearch('');
    setPage(0);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const getStatusBadge = (s: string) => {
    const styles: Record<string, string> = {
      COMPLETED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      PROCESSING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      FAILED: 'bg-red-500/10 text-red-500 border-red-500/20',
      CANCELLED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      REVERSED: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[s] ?? styles.PENDING}`}>
        {s}
      </span>
    );
  };

  const summaryCards = [
    { title: 'Total Sent', value: summary?.totalSent ?? 0, icon: ArrowUpRight, color: 'from-rose-500 to-pink-600', prefix: '-' },
    { title: 'Total Received', value: summary?.totalReceived ?? 0, icon: ArrowDownLeft, color: 'from-emerald-500 to-teal-600', prefix: '+' },
    { title: 'Net Flow', value: summary?.netFlow ?? 0, icon: (summary?.netFlow ?? 0) >= 0 ? TrendingUp : TrendingDown, color: 'from-indigo-500 to-violet-600', prefix: '' },
    { title: 'Transfers This Month', value: summary?.totalTransferCount ?? 0, icon: DollarSign, color: 'from-amber-500 to-orange-600', prefix: '', isCurrency: false },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <ArrowLeftRight className="h-7 w-7 text-primary" /> Transactions
          </h1>
          <p className="text-muted-foreground mt-1">Track all your P2P transfers and payments</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={async () => {
            try {
              const blob = await exportApi.downloadTransfers(direction || 'all');
              downloadBlob(blob, `transfers_${direction || 'all'}.csv`);
            } catch {
              // Silently fail
            }
          }}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <motion.div key={card.title} variants={itemVariants}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${card.color} shadow-lg`}>
                  <card.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {card.isCurrency === false ? card.value : formatCurrency(card.value as number)}
                </div>
              </CardContent>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Search */}
              <div className="flex gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by reference or note..."
                    className="pl-10"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button size="icon" variant="outline" onClick={handleSearch}><Search className="h-4 w-4" /></Button>
                {isSearching && (
                  <Button size="sm" variant="ghost" onClick={clearSearch}>Clear</Button>
                )}
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-1 mr-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Direction:</span>
                </div>
                {(['', 'sent', 'received'] as DirectionFilter[]).map((d) => (
                  <Button
                    key={d || 'all'}
                    size="sm"
                    variant={direction === d ? 'default' : 'outline'}
                    onClick={() => { setDirection(d); setPage(0); setActiveSearch(''); }}
                    className="text-xs"
                  >
                    {d === '' ? 'All' : d === 'sent' ? '↑ Sent' : '↓ Received'}
                  </Button>
                ))}
                <span className="text-muted-foreground mx-1">|</span>
                {(['', 'COMPLETED', 'PENDING', 'FAILED'] as StatusFilter[]).map((s) => (
                  <Button
                    key={s || 'all-status'}
                    size="sm"
                    variant={status === s ? 'default' : 'outline'}
                    onClick={() => { setStatus(s); setPage(0); setActiveSearch(''); }}
                    className="text-xs"
                  >
                    {s === '' ? 'All Status' : s}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions List */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {isSearching ? `Search Results (${totalElements})` : `All Transfers (${totalElements})`}
            </CardTitle>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => { transfersQuery.refetch(); searchQuery.refetch(); summaryQuery.refetch(); }}
              className={currentQuery.isFetching ? 'animate-spin' : ''}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {currentQuery.isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-lg p-4 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 rounded bg-muted" />
                      <div className="h-3 w-1/4 rounded bg-muted" />
                    </div>
                    <div className="h-4 w-20 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : transfers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ArrowLeftRight className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No transfers found</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  {isSearching ? 'Try a different search term' : 'Send money to get started!'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {transfers.map((tx: Transfer) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between rounded-xl p-4 transition-all duration-200 hover:bg-muted/50 border border-transparent hover:border-border cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${
                        tx.direction === 'SENT'
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {tx.direction === 'SENT' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {tx.direction === 'SENT' ? `To ${tx.receiverName}` : `From ${tx.senderName}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.direction === 'SENT' ? tx.receiverEmail : tx.senderEmail}
                        </p>
                        {tx.note && <p className="text-xs text-muted-foreground/70 mt-0.5 italic">"{tx.note}"</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(tx.status)}
                      <div className="text-right min-w-[100px]">
                        <p className={`text-sm font-bold ${tx.direction === 'SENT' ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {tx.direction === 'SENT' ? '-' : '+'}{formatCurrency(tx.amount)}
                        </p>
                        {tx.fee > 0 && tx.direction === 'SENT' && (
                          <p className="text-[10px] text-muted-foreground">fee: {formatCurrency(tx.fee)}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground">{formatDate(tx.createdAt)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t pt-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages} · {totalElements} total
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
