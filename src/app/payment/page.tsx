// app/payment/page.tsx (or wherever this page is)
import PaymentClient from '@/components/client/payment';
import React, { Suspense } from 'react';


export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentClient />
    </Suspense>
  );
}
