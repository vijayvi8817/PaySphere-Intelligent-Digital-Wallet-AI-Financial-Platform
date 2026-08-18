import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard as CardIcon,
  Plus,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Globe,
  ShoppingCart,
  DollarSign,
  Key,
  RotateCw,
  SlidersHorizontal,
  Wifi,
} from 'lucide-react';
import { getUserCards, issueCard, toggleFreezeCard, updateCardLimits, toggleCardSettings, revealCardDetails, updateCardPin } from '@/api/card';
import { VirtualCard, CardType, CardNetwork, CardSensitiveDetails } from '@/types/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const CARD_GRADIENTS = [
  'from-slate-900 via-gray-900 to-zinc-900 border-slate-700', // Obsidian Black
  'from-violet-950 via-purple-900 to-indigo-950 border-purple-700', // Deep Violet
  'from-emerald-950 via-teal-900 to-cyan-950 border-emerald-700', // Emerald Metallic
  'from-amber-950 via-yellow-900 to-orange-950 border-amber-700', // Royal Gold
];

export function VirtualCardsPage() {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [revealedDetails, setRevealedDetails] = useState<CardSensitiveDetails | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  // Modals
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isLimitsOpen, setIsLimitsOpen] = useState(false);
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Issue Card form state
  const [cardholderName, setCardholderName] = useState('');
  const [cardType, setCardType] = useState<CardType>('VIRTUAL');
  const [cardNetwork, setCardNetwork] = useState<CardNetwork>('VISA');
  const [dailyLimit, setDailyLimit] = useState('1000');
  const [monthlyLimit, setMonthlyLimit] = useState('5000');
  const [pin, setPin] = useState('1234');

  // Limit update form state
  const [newDailyLimit, setNewDailyLimit] = useState('');
  const [newMonthlyLimit, setNewMonthlyLimit] = useState('');

  // Pin update state
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const data = await getUserCards();
      setCards(data);
      setSelectedCard(data[0] ?? null);
    } catch (err) {
      console.error('Failed to load cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardholderName) return;
    try {
      setSubmitting(true);
      const newCard = await issueCard({
        cardholderName,
        cardType,
        cardNetwork,
        dailyLimit: parseFloat(dailyLimit),
        monthlyLimit: parseFloat(monthlyLimit),
        pin,
      });
      setIsIssueOpen(false);
      resetIssueForm();
      await fetchCards();
      setSelectedCard(newCard);
    } catch (err) {
      console.error('Failed to issue card:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetIssueForm = () => {
    setCardholderName('');
    setCardType('VIRTUAL');
    setCardNetwork('VISA');
    setDailyLimit('1000');
    setMonthlyLimit('5000');
    setPin('1234');
  };

  const handleToggleFreeze = async () => {
    if (!selectedCard) return;
    try {
      const updated = await toggleFreezeCard(selectedCard.id);
      setSelectedCard(updated);
      updateCardInState(updated);
    } catch (err) {
      console.error('Failed to freeze card:', err);
    }
  };

  const handleToggleSetting = async (key: 'onlinePaymentsEnabled' | 'internationalPaymentsEnabled' | 'atmWithdrawalsEnabled') => {
    if (!selectedCard) return;
    try {
      const currentVal = selectedCard[key];
      const updated = await toggleCardSettings(selectedCard.id, { [key]: !currentVal });
      setSelectedCard(updated);
      updateCardInState(updated);
    } catch (err) {
      console.error('Failed to update setting:', err);
    }
  };

  const handleReveal = async () => {
    if (!selectedCard) return;
    if (revealedDetails) {
      setRevealedDetails(null);
      return;
    }
    try {
      setIsRevealing(true);
      const details = await revealCardDetails(selectedCard.id);
      setRevealedDetails(details);
    } catch (err) {
      console.error('Failed to reveal details:', err);
    } finally {
      setIsRevealing(false);
    }
  };

  const handleUpdateLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard || !newDailyLimit || !newMonthlyLimit) return;
    try {
      setSubmitting(true);
      const updated = await updateCardLimits(selectedCard.id, parseFloat(newDailyLimit), parseFloat(newMonthlyLimit));
      setSelectedCard(updated);
      updateCardInState(updated);
      setIsLimitsOpen(false);
    } catch (err) {
      console.error('Failed to update limits:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard || !newPin) return;
    try {
      setSubmitting(true);
      const updated = await updateCardPin(selectedCard.id, newPin);
      setSelectedCard(updated);
      updateCardInState(updated);
      setIsPinOpen(false);
      setNewPin('');
    } catch (err) {
      console.error('Failed to update pin:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const updateCardInState = (updatedCard: VirtualCard) => {
    setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Virtual & Physical Card Management</h1>
          <p className="text-muted-foreground mt-1">
            Issue instant virtual payment cards, set spend controls, and freeze cards in real-time.
          </p>
        </div>

        <Dialog open={isIssueOpen} onOpenChange={setIsIssueOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500">
              <Plus className="h-4 w-4" /> Issue New Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CardIcon className="h-5 w-5 text-blue-500" /> Issue Payment Card
              </DialogTitle>
              <DialogDescription>
                Create a virtual card for safe online shopping or request a physical card.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleIssueCard} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Cardholder Name</Label>
                <Input placeholder="e.g. ALEX JOHNSON" value={cardholderName} onChange={(e) => setCardholderName(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Card Type</Label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value as CardType)}
                  >
                    <option value="VIRTUAL">Virtual Card</option>
                    <option value="PHYSICAL">Physical Card</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Network</Label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={cardNetwork}
                    onChange={(e) => setCardNetwork(e.target.value as CardNetwork)}
                  >
                    <option value="VISA">Visa</option>
                    <option value="MASTERCARD">Mastercard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Daily Limit ($)</Label>
                  <Input type="number" value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Limit ($)</Label>
                  <Input type="number" value={monthlyLimit} onChange={(e) => setMonthlyLimit(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Default 4-Digit Security PIN</Label>
                <Input type="password" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)} required />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsIssueOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-blue-600 text-white hover:bg-blue-500">
                  {submitting ? 'Issuing...' : 'Issue Card'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading payment cards...</div>
      ) : cards.length === 0 ? (
        <Card className="p-12 text-center">
          <CardIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No Cards Issued Yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto mb-6">
            Issue your first virtual debit card to start shopping online securely with full spend control.
          </p>
          <Button onClick={() => setIsIssueOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white">
            <Plus className="h-4 w-4 mr-2" /> Issue First Card
          </Button>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Interactive 3D Card Display & Card Selector */}
          <div className="lg:col-span-5 space-y-6">
            {selectedCard && (
              <div className="perspective-1000">
                {/* Metallic Credit Card Component */}
                <motion.div
                  className={`relative h-56 w-full rounded-2xl border p-6 text-white shadow-2xl transition-transform bg-gradient-to-br ${
                    CARD_GRADIENTS[cards.indexOf(selectedCard) % CARD_GRADIENTS.length]
                  }`}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front Side */}
                  <div className={`absolute inset-0 p-6 flex flex-col justify-between ${isFlipped ? 'hidden' : 'flex'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-white/30 text-white font-mono text-xs uppercase tracking-wider">
                          {selectedCard.cardType}
                        </Badge>
                        {selectedCard.isFrozen && (
                          <Badge variant="destructive" className="bg-red-500/80 text-white">FROZEN</Badge>
                        )}
                      </div>
                      <Wifi className="h-6 w-6 text-white/80 rotate-90" />
                    </div>

                    {/* Chip & Masked Number */}
                    <div className="space-y-4">
                      <div className="h-9 w-12 rounded-md bg-amber-400/80 border border-amber-300 flex items-center justify-center">
                        <div className="h-6 w-8 border-t border-b border-amber-600/50" />
                      </div>

                      <div className="text-xl tracking-widest font-mono font-bold drop-shadow-md">
                        {revealedDetails
                          ? revealedDetails.fullCardNumber.replace(/(.{4})/g, '$1 ').trim()
                          : selectedCard.cardNumberMasked}
                      </div>
                    </div>

                    {/* Bottom: Cardholder Name & Expiry & Network */}
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[10px] text-white/60 uppercase font-mono">Cardholder</div>
                        <div className="text-sm font-semibold tracking-wider">{selectedCard.cardholderName}</div>
                      </div>

                      <div>
                        <div className="text-[10px] text-white/60 uppercase font-mono">Expires</div>
                        <div className="text-sm font-semibold font-mono">
                          {String(selectedCard.expiryMonth).padStart(2, '0')}/{String(selectedCard.expiryYear).slice(-2)}
                        </div>
                      </div>

                      <div className="text-right font-black italic text-lg tracking-tight">
                        {selectedCard.cardNetwork}
                      </div>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className={`absolute inset-0 p-6 flex flex-col justify-between ${isFlipped ? 'flex' : 'hidden'}`} style={{ transform: 'rotateY(180deg)' }}>
                    <div className="h-10 w-full bg-black/80 -mx-6 mt-2" />

                    <div className="space-y-2">
                      <div className="flex justify-end text-xs text-white/80 font-mono">CVV / CVC</div>
                      <div className="h-10 w-full bg-white text-black font-mono font-bold flex items-center justify-end px-4 rounded">
                        {revealedDetails ? revealedDetails.cvv : '***'}
                      </div>
                    </div>

                    <div className="text-[10px] text-white/50 leading-tight">
                      This card is property of Pay-Sphere Financial Inc. Use subject to account terms. If lost or stolen, freeze immediately via app.
                    </div>
                  </div>
                </motion.div>

                {/* Flip & Credential Reveal Controls */}
                <div className="flex justify-center gap-3 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setIsFlipped(!isFlipped)}>
                    <RotateCw className="h-4 w-4 mr-2" /> {isFlipped ? 'Show Front' : 'Flip to Back (CVV)'}
                  </Button>

                  <Button variant="secondary" size="sm" onClick={handleReveal} disabled={isRevealing || selectedCard?.isFrozen}>
                    {revealedDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {revealedDetails ? 'Hide Credentials' : 'Reveal Full Details'}
                  </Button>
                </div>
              </div>
            )}

            {/* Cards Selector Drawer */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Your Cards ({cards.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => {
                      setSelectedCard(card);
                      setRevealedDetails(null);
                      setIsFlipped(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedCard?.id === card.id ? 'border-blue-500 bg-blue-500/10' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CardIcon className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">{card.cardholderName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{card.cardNumberMasked}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={card.isFrozen ? 'destructive' : 'outline'}>
                        {card.isFrozen ? 'Frozen' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Card Controls & Limits */}
          {selectedCard && (
            <div className="lg:col-span-7 space-y-6">
              {/* Card Controls Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Card Security & Quick Controls</span>
                    <Button
                      variant={selectedCard.isFrozen ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={handleToggleFreeze}
                      className="gap-2"
                    >
                      {selectedCard.isFrozen ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      {selectedCard.isFrozen ? 'Unfreeze Card' : 'Freeze Card'}
                    </Button>
                  </CardTitle>
                  <CardDescription>Instantly toggle security switches and online payment rules.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="text-sm font-medium">Online Shopping & E-Commerce</div>
                          <div className="text-xs text-muted-foreground">Allow transactions on digital merchants & web stores</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedCard.onlinePaymentsEnabled}
                        onChange={() => handleToggleSetting('onlinePaymentsEnabled')}
                        disabled={selectedCard.isFrozen}
                        className="h-4 w-4 rounded border-primary"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-purple-500" />
                        <div>
                          <div className="text-sm font-medium">International Transactions</div>
                          <div className="text-xs text-muted-foreground">Allow foreign currency charges & overseas merchants</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedCard.internationalPaymentsEnabled}
                        onChange={() => handleToggleSetting('internationalPaymentsEnabled')}
                        disabled={selectedCard.isFrozen}
                        className="h-4 w-4 rounded border-primary"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-emerald-500" />
                        <div>
                          <div className="text-sm font-medium">ATM Cash Withdrawals</div>
                          <div className="text-xs text-muted-foreground">Enable cash withdrawals at physical ATMs</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedCard.atmWithdrawalsEnabled}
                        onChange={() => handleToggleSetting('atmWithdrawalsEnabled')}
                        disabled={selectedCard.isFrozen}
                        className="h-4 w-4 rounded border-primary"
                      />
                    </div>
                  </div>

                  {/* Spending Limits Summary */}
                  <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-indigo-500" /> Spending Limits
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNewDailyLimit(selectedCard.dailyLimit.toString());
                          setNewMonthlyLimit(selectedCard.monthlyLimit.toString());
                          setIsLimitsOpen(true);
                        }}
                      >
                        Adjust Limits
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground font-medium">Daily Limit</div>
                        <div className="text-lg font-bold text-foreground mt-1">
                          ${selectedCard.dailyLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg border">
                        <div className="text-xs text-muted-foreground font-medium">Monthly Limit</div>
                        <div className="text-lg font-bold text-foreground mt-1">
                          ${selectedCard.monthlyLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Change PIN Action */}
                  <div className="border-t pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Key className="h-4 w-4 text-amber-500" /> Security 4-Digit PIN
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsPinOpen(true)}>
                      Change PIN
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Adjust Limits Modal */}
      <Dialog open={isLimitsOpen} onOpenChange={setIsLimitsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Adjust Card Limits</DialogTitle>
            <DialogDescription>Set maximum daily and monthly spend amounts for this card.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateLimits} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Daily Limit ($)</Label>
              <Input type="number" value={newDailyLimit} onChange={(e) => setNewDailyLimit(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Monthly Limit ($)</Label>
              <Input type="number" value={newMonthlyLimit} onChange={(e) => setNewMonthlyLimit(e.target.value)} required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsLimitsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-blue-600 text-white hover:bg-blue-500">
                Save Limits
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change PIN Modal */}
      <Dialog open={isPinOpen} onOpenChange={setIsPinOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Change Security PIN</DialogTitle>
            <DialogDescription>Set a new 4-digit PIN code for ATM and merchant authorization.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePin} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>New 4-Digit PIN</Label>
              <Input type="password" maxLength={4} placeholder="e.g. 5829" value={newPin} onChange={(e) => setNewPin(e.target.value)} required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsPinOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting || newPin.length !== 4} className="bg-amber-600 text-white hover:bg-amber-500">
                Update PIN
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
