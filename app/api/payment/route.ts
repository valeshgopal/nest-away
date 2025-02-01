import { Cashfree } from 'cashfree-pg';
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;
import { type NextRequest } from 'next/server';

import db from '@/utils/db';
import { formatDate } from '@/utils/format';
export const POST = async (req: NextRequest) => {
  const requestHeaders = new Headers(req.headers);
  const origin = requestHeaders.get('origin');

  console.log({ origin });

  const { bookingId } = await req.json();

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  if (!booking) {
    return Response.json(null, {
      status: 404,
      statusText: 'Not Found',
    });
  }
  const {
    totalNights,
    orderTotal,
    checkIn,
    checkOut,
    property: { image, name },
  } = booking;

  try {
    const request = {
      'order_amount': orderTotal,
      'order_currency': 'INR',
      'customer_details': {
        'customer_id': 'node_sdk_test',
        'customer_name': 'Valesh Gopal',
        'customer_email': 'valeshgopal@gmail.com',
        'customer_phone': '+919347209980',
      },
      'order_meta': {
        'return_url': `${origin}/api/confirm?order_id={order_id}&bookingId=${bookingId}`,
      },
      'order_note': '',
      'cart_details': {
        cart_id: bookingId,
        cart_items: [
          {
            item_name: `${name}`,
            item_image_url: image,
            item_description: `Stay in this wonderful place for ${totalNights} nights, from ${formatDate(
              checkIn
            )} to ${formatDate(checkOut)}. Enjoy your stay!`,
            item_original_unit_price: orderTotal,
            item_discounted_unit_price: orderTotal,
          },
        ],
      },
    };

    const response = await Cashfree.PGCreateOrder('2023-08-01', request);
    const session = response.data;
    return Response.json({
      sessionId: session.payment_session_id,
      orderId: session.order_id,
    });
  } catch (error) {
    console.log(error);
    return Response.json(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
};
