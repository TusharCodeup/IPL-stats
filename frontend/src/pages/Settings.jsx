import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { userService } from '../services/userService';
import { billingService } from '../services/billingService';
import { adminService } from '../services/adminService';
import { useApi } from '../hooks/useApi';
import CheckoutModal from '../components/CheckoutModal';
import { 
  User, Lock, CreditCard, Shield, Check, 
  AlertCircle, ChevronRight, Coins, RefreshCw,
  Clock, CheckCircle, XCircle 
} from 'lucide-react';

const Settings = () => {
  const { username, full_name, credits, subscription, setUserDetails, role } = useAuthStore();
  const isAdmin = role === 'admin';
  
  // Profile Form States
  const [profileName, setProfileName] = useState(full_name || '');
  const [profileUsername, setProfileUsername] = useState(username || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const { loading: profileLoading, error: profileError, execute: executeProfile } = useApi();

  // Password Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const { loading: passwordLoading, error: passwordError, execute: executePassword } = useApi();

  // Billing states
  const [billingLogs, setBillingLogs] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { loading: billingLoading, execute: executeBilling } = useApi();
  const logoutStore = useAuthStore((state) => state.logout);

  // Admin payment verification states
  const [pendingPayments, setPendingPayments] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // tx_id being acted on

  // Sync profile details if store changes
  useEffect(() => {
    setProfileName(full_name || '');
    setProfileUsername(username || '');
  }, [full_name, username]);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you absolutely sure you want to delete your account? This will wipe all prediction and billing logs permanently."
    );
    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      await userService.deleteAccount();
      alert("Your account has been deleted successfully.");
      logoutStore();
    } catch (err) {
      console.error("Account deletion failed:", err);
      alert("Failed to delete account. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };


  // Fetch billing history
  const loadBillingHistory = async () => {
    try {
      const data = await executeBilling(() => billingService.getHistory());
      setBillingLogs(data);
    } catch (err) {
      console.error('Failed to load billing log history:', err);
    }
  };

  useEffect(() => {
    loadBillingHistory();
    if (isAdmin) loadPendingPayments();
  }, []);

  // Admin: Load pending payments
  const loadPendingPayments = async () => {
    setPendingLoading(true);
    try {
      const data = await adminService.getPendingPayments();
      setPendingPayments(data);
    } catch (err) {
      console.error('Failed to load pending payments:', err);
    } finally {
      setPendingLoading(false);
    }
  };

  const handleApprovePayment = async (txId) => {
    setActionLoading(txId);
    try {
      await adminService.approvePayment(txId);
      setPendingPayments((prev) => prev.filter((p) => p.id !== txId));
    } catch (err) {
      console.error('Approve failed:', err);
      alert(err?.response?.data?.detail || 'Failed to approve payment.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectPayment = async (txId) => {
    const confirmed = window.confirm('Are you sure you want to reject this payment?');
    if (!confirmed) return;
    setActionLoading(txId);
    try {
      await adminService.rejectPayment(txId);
      setPendingPayments((prev) => prev.filter((p) => p.id !== txId));
    } catch (err) {
      console.error('Reject failed:', err);
      alert(err?.response?.data?.detail || 'Failed to reject payment.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess(false);
    
    try {
      const updated = await executeProfile(() => userService.updateProfile({
        full_name: profileName,
        username: profileUsername
      }));
      if (updated) {
        setUserDetails({
          full_name: updated.full_name,
          username: updated.username
        });
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Update profile error:', err);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess(false);
    setPasswordErrorMsg('');

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New passwords do not match.');
      return;
    }

    try {
      await executePassword(() => userService.changePassword({
        old_password: oldPassword,
        new_password: newPassword
      }));
      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      console.error('Change password error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300 relative z-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Configure profiles, change security passwords, and manage subscription billing credits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Profiles and Security */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Form */}
          <div className="glass-card p-6 bg-white dark:bg-[#111827]/50 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-emerald-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Profile Information</h3>
                <p className="text-xs text-gray-500">Update your username and display name details.</p>
              </div>
            </div>

            {profileError && (
              <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500 dark:focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Username</label>
                  <input
                    type="text"
                    value={profileUsername}
                    onChange={(e) => setProfileUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500 dark:focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-indigo-600 dark:bg-emerald-500 text-white dark:text-slate-950 hover:bg-indigo-500 dark:hover:bg-emerald-400 font-bold py-2.5 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-md active:scale-[0.98] transition-all text-xs"
                >
                  {profileLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Save Details</span>}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="glass-card p-6 bg-white dark:bg-[#111827]/50 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Security & Password</h3>
                <p className="text-xs text-gray-500">Update your security token details.</p>
              </div>
            </div>

            {(passwordError || passwordErrorMsg) && (
              <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passwordError || passwordErrorMsg}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Password changed successfully!</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 dark:focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 dark:focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 dark:focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-indigo-600 dark:bg-emerald-500 text-white dark:text-slate-950 hover:bg-indigo-500 dark:hover:bg-emerald-400 font-bold py-2.5 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-md active:scale-[0.98] transition-all text-xs"
                >
                  {passwordLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Update Password</span>}
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-6 bg-white dark:bg-[#111827]/50 border border-red-200/40 dark:border-red-950/20 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none"></div>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-red-600 dark:text-red-400">Danger Zone</h3>
                <p className="text-xs text-gray-500">Permanently delete your profile and account history logs.</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Deleting your account is permanent. It will instantly wipe your profile, predicted histories, credentials, and billing invoices. This action cannot be reversed.
            </p>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-500 text-white font-extrabold py-2.5 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-md active:scale-[0.98] transition-all text-xs cursor-pointer"
              >
                {deleteLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Delete My Account</span>}
              </button>
            </div>
          </div>

        </div>

          {/* Admin: Payment Verification Panel */}
          {isAdmin && (
            <div className="glass-card p-6 bg-white dark:bg-[#111827]/50 border border-amber-200/40 dark:border-amber-950/20 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Payment Verification</h3>
                    <p className="text-xs text-gray-500">Approve or reject pending UPI payments.</p>
                  </div>
                </div>
                <button
                  onClick={loadPendingPayments}
                  disabled={pendingLoading}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${pendingLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {pendingLoading ? (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                </div>
              ) : pendingPayments.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400 border border-dashed border-slate-100 dark:border-gray-800/80 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-50" />
                  No pending payments to verify.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPayments.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-2xl border border-amber-100 dark:border-amber-900/20 bg-amber-50/30 dark:bg-amber-950/5 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-sm text-slate-800 dark:text-gray-200">{tx.username}</span>
                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">Pending</span>
                          </div>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            {tx.created_at ? new Date(tx.created_at).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                        <span className="font-black text-sm text-slate-900 dark:text-white">₹{tx.amount}</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">UPI Reference</span>
                        <span className="font-mono text-xs text-slate-800 dark:text-gray-200 font-bold">{tx.payment_id || 'N/A'}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleApprovePayment(tx.id)}
                          disabled={actionLoading === tx.id}
                          className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                          {actionLoading === tx.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleRejectPayment(tx.id)}
                          disabled={actionLoading === tx.id}
                          className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                          {actionLoading === tx.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        {/* Right column: Subscription summary & Billing Logs */}
        <div className="space-y-8">
          
          {/* Subscription Upgrade Card */}
          <div className="glass-card p-6 bg-gradient-to-br from-indigo-900 to-slate-900 dark:from-[#0d1627] dark:to-gray-950 border border-slate-800 text-white rounded-3xl shadow-xl relative overflow-hidden">
            {/* Visual shine glow */}
            <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">YOUR PLAN</span>
              <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full border ${
                subscription === 'pro' 
                  ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400' 
                  : 'border-indigo-400/40 bg-indigo-400/10 text-indigo-300'
              }`}>
                {subscription === 'pro' ? '👑 PRO TIER' : 'FREE TIER'}
              </span>
            </div>

            <div className="flex items-baseline space-x-2 mb-6">
              {subscription === 'pro' ? (
                <>
                  <span className="text-4xl font-black font-display text-emerald-400">UNLIMITED</span>
                  <span className="text-xs text-gray-400">credits enabled</span>
                </>
              ) : (
                <>
                  <span className="text-5xl font-black font-display">{credits}</span>
                  <span className="text-xs text-gray-300">Credits Remaining</span>
                </>
              )}
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {subscription === 'pro' 
                ? "You have unlocked complete prediction models, live simulations, historical team insights, and unlimited API logs." 
                : "Each pre-match predict or live simulation consumes 1 credit. Upgrade to Pro for unlimited usage."
              }
            </p>

            {subscription !== 'pro' ? (
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-black py-3 px-4 rounded-xl flex items-center justify-center space-x-2 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-md text-sm cursor-pointer"
              >
                <Coins className="w-4 h-4" />
                <span>Refill Credits / Upgrade (₹99)</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/40 p-3 rounded-xl">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>You are enjoying unlimited predictions!</span>
              </div>
            )}
          </div>

          {/* Billing Log History List */}
          <div className="glass-card p-6 bg-white dark:bg-[#111827]/50 border border-slate-200 dark:border-gray-800 rounded-3xl shadow-xl">
            <div className="flex items-center space-x-2.5 mb-6">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400">
                <CreditCard className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Billing History</h3>
            </div>

            {billingLoading ? (
              <div className="flex items-center justify-center py-6 text-gray-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
            ) : billingLogs.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 border border-dashed border-slate-100 dark:border-gray-800/80 rounded-xl">
                No subscription invoices available.
              </div>
            ) : (
              <div className="space-y-3">
                {billingLogs.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/30 flex items-center justify-between text-xs transition-all hover:bg-slate-50 dark:hover:bg-gray-900/60"
                  >
                    <div>
                      <span className="font-extrabold text-slate-800 dark:text-gray-200 block">{tx.plan_name} Refill</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{new Date(tx.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 dark:text-white block">₹{tx.amount}</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider block mt-0.5 ${
                        tx.status === 'captured' ? 'text-emerald-500' : 'text-yellow-500'
                      }`}>
                        {tx.status === 'captured' ? 'Success' : tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Payment Gateway Sandbox Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        planName="Pro"
        onSuccess={loadBillingHistory}
      />
    </div>
  );
};

export default Settings;
