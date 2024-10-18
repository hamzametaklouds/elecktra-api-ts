import { Injectable, Inject, forwardRef, BadRequestException } from '@nestjs/common';
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

    async createPaymentIntentPro(body: CreatePaymentDto, user: { userId?: ObjectId }) {

        const { payment_method_id, amount, currency, email, name, save_payment, booking_id } = body;

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
        if (save_payment) {
            await this.stripe.paymentMethods.attach(payment_method_id, {
                customer: customer.id,
            });
            await this.stripe.customers.update(customer.id, {
                invoice_settings: { default_payment_method: payment_method_id },
            });
        }

        // Create a PaymentIntent for a one-time payment
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            customer: customer.id,
            payment_method: payment_method_id,
            off_session: true, // Charge the payment immediately without customer involvement
            confirm: true, // Automatically confirm the payment

        });

        // Determine if payment succeeded
        const paymentStatus = paymentIntent.status === "succeeded";


        const updatedBooking = await this.bookingService.updateBooking({
            customer_id: customer.id,
            payment_method_id: payment_method_id,
            payment_id: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            payment_status: paymentIntent.status,
        }, bookingExists._id)

        // Save the payment details to your database
        // const userPayment = new Payment({
        //   userId,
        //   paymentId: paymentIntent.id,
        //   customerId: customer.id,
        //   paymentMethodId,
        //   amount: paymentIntent.amount,
        //   currency: paymentIntent.currency,
        //   status: paymentIntent.status,
        //   paymentStatus,
        // });

        // await userPayment.save();

        // Respond to the client with the payment details
        return updatedBooking;
    };





}
