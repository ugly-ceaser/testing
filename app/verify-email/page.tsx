import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }
    fetch(`/api/verify-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully! You can now log in.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Verification failed.');
      });
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="p-8 max-w-md w-full text-center">
        <h2 className="text-xl font-bold mb-4">Email Verification</h2>
        <div className={status === 'success' ? 'text-green-500' : status === 'error' ? 'text-red-500' : 'text-gray-400'}>
          {message}
        </div>
        {status === 'success' && (
          <Link href="/auth/login">
            <Button className="mt-6">Go to Login</Button>
          </Link>
        )}
      </Card>
    </div>
  );
}
