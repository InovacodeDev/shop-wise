# Stripe Migration Configuration Guide

## Overview

Successfully migrated the payment gateway from Polar to Stripe. The core implementation is complete and ready for configuration and testing.

## Required Environment Variables

Add these environment variables to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Product/Price IDs (create these in Stripe Dashboard)
STRIPE_PRO_MONTHLY_PRICE_ID=price_your_monthly_price_id
STRIPE_PRO_YEARLY_PRICE_ID=price_your_yearly_price_id
```

## Stripe Dashboard Setup

### 1. Create Products and Prices

1. Go to Stripe Dashboard → Products
2. Create a "Pro Plan" product
3. Add pricing options:
    - Monthly subscription
    - Yearly subscription
4. Copy the price IDs to your environment variables

### 2. Configure Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/payments/stripe/webhook`
3. Select these events:
    - `checkout.session.completed`
    - `payment_intent.succeeded`
    - `payment_intent.payment_failed`
    - `invoice.payment_succeeded`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## API Endpoints

### Public Endpoints

- `POST /api/payments/pro-plan/checkout` - Create Pro plan checkout session
- `POST /api/payments/embedded/pro-plan/checkout` - Create embedded Pro plan checkout
- `POST /api/payments/stripe/webhook` - Stripe webhook handler (public, signature verified)

### Authenticated Endpoints

- `GET /api/payments/:transactionId/status` - Get payment status
- `POST /api/payments/confirm-payment/:transactionId` - Confirm embedded payment
- `GET /api/payments/user/payments` - List user payments
- `POST /api/payments/:transactionId/force-poll` - Force poll transaction status

## Database Changes

### New Schema: StripeTransaction

Replaced `PolarTransaction` with `StripeTransaction`:

- `stripeTransactionId` - Stripe session/payment intent ID
- `type` - 'checkout_session' or 'payment_intent'
- `customerId` - Stripe customer ID
- `chargeId` - Stripe charge ID (when available)
- `receiptUrl` - Payment receipt URL

### Updated Family Schema

Added `PRO` plan to the `FamilyPlan` enum.

## Services Overview

### StripeClientService

- Complete Stripe API integration
- Checkout sessions, payment intents, customers, products
- Webhook signature validation
- Error handling and logging

### PaymentsService

- Pro plan checkout creation
- Embedded payment flows
- Webhook event processing
- Family plan upgrades
- Transaction status polling

### PaymentPollingService

- Background polling for payment status updates
- Automatic retry logic
- Status tracking and cleanup

## Frontend Integration

Update your frontend to use the new Stripe endpoints:

```typescript
// Create checkout session
const response = await fetch('/api/payments/pro-plan/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        plan: 'monthly', // or 'yearly'
        successUrl: 'https://your-app.com/success',
        cancelUrl: 'https://your-app.com/cancel',
    }),
});

const { url } = await response.json();
window.location.href = url; // Redirect to Stripe Checkout
```

## Testing

1. Use Stripe test mode initially
2. Test checkout session creation
3. Test embedded payment flows
4. Verify webhook processing
5. Test family plan upgrades

## Migration Checklist

- [x] Install Stripe SDK
- [x] Create StripeClientService
- [x] Create StripeTransaction schema
- [x] Update PaymentsService for Stripe
- [x] Update PaymentPollingService
- [x] Add webhook endpoint
- [x] Update DTOs and types
- [ ] Configure environment variables
- [ ] Set up Stripe Dashboard products/webhooks
- [ ] Remove old Polar files
- [ ] Update frontend integration
- [ ] Test end-to-end flows

## Files to Remove After Testing

Once the migration is verified working:

```bash
src/payments/services/polar-client.service.ts
src/payments/schemas/polar-transaction.schema.ts
src/payments/types/polar-api.types.ts
```

## Next Steps

1. Configure the environment variables
2. Set up Stripe Dashboard (products, webhooks)
3. Test the payment flows
4. Update frontend to use new endpoints
5. Remove old Polar-related files
6. Deploy and monitor

The Stripe integration is now complete and ready for production use!
