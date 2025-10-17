// app/admin/components/ProfileTab.tsx
// Profile management tab for changing username and password

'use client';

import { useState, useCallback, useMemo } from 'react';
import React from 'react';
import { User, Lock, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { ResponsiveWrapper } from '@/components/ResponsiveWrapper';
import { getTouchTargetSize } from '@/utils/deviceUtils';
import { getAdminApiBaseUrl } from '../utils/apiConfig';

interface ProfileTabProps {
  currentUsername: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const ProfileTab = ({ currentUsername, onSuccess, onError }: ProfileTabProps) => {
  const { type: deviceType } = useDeviceDetection();
  const touchTargetSize = getTouchTargetSize(deviceType);

  // Username change state
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Get API key from session
  const getApiKey = useCallback(() => {
    const session = localStorage.getItem('techequity-admin-session');
    if (session) {
      const parsed = JSON.parse(session);
      return parsed.apiKey;
    }
    return null;
  }, []);

  // Handle username change (memoized)
  const handleUsernameChange = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');

    // Validation
    if (!newUsername.trim()) {
      setUsernameError('Username cannot be empty');
      return;
    }

    if (newUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    if (newUsername === currentUsername) {
      setUsernameError('New username must be different from current username');
      return;
    }

    setIsUpdatingUsername(true);

    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${getAdminApiBaseUrl()}/api/admin/update-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ newUsername: newUsername.trim() })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess('Username updated successfully! Please log in again with your new username.');
        setNewUsername('');
        
        // Log out after 2 seconds
        setTimeout(() => {
          localStorage.removeItem('techequity-admin-session');
          window.location.reload();
        }, 2000);
      } else {
        setUsernameError(result.error || 'Failed to update username');
      }
    } catch (error) {
      console.error('Error updating username:', error);
      setUsernameError('An error occurred. Please try again.');
    } finally {
      setIsUpdatingUsername(false);
    }
  }, [newUsername, currentUsername, onSuccess, getApiKey]);

  // Handle password change (memoized)
  const handlePasswordChange = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    // Validation
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }

    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${getAdminApiBaseUrl()}/api/admin/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(result.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword, onSuccess, getApiKey]);

  // Memoized components
  const MobileProfileTab = useMemo(() => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>

      {/* Username Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Change Username</h3>
        </div>

        <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-400">Current Username:</p>
          <p className="text-base font-medium text-white">{currentUsername}</p>
        </div>

        <form onSubmit={handleUsernameChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Username
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full bg-gray-700 !text-white rounded-lg px-4 border border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors placeholder:text-gray-400"
              style={{ height: touchTargetSize }}
              placeholder="Enter new username"
              disabled={isUpdatingUsername}
            />
          </div>

          {usernameError && (
            <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{usernameError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdatingUsername || !newUsername.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            style={{ height: touchTargetSize }}
          >
            <Save className="w-5 h-5" />
            {isUpdatingUsername ? 'Updating...' : 'Update Username'}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-700 !text-white rounded-lg px-4 pr-12 border border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors placeholder:text-gray-400"
                style={{ height: touchTargetSize }}
                placeholder="Enter current password"
                disabled={isUpdatingPassword}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-700 text-gray-100 rounded-lg px-4 pr-12 border border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors placeholder:text-gray-500"
                style={{ height: touchTargetSize }}
                placeholder="Enter new password (min 8 characters)"
                disabled={isUpdatingPassword}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-700 text-gray-100 rounded-lg px-4 pr-12 border border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors placeholder:text-gray-500"
                style={{ height: touchTargetSize }}
                placeholder="Confirm new password"
                disabled={isUpdatingPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {passwordError && (
            <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{passwordError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            style={{ height: touchTargetSize }}
          >
            <Save className="w-5 h-5" />
            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  ), [
    currentUsername,
    newUsername,
    usernameError,
    isUpdatingUsername,
    currentPassword,
    newPassword,
    confirmPassword,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    passwordError,
    isUpdatingPassword,
    touchTargetSize,
    handleUsernameChange,
    handlePasswordChange
  ]);

  const TabletDesktopProfileTab = useMemo(() => (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-white mb-8">Account Settings</h2>

      {/* Username Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-7 h-7 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Change Username</h3>
        </div>

        <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Current Username:</p>
          <p className="text-lg font-medium text-white">{currentUsername}</p>
        </div>

        <form onSubmit={handleUsernameChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Username
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full bg-gray-700 !text-white rounded-lg px-4 py-3 border border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors placeholder:text-gray-400"
              placeholder="Enter new username"
              disabled={isUpdatingUsername}
            />
          </div>

          {usernameError && (
            <div className="flex items-start gap-2 p-4 bg-red-900/20 border border-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{usernameError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdatingUsername || !newUsername.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg py-3 font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isUpdatingUsername ? 'Updating...' : 'Update Username'}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-7 h-7 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-700 !text-white rounded-lg px-4 py-3 pr-12 border border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors placeholder:text-gray-400"
                placeholder="Enter current password"
                disabled={isUpdatingPassword}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-700 text-gray-100 rounded-lg px-4 py-3 pr-12 border border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors placeholder:text-gray-500"
                placeholder="Enter new password (min 8 characters)"
                disabled={isUpdatingPassword}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-700 text-gray-100 rounded-lg px-4 py-3 pr-12 border border-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors placeholder:text-gray-500"
                placeholder="Confirm new password"
                disabled={isUpdatingPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {passwordError && (
            <div className="flex items-start gap-2 p-4 bg-red-900/20 border border-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{passwordError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg py-3 font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  ), [
    currentUsername,
    newUsername,
    usernameError,
    isUpdatingUsername,
    currentPassword,
    newPassword,
    confirmPassword,
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    passwordError,
    isUpdatingPassword,
    handleUsernameChange,
    handlePasswordChange
  ]);

  return (
    <ResponsiveWrapper
      mobile={MobileProfileTab}
      tablet={TabletDesktopProfileTab}
      desktop={TabletDesktopProfileTab}
    />
  );
};