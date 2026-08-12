'use client'

import React, { useState } from 'react';

export default function SubscriptionTest  ()  {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8001/api/v1/subscriptions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': 'tenant_walid_123', // Replace or dynamically pull active tenant ID
        },
        body: JSON.stringify({
          price_id: 'price_1U3CjSFReYuSySfNQ5U1EQUV', // Your Stripe Test Price ID from Stripe Dashboard
          success_url: `${window.location.origin}/?payment=success`,
          cancel_url: `${window.location.origin}/?payment=cancelled`,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to create checkout session');
      }

      const data = await response.json();

      // Redirect the user to Stripe Hosted Checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err: any) {
      setError(err.message || 'Error starting subscription checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '450px', margin: '20px 0' }}>
      <h3>💳 Test Tenant Subscription Checkout</h3>
      <p style={{ fontSize: '13px', color: '#666' }}>
        Simulates tenant <code>tenant_walid_123</code> subscribing via Stripe Hosted Checkout.
      </p>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        style={{
          padding: '10px 18px',
          backgroundColor: '#635BFF', // Stripe purple
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Creating Stripe Session...' : 'Subscribe to Pro Plan'}
      </button>

      {error && (
        <p style={{ color: 'red', marginTop: '10px', fontSize: '13px' }}>
          ❌ {error}
        </p>
      )}
    </div>
  );
};