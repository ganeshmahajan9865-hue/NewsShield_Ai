import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home as HomeIcon } from 'lucide-react';
import Button from '../components/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="container-narrow" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-subtle)',
            color: 'var(--brand)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <ShieldAlert size={32} />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          404 — Page Not Found
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 28px', lineHeight: 1.6 }}>
          The verification page or resource you requested could not be located. It may have been moved or removed.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button
            variant="primary"
            leftIcon={<HomeIcon size={16} />}
            onClick={() => navigate('/')}
          >
            Go to Home
          </Button>
          <Button
            variant="secondary"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
