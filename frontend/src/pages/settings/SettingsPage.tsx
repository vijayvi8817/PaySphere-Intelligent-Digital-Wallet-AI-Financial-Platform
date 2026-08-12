import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Settings, User, Shield, Palette, Bell, ChevronRight,
  Save, Eye, EyeOff, Check, Moon, Sun,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { userApi } from '@/api/user';
import { useTheme } from '@/hooks/useTheme';
import type { UpdateProfileRequest } from '@/types/linkedAccount';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Tab = 'profile' | 'security' | 'preferences' | 'notifications';

const tabs: { key: Tab; label: string; icon: typeof User }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'preferences', label: 'Preferences', icon: Palette },
  { key: 'notifications', label: 'Notifications', icon: Bell },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  const userQuery = useQuery({
    queryKey: ['current-user'],
    queryFn: () => userApi.getCurrentUser(),
  });

  const user = userQuery.data?.data;

  // Load profile data when user data is available
  if (user && !profileLoaded) {
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setPhone(user.phone ?? '');
    setProfileLoaded(true);
  }

  const profileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      import('@/lib/axios').then((mod) =>
        mod.default.put('/users/me', data).then((r) => r.data)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      setProfileMessage('Profile updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    },
    onError: () => {
      setProfileMessage('Failed to update profile');
      setTimeout(() => setProfileMessage(''), 3000);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      userApi.changePassword(data),
    onSuccess: () => {
      setPasswordMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(''), 3000);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      setPasswordMessage(error.response?.data?.message ?? 'Failed to change password');
      setTimeout(() => setPasswordMessage(''), 5000);
    },
  });

  const handleProfileSave = () => {
    profileMutation.mutate({ firstName, lastName, phone });
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match');
      setTimeout(() => setPasswordMessage(''), 3000);
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage('Password must be at least 8 characters');
      setTimeout(() => setPasswordMessage(''), 3000);
      return;
    }
    passwordMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
          <Settings className="h-7 w-7 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and security</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar Tabs */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.key
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </div>
                    {activeTab === tab.key && <ChevronRight className="h-4 w-4" />}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xl font-bold">
                    {(user?.firstName ?? 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="settings-first-name">First Name</Label>
                    <Input
                      id="settings-first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-last-name">Last Name</Label>
                    <Input
                      id="settings-last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-email">Email</Label>
                  <Input id="settings-email" value={user?.email ?? ''} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-phone">Phone Number</Label>
                  <Input
                    id="settings-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                {profileMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg px-4 py-2 text-sm ${
                      profileMessage.includes('success')
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}
                  >
                    {profileMessage}
                  </motion.div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleProfileSave}
                    disabled={profileMutation.isPending}
                    className="gap-2"
                  >
                    {profileMutation.isPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="settings-current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="settings-current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="settings-new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-confirm-password">Confirm New Password</Label>
                  <Input
                    id="settings-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                {passwordMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg px-4 py-2 text-sm ${
                      passwordMessage.includes('success')
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}
                  >
                    {passwordMessage}
                  </motion.div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={!currentPassword || !newPassword || !confirmPassword || passwordMutation.isPending}
                    className="gap-2"
                  >
                    {passwordMutation.isPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                    Change Password
                  </Button>
                </div>

                <Separator />

                {/* Account Status */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Account Status</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Account Status</p>
                      <p className="font-semibold mt-1 flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${
                          user?.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                        {user?.status ?? 'Unknown'}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">KYC Status</p>
                      <p className="font-semibold mt-1 flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${
                          user?.kycStatus === 'APPROVED' ? 'bg-emerald-500'
                            : user?.kycStatus === 'PENDING' ? 'bg-amber-500' : 'bg-gray-500'
                        }`} />
                        {user?.kycStatus ?? 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your app experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Theme</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'light' as const, label: 'Light', icon: Sun },
                      { value: 'dark' as const, label: 'Dark', icon: Moon },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${
                          theme === option.value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {theme === option.value && (
                          <div className="absolute top-2 right-2">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <option.icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Currency</h3>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Default Currency</p>
                        <p className="text-sm text-muted-foreground">USD — United States Dollar</p>
                      </div>
                      <span className="text-2xl">$</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Member Since</h3>
                  <div className="rounded-lg border p-4">
                    <p className="font-medium">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })
                        : 'Unknown'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control what notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Transfer Notifications', desc: 'When you send or receive money', enabled: true },
                  { label: 'Wallet Activity', desc: 'Deposits, withdrawals, and balance changes', enabled: true },
                  { label: 'Security Alerts', desc: 'Password changes and suspicious activity', enabled: true },
                  { label: 'Account Updates', desc: 'Linked accounts and verification status', enabled: true },
                  { label: 'Marketing', desc: 'Tips, promotions, and feature announcements', enabled: false },
                ].map((pref) => (
                  <div key={pref.label} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div>
                      <p className="font-medium">{pref.label}</p>
                      <p className="text-sm text-muted-foreground">{pref.desc}</p>
                    </div>
                    <div className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-colors cursor-pointer ${
                      pref.enabled ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}>
                      <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        pref.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
