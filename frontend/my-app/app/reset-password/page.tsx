'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract ?token=... from URL
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('');
    setErrorMsg('');

    if (!token) {
      setErrorMsg('Invalid or missing password reset token.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMsg(data.message || 'Password reset successfully!');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setErrorMsg(data.detail || 'Failed to update password.');
      }
    } catch (err) {
      setErrorMsg('Unable to connect to the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-500 font-medium">
          Invalid or expired password reset link.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          New Password
        </label>
        <input
          type="password"
          required
          minLength={6}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {statusMsg && (
        <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-md">
          {statusMsg} Redirecting to login...
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={loading || !!statusMsg}
        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow transition duration-200 disabled:opacity-50"
      >
        {loading ? 'Updating Password...' : 'Update Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Reset Your Password
        </h2>

        {/* Suspense wrapper is required in Next.js App Router for useSearchParams */}
        <Suspense fallback={<p className="text-center text-gray-500">Loading form...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}