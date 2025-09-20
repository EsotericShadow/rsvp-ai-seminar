"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token'); // Optional: for secure unsubscribe

    if (!email) {
      setStatus('error');
      setMessage('Invalid unsubscribe link: Email address missing.');
      return;
    }

    const unsubscribe = async () => {
      try {
        const response = await fetch('/api/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'You have been successfully unsubscribed.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to unsubscribe. Please try again.');
        }
      } catch (error) {
        console.error('Unsubscribe fetch error:', error);
        setStatus('error');
        setMessage('An error occurred. Could not connect to the server.');
      }
    };

    unsubscribe();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        {status === 'processing' && (
          <>
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Processing your request...</h1>
            <p className="text-gray-600">Please wait while we process your unsubscribe request.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h1 className="text-2xl font-semibold text-green-600 mb-4">Success!</h1>
            <p className="text-gray-700">{message}</p>
            <p className="mt-4 text-gray-600">You will no longer receive emails from us.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-2xl font-semibold text-red-600 mb-4">Error</h1>
            <p className="text-gray-700">{message}</p>
            <p className="mt-4 text-gray-600">If you believe this is an error, please contact support.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait.</p>
        </div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}