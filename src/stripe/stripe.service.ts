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
      const { amount, currency, email, name, booking_id, payment_method_id, save_payment } = body;
  
      try {
          // Step 1: Validate Booking
          const bookingExists = await this.bookingService.getBookingById(booking_id);
          if (!bookingExists) {
              throw new BadRequestException('Invalid booking ID');
          }
  
          // Step 2: Check if a customer with this email already exists
          let customer;
          const existingCustomers = await this.stripe.customers.list({ email: email, limit: 1 });
  
          if (existingCustomers.data.length > 0) {
              customer = existingCustomers.data[0];
          } else {
              // Create a new customer if one doesn't exist
              customer = await this.stripe.customers.create({
                  email,
                  name,
                  description: `Customer for booking ID ${booking_id}`,
              });
          }
  
          // Step 3: Attach the payment method to the customer
          try {
              await this.stripe.paymentMethods.attach(payment_method_id, {
                  customer: customer.id,
              });
  
              // Set the payment method as the default for invoices
              await this.stripe.customers.update(customer.id, {
                  invoice_settings: { default_payment_method: payment_method_id },
              });
          } catch (error) {
              if (error instanceof this.stripe.errors.StripeInvalidRequestError) {
                  throw new BadRequestException(`Invalid PaymentMethod: ${error.message}`);
              }
              throw new InternalServerErrorException(`Failed to attach payment method: ${error.message}`);
          }
  
          // Step 4: Update Booking with Payment Information
          const updatedBooking = await this.bookingService.updateBooking(
              {
                  customer_id: customer.id,
                  payment_method_id: payment_method_id,
                  payment_id: null,
                  amount: bookingExists.sub_total,
                  currency: currency,
                  payment_status: 'Pending',
                  client_payment_date: null,
              },
              bookingExists._id
          );
  
          // Respond with updated booking details
          return updatedBooking;
  
      } catch (error: any) {
          console.error(`❌ Error in createPaymentIntentPro: ${error.message}`);
  
          if (error instanceof this.stripe.errors.StripeCardError) {
              throw new BadRequestException(`Card Error: ${error.message}`);
          } else if (error instanceof this.stripe.errors.StripeInvalidRequestError) {
              throw new BadRequestException(`Invalid Request: ${error.message}`);
          } else if (error instanceof this.stripe.errors.StripeAPIError) {
              throw new InternalServerErrorException(`Stripe API Error: ${error.message}`);
          } else if (error instanceof this.stripe.errors.StripeConnectionError) {
              throw new InternalServerErrorException(`Connection Error: ${error.message}`);
          } else if (error instanceof this.stripe.errors.StripeRateLimitError) {
              throw new BadRequestException(`Rate Limit Exceeded: ${error.message}`);
          } else {
              // Catch-all for unexpected errors
              throw new InternalServerErrorException(`Unexpected Error: ${error.message}`);
          }
      }
  }
  





    async getCardInfo(user: { userId?: ObjectId }) {
      try {
        // Get the latest completed booking with payment info for this user
        const latestBooking = await this.bookingService.getPaymentIdBooking({
          created_by: user.userId,
          'payment.payment_method_id': { $exists: true },
          'payment.payment_status': 'succeeded',
          status: 'Completed'
        })
     

        if (!latestBooking?.payment?.payment_method_id) {
          throw new BadRequestException('No payment method found for this user');
        }

        const paymentMethod = await this.stripe.paymentMethods.retrieve(latestBooking.payment.payment_method_id);
        
        if (!paymentMethod || paymentMethod.type !== 'card') {
          throw new BadRequestException('Invalid payment method or not a card');
        }

        // Extract relevant card information
        const cardInfo = {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year,
          cardholderName: paymentMethod.billing_details.name,
          country: paymentMethod.card.country,
          funding: paymentMethod.card.funding, // 'credit' or 'debit'
          customerId: latestBooking.payment.customer_id
        };

        return cardInfo;
      } catch (error) {
        if (error instanceof Stripe.errors.StripeInvalidRequestError) {
          throw new BadRequestException(`Invalid Request: ${error.message}`);
        }
        throw new InternalServerErrorException(`Error retrieving card info: ${error.message}`);
      }
    }

    async getCardInfoForBookingDetail(bookingId) {
      try {
        // Get the latest completed booking with payment info for this user
        const latestBooking = await this.bookingService.getBookingById(bookingId)
     
        if (!latestBooking?.payment?.payment_method_id) {
         return null
        }

        const paymentMethod = await this.stripe.paymentMethods.retrieve(latestBooking.payment.payment_method_id);
        
        if (!paymentMethod || paymentMethod.type !== 'card') {
          throw new BadRequestException('Invalid payment method or not a card');
        }

        // Extract relevant card information
        const cardInfo = {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year,
          cardholderName: paymentMethod.billing_details.name,
          country: paymentMethod.card.country,
          funding: paymentMethod.card.funding, // 'credit' or 'debit'
          customerId: latestBooking.payment.customer_id
        };

        return cardInfo;
      } catch (error) {
        if (error instanceof Stripe.errors.StripeInvalidRequestError) {
          throw new BadRequestException(`Invalid Request: ${error.message}`);
        }
        throw new InternalServerErrorException(`Error retrieving card info: ${error.message}`);
      }
    }

}
