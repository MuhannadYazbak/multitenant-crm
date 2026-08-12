// components/SubscribeButton.tsx
'use client';

import React, { useState } from 'react';

interface SubscribeButtonProps {
  tenantId: string;
  priceId: string;
  subscriptionStatus?: string;
  currentPeriodEnd?: string;
}

export const SubscribeButton: React.FC<SubscribeButtonProps> = ({
  tenantId,
  priceId = 'price_1U3CjSFReYuSySfNQ5U1EQUV',
  subscriptionStatus = 'INACTIVE',
  currentPeriodEnd,
}) => {
  const [loading, setLoading] = useState(false);

  const isPro = subscriptionStatus === 'ACTIVE';

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8001/api/v1/subscriptions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/${tenantId}/mypage`,
          cancel_url: `${window.location.origin}/dashboard?payment=cancelled`,
        }),
      });

      const data = await response.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // If the tenant is already active, render a badge or portal button instead of "Subscribe"
  if (isPro) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ 
          padding: '6px 12px', 
          backgroundColor: '#e6fffa', 
          color: '#234e52', 
          borderRadius: '16px', 
          fontSize: '13px', 
          fontWeight: 'bold',
          border: '1px solid #38b2ac' 
        }}>
          ✨ PRO PLAN ACTIVE
        </span>
        {currentPeriodEnd && (
          <span style={{ fontSize: '12px', color: '#666' }}>
            Renews: {new Date(currentPeriodEnd).toLocaleDateString()}
          </span>
        )}
      </div>
    );
  }

  // Active / Unpaid tenant view
  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      style={{
        padding: '10px 18px',
        backgroundColor: '#635BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontWeight: 'bold',
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? 'Opening Checkout...' : 'Upgrade to Pro'}
    </button>
  );
};

export default SubscribeButton;