'use client';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import React, { useCallback } from 'react';
import { load } from '@cashfreepayments/cashfree-js';
import { Button } from '@/components/ui/button';

interface PaymentResponse {
  sessionId: string;
  orderId: string;
}

interface PaymentDetails {
  paymentMessage: string;
  // Add other payment details properties as needed
}

interface CheckoutResult {
  error?: {
    message: string;
    code: string;
  };
  redirect?: boolean;
  paymentDetails?: PaymentDetails;
}

interface CashfreeSDK {
  checkout: (arg0: {
    paymentSessionId: string;
    redirectTarget: string;
  }) => Promise<CheckoutResult>;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const fetchClientSecret = useCallback(async (): Promise<PaymentResponse> => {
    const response = await axios.post('/api/payment', {
      bookingId: bookingId,
    });
    return {
      sessionId: response.data.sessionId,
      orderId: response.data.orderId,
    };
  }, [bookingId]);

  let cashfree: CashfreeSDK;

  const initializeSDK = async function () {
    cashfree = await load({
      mode: 'sandbox',
    });
  };
  initializeSDK();

  const doPayment = async () => {
    const { sessionId } = await fetchClientSecret();
    const checkoutOptions = {
      paymentSessionId: sessionId,
      redirectTarget: '_self' as const,
    };

    cashfree.checkout(checkoutOptions).then((result: CheckoutResult) => {
      if (result.error) {
        console.log(
          'User has closed the popup or there is some payment error, Check for Payment Status'
        );
        console.log(result.error);
      }
      if (result.redirect) {
        console.log('Payment will be redirected');
      }
      if (result.paymentDetails) {
        console.log('Payment has been completed, Check for Payment Status');
        console.log(result.paymentDetails.paymentMessage);
      }
    });
  };

  return (
    <div
      id='checkout'
      className='flex flex-col justify-center items-center h-[400px]'
    >
      <p className='mb-4'>
        Click below to open the checkout page in current tab
      </p>
      <Button onClick={doPayment}>Pay Now</Button>
    </div>
  );
}
