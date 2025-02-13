import { Injectable, Inject, forwardRef, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { BookingsService } from 'src/bookings/bookings.service';
import { CreatePaymentDto } from 'src/bookings/dtos/create-payment';
import Stripe from 'stripe';

@Injectable()
export class StripeService {

    private stripe: Stripe;

    constructor(
        @Inject(forwardRef(() => BookingsService))
        private bookingService: BookingsService
    ) {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        console.log('Stripe Secret Key:', stripeSecretKey);
        this.stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2024-09-30.acacia',
        });
    }

    // Create a Payment Intent
    async createPaymentIntent(amount: number, currency: string) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount, // amount in the smallest currency unit (e.g., cents)
                currency,
                payment_method_types: ['card'],
            });

            return paymentIntent;
        } catch (error) {
            throw new Error(`Error creating payment intent: ${error.message}`);
        }
    }

    // Retrieve a Payment Intent (optional)
    async retrievePaymentIntent(paymentIntentId: string) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
        } catch (error) {
            throw new Error(`Error retrieving payment intent: ${error.message}`);
        }
    }

    async verifyPayment(paymentId: string): Promise<{ status: string }> {
        try {
            // Retrieve the PaymentIntent from Stripe using the paymentId
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);

            // Return the status of the PaymentIntent
            return { status: paymentIntent.status };
        } catch (error) {
            throw new Error(`Error verifying payment: ${error.message}`);
        }
    }
 
    async chargePayment(booking_id: string): Promise<{ status: string; payment_id?: string }> {
      try {
        // Step 1: Validate Booking
        const bookingExists = await this.bookingService.getBookingById(booking_id);
    
        if (!bookingExists) {
          throw new BadRequestException('Invalid booking id');
        }

       
    
        // Step 2: Check if withdrawal is allowed
        if (
          bookingExists.payment.payment_status !== 'Pending' ||
          bookingExists.status !== 'Pending'
        ) {
          throw new BadRequestException(
            'Withdraw Payment is permanently disabled for this booking as the status is no longer Pending.'
          );
        }

        const paymentMethod = await this.stripe.paymentMethods.retrieve(bookingExists?.payment?.payment_method_id);

        if (!paymentMethod?.customer) {
         throw new BadRequestException('The provided PaymentMethod is not attached to any customer.');
         }
    
        // Step 3: Create a PaymentIntent for a one-time payment
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: Math.round(bookingExists.sub_total * 100),
          currency: bookingExists.currency,
          customer: bookingExists.payment.customer_id,
          payment_method: bookingExists.payment.payment_method_id,
          off_session: true,
          confirm: true,
        });
    
        console.log(`✅ PaymentIntent created: ${paymentIntent.id}`);
    
        let updatedBooking;
    
        // Step 4: Update the booking if payment succeeded
        if (paymentIntent.status === 'succeeded') {
          updatedBooking = await this.bookingService.updateBooking(
            {
                customer_id: bookingExists?.payment?.customer_id,
                payment_method_id: bookingExists?.payment?.payment_method_id,
                payment_id: paymentIntent.id,
                amount: paymentIntent.amount/ 100,
                currency: paymentIntent.currency,
                payment_status: paymentIntent.status,
                client_payment_date: new Date(),
            },
            bookingExists._id
          );
    
          console.log(`✅ Booking ${booking_id} updated successfully with PaymentIntent: ${paymentIntent.id}`);
        } else {
          console.warn(`⚠️ Payment for booking ${booking_id} did not succeed. Status: ${paymentIntent.status}`);
        }
    
        return { status: paymentIntent.status, payment_id: paymentIntent.id };
    
      } catch (error: any) {
        console.error(`❌ Error verifying payment: ${error.message}`);
    
        if (error instanceof Stripe.errors.StripeCardError) {
          throw new BadRequestException(`Card Error: ${error.message}`);
        } else if (error instanceof Stripe.errors.StripeInvalidRequestError) {
          throw new BadRequestException(`Invalid Request: ${error.message}`);
        } else if (error instanceof Stripe.errors.StripeAPIError) {
          throw new InternalServerErrorException(`Stripe API Error: ${error.message}`);
        } else if (error instanceof Stripe.errors.StripeConnectionError) {
          throw new InternalServerErrorException(`Connection Error: ${error.message}`);
        } else if (error instanceof Stripe.errors.StripeRateLimitError) {
          throw new BadRequestException(`Rate Limit Exceeded: ${error.message}`);
        } else {
          // Catch-all for unexpected errors
          throw new InternalServerErrorException(`Unexpected Error: ${error.message}`);
        }
      }
    }
    



    async createPaymentIntentPro(body: CreatePaymentDto, user: { userId?: ObjectId }) {
        //adding payment method id
        const { amount, currency, email, name, booking_id, payment_method_id, save_payment } = body;

        const bookingExists = await this.bookingService.getBookingById(booking_id)


        if (!bookingExists) {
            throw new BadRequestException('Invalid booking id')
        }

        let customer;

        // Check if a customer with this email already exists
        const existingCustomers = await this.stripe.customers.list({ email: email, limit: 1 });

        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
        } else {
            // Create a new customer if one doesn't exist
            customer = await this.stripe.customers.create({
                payment_method: payment_method_id,
                email: email,
                name: name,
                description: `One-time payment of ${amount} ${currency}`,
                invoice_settings: {
                    default_payment_method: payment_method_id,
                },
            });
        }

        // Attach and save the payment method if required
            await this.stripe.paymentMethods.attach(payment_method_id, {
                customer: customer.id,
            });
            await this.stripe.customers.update(customer.id, {
                invoice_settings: { default_payment_method: payment_method_id },
            });

        let updatedBooking;

        updatedBooking = await this.bookingService.updateBooking({
            customer_id: customer.id,
            payment_method_id: payment_method_id,
            payment_id: null,
            amount: bookingExists.sub_total,
            currency: currency,
            payment_status: 'Pending',
            client_payment_date:null
        }, bookingExists._id)

        // Respond to the client with the payment details
        return updatedBooking;
    };





}
