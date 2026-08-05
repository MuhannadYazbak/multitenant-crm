'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMsg(
          data.message || 'If an account exists, a reset token has been generated.'
        );
      } else {
        setErrorMsg(data.detail || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Unable to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Forgot Password?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter your admin username or company identifier to request a reset link.
          </p>
        </div>

        {statusMsg ? (
          <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-center">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
              {statusMsg}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              (In dev mode: check your Uvicorn console for the generated link!)
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username / Company Name
              </label>
              <input
                type="text"
                name='identifier'
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. admin or company-b"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Sending Request...' : 'Generate Reset Link'}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}