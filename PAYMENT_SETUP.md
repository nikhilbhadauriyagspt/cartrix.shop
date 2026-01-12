# Payment Gateway Setup Guide

This guide explains how to configure payment gateways in your e-commerce application. All payment settings are managed through the Admin Panel.

## Available Payment Options

1. **Cash on Delivery (COD)** - Default, no setup required
2. **Razorpay** - Indian payment gateway supporting UPI, Cards, Net Banking
3. **Stripe** - International payment gateway supporting Cards

## Admin Panel Configuration

### Step 1: Access Payment Settings
1. Login to Admin Panel at `/admin/login`
2. Navigate to **Payments** from the sidebar
3. You'll see three payment gateways: Razorpay, Stripe, and PayPal

### Step 2: Configure Razorpay (Recommended for India)

1. **Create Razorpay Account**
   - Visit [razorpay.com](https://razorpay.com)
   - Sign up for a new account
   - Complete KYC verification

2. **Get API Credentials**
   - Login to Razorpay Dashboard
   - Go to Settings → API Keys
   - Generate new API Keys (if not already generated)
   - Copy:
     - Key ID (This is your API Key)
     - Key Secret (This is your API Secret)

3. **Add Credentials to Admin Panel**
   - Paste Key ID in "API Key" field
   - Paste Key Secret in "API Secret" field
   - Toggle "Test Mode" ON for testing (use live mode when ready for production)
   - Toggle "Enabled" ON to activate Razorpay

4. **Enable Payment Methods**
   - Scroll down to "Payment Methods" section
   - Enable the methods you want to offer:
     - Credit/Debit Card
     - UPI
     - Net Banking
     - Wallet

5. **Click "Save All Settings"**

### Step 3: Configure Stripe (For International Payments)

1. **Create Stripe Account**
   - Visit [stripe.com](https://stripe.com)
   - Sign up for a new account
   - Complete business verification

2. **Get API Credentials**
   - Login to Stripe Dashboard
   - Go to Developers → API Keys
   - Copy:
     - Publishable Key (This is your API Key)
     - Secret Key (This is your API Secret)

3. **Add Credentials to Admin Panel**
   - Paste Publishable Key in "API Key" field
   - Paste Secret Key in "API Secret" field
   - Toggle "Test Mode" ON for testing
   - Toggle "Enabled" ON to activate Stripe

4. **Click "Save All Settings"**

## Customer Checkout Experience

Once configured, customers will see the following at checkout:

1. **Cash on Delivery** - Pay when product is delivered (Always available)
2. **Credit/Debit Card** - Online payment via Razorpay/Stripe (if enabled)
3. **UPI** - Pay via UPI apps like Google Pay, PhonePe (if Razorpay enabled)
4. **Net Banking** - Direct bank transfer (if enabled)
5. **Wallet** - Paytm, PhonePe Money, etc. (if enabled)

## Testing Payments

### Razorpay Test Mode
When Test Mode is ON, use these test credentials:
- Test Card: 4111 1111 1111 1111
- Any future expiry date
- Any CVV (e.g., 123)
- Any name

### Stripe Test Mode
When Test Mode is ON, use these test credentials:
- Test Card: 4242 4242 4242 4242
- Any future expiry date
- Any CVV (e.g., 123)
- Any ZIP code

## Payment Flow

1. **Customer places order** → Order created with "pending" payment status
2. **Payment gateway opens** → Customer completes payment
3. **Payment verified** → Order status updated to "completed"
4. **Customer redirected** → Order confirmation page

## Security Features

- API keys stored securely in database
- Payment verification on server-side
- HTTPS encryption for all transactions
- Row Level Security (RLS) policies protect payment settings
- Admin-only access to payment configuration

## Order Status

### Payment Status
- **Pending** - Payment not yet completed (for COD or pending online payments)
- **Completed** - Payment successful
- **Failed** - Payment attempt failed
- **Refunded** - Payment refunded to customer

### Order Status
- **Pending** - Order placed, awaiting processing
- **Processing** - Order being prepared
- **Shipped** - Order dispatched
- **Delivered** - Order delivered to customer
- **Cancelled** - Order cancelled

## Troubleshooting

### Payment Gateway Not Showing
- Ensure the gateway is **enabled** in admin panel
- Verify API keys are correct
- Check that at least one payment method is enabled

### Payment Verification Failed
- Verify API Secret is correct
- Check if webhook signature matches
- Review edge function logs

### Test Payments Not Working
- Ensure "Test Mode" is ON
- Use correct test card numbers
- Check API keys are for test environment

## Live Mode Checklist

Before going live:

- [ ] Complete KYC verification with payment provider
- [ ] Switch to Live API Keys
- [ ] Toggle "Test Mode" OFF
- [ ] Test with real payment amount
- [ ] Verify webhooks are configured
- [ ] Enable required payment methods
- [ ] Save all settings

## Support

For payment gateway issues:
- **Razorpay**: support@razorpay.com
- **Stripe**: support@stripe.com

For application issues, contact your development team.
