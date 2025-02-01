'use client';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect } from 'react';
import { load } from '@cashfreepayments/cashfree-js';
import { Button } from '@/components/ui/button';

export default function CheckoutPage() {
  const searchParams = useSearchParams();

  const bookingId = searchParams.get('bookingId');

  const fetchClientSecret = useCallback(async () => {
    // Create a Checkout Session
    const response = await axios.post('/api/payment', {
      bookingId: bookingId,
    });
    return {
      sessionId: response.data.sessionId,
      orderId: response.data.orderId,
    };
  }, []);

  let cashfree;
  var initializeSDK = async function () {
    cashfree = await load({
      mode: 'sandbox',
    });
  };
  initializeSDK();

  const doPayment = async () => {
    const { sessionId, orderId } = await fetchClientSecret();
    let checkoutOptions = {
      paymentSessionId: sessionId,
      // returnUrl: `/api/confirm?order_id=${orderId}`,
      redirectTarget: '_self',
    };
    cashfree.checkout(checkoutOptions).then((result) => {
      if (result.error) {
        // This will be true whenever user clicks on close icon inside the modal or any error happens during the payment
        console.log(
          'User has closed the popup or there is some payment error, Check for Payment Status'
        );
        console.log(result.error);
      }
      if (result.redirect) {
        // This will be true when the payment redirection page couldnt be opened in the same window
        // This is an exceptional case only when the page is opened inside an inAppBrowser
        // In this case the customer will be redirected to return url once payment is completed
        console.log('Payment will be redirected');
      }
      if (result.paymentDetails) {
        // This will be called whenever the payment is completed irrespective of transaction status
        console.log('Payment has been completed, Check for Payment Status');
        console.log(result.paymentDetails.paymentMessage);
      }
    });
  };

  // useEffect(() => {
  //   doPayment();
  // }, []);

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
