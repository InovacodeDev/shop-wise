This auth module provides basic email/password registration and login, email verification, password reset, and TOTP 2FA helpers.

Notes:

- For production, install and configure the dependencies listed in package.json and set JWT_SECRET.
- OAuth endpoints are placeholders; integrate with passport strategies (passport-google-oauth20, passport-apple, passport-azure-ad) for real provider logins.
- Email sending is left as TODO; integrate with Nodemailer or an external transactional email service.
