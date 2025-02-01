import { Cashfree } from 'cashfree-pg';
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import db from '@/utils/db';

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const order_id = searchParams.get('order_id') as string;
  const bookingId = searchParams.get('bookingId') as string;

  try {
    const response = await Cashfree.PGFetchOrder('2023-08-01', order_id);
    const session = response.data;

    if (session.order_status === 'PAID' && bookingId) {
      await db.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: true },
      });
    }
  } catch (err) {
    console.log(err);
    return Response.json(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
  redirect('/bookings');
};
