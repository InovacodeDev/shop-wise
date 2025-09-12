# Email Service Configuration Guide

## Overview

The ShopWise API now includes a comprehensive email service built with Resend, providing automated email functionality for:

- Password reset emails
- Email verification
- Plan purchase confirmations
- Data deletion warnings
- Account deletion confirmations
- Test emails

## Environment Variables Required

Add these environment variables to your `.env` file:

```env
# Resend Configuration
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000
```

## Email Service Features

### 1. Password Reset Email

- **Method**: `sendPasswordResetEmail(email, resetToken, resetUrl?)`
- **Usage**: Automatically called by auth service
- **Template**: Professional HTML template with reset button
- **Language**: Portuguese (Brazilian)

### 2. Email Verification

- **Method**: `sendEmailVerification(email, verificationToken, verificationUrl?)`
- **Usage**: Automatically called during user registration
- **Template**: Welcome email with verification button
- **Language**: Portuguese (Brazilian)

### 3. Plan Purchase Confirmation

- **Method**: `sendPlanPurchaseConfirmation(email, planDetails)`
- **Usage**: Automatically sent when Stripe payment succeeds
- **Features**:
    - Plan details with pricing
    - Feature list
    - Billing cycle information
- **Integration**: Connected to Stripe webhooks

### 4. Data Deletion Warning

- **Method**: `sendDataDeletionWarning(email, userName, deletionDate)`
- **Usage**: Send warning before data deletion
- **Template**: Warning-styled email with important notice

### 5. Account Deletion Confirmation

- **Method**: `sendAccountDeletionConfirmation(email, userName)`
- **Usage**: Confirm account deletion completion
- **Template**: Confirmation with summary of deleted data

### 6. Test Email

- **Method**: `sendTestEmail(email)`
- **Usage**: Verify email configuration
- **Endpoint**: `POST /email/test`

## API Endpoints

### Test Email

```bash
POST /email/test
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### Password Reset Email

```bash
POST /email/password-reset
Content-Type: application/json

{
  "email": "user@example.com",
  "resetToken": "reset_token_here"
}
```

## Integration Points

### 1. Payment System Integration

The email service is automatically integrated into the payments workflow:

- **Files Modified**:
    - `src/payments/payments.module.ts` - Added EmailModule import
    - `src/payments/services/payments.service.ts` - Added email confirmation

- **Process Flow**:
    1. User completes Stripe payment
    2. Webhook receives payment confirmation
    3. Payment service processes pro plan upgrade
    4. Email confirmation is automatically sent

### 2. Auth System Integration

The email service replaces the old nodemailer implementation:

- **Files Modified**:
    - `src/auth/auth.module.ts` - Added EmailModule import
    - `src/auth/mail.service.ts` - Updated to use new EmailService

### 3. App Module Integration

- **File**: `src/app.module.ts`
- **Change**: Added EmailModule to global imports

## File Structure

```
src/common/
├── email.service.ts     # Main email service with all email types
├── email.module.ts      # NestJS module configuration
└── email.controller.ts  # Test endpoints for email functionality
```

## Email Templates

All emails include:

- Professional HTML templates with ShopWise branding
- Plain text fallbacks for accessibility
- Responsive design for mobile devices
- Portuguese (Brazilian) language
- Consistent styling and branding

## Security Features

- Email validation
- Token-based authentication for links
- Configurable expiration times
- Error handling and logging
- Environment-based configuration

## Testing

### 1. Test Email Functionality

```bash
curl -X POST http://localhost:3000/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

### 2. Test Payment Email Flow

1. Complete a test Stripe payment
2. Check webhook processing logs
3. Verify email delivery

### 3. Test Auth Email Flow

1. Register a new user
2. Request password reset
3. Verify emails are sent correctly

## Monitoring and Logs

The service provides comprehensive logging:

- Email sending attempts
- Success/failure status
- Error details
- Resend API responses

Check logs in your application for:

```
[EmailService] Sending test email to: user@example.com
[PaymentsService] Plan purchase confirmation email sent to user@example.com
```

## Error Handling

The service includes robust error handling:

- Validates email addresses
- Handles Resend API errors
- Logs failures for debugging
- Graceful degradation (doesn't break payment flow)

## Next Steps

1. **Configure Environment**: Add required environment variables
2. **Test Configuration**: Use test endpoints to verify setup
3. **Monitor Production**: Watch logs for email delivery status
4. **Custom Templates**: Modify templates as needed for branding

## Support

For issues with:

- **Resend API**: Check Resend dashboard and API logs
- **Email Delivery**: Verify DKIM/SPF records for your domain
- **Template Issues**: Modify templates in email.service.ts
