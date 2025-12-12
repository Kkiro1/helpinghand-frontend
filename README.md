# HelpingHand - Donation Management Platform

A React.js-based donation management platform with user authentication for donors, recipients, and organizations.

## Features

- **Login Page**: Sign in with email/password or social login (Google, Facebook)
- **Signup Page**: Create a new account with role selection (Donor, Recipient, Both)
- **User Types**: Support for Donors, Recipients, and Organizations
- **Modern UI**: Clean and responsive design

## Prerequisites

Before running the application, make sure you have:
- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm start
   ```

3. **Open in Browser**
   - The app will automatically open at `http://localhost:3000`
   - If it doesn't open automatically, navigate to that URL in your browser

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner

## Project Structure

```
helpinghand/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── pages/
│   │   ├── Login.js        # Login page component
│   │   ├── Login.css       # Login page styles
│   │   ├── Signup.js       # Signup page component
│   │   └── Signup.css      # Signup page styles
│   ├── App.js              # Main app component with routing
│   ├── App.css             # App styles
│   ├── index.js            # React entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Pages

- **Login Page** (`/login`): Sign in to your account
  - Select user type: Donor, Recipient, or Organization
  - Email/password authentication
  - Social login options (Google, Facebook)
  
- **Signup Page** (`/signup`): Create a new account
  - Full name, email, and password
  - Role selection: Donor, Recipient, or Both
  - Terms and conditions acceptance

## Next Steps

After running the application, you can:
1. Navigate to `/login` to see the login page
2. Navigate to `/signup` to see the signup page
3. Test the form validations and user interactions

## Notes

- The authentication is currently set up with placeholder logic
- You'll need to connect it to a backend API for actual authentication
- Social login buttons are UI-only and need backend integration
