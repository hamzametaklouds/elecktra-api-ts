import { Injectable, Inject } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import Stripe from 'stripe';

@Injectable()
export class StripeService {

    private stripe: Stripe;

    constructor() {
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




}
