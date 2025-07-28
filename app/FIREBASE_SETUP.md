# Firebase Setup Guide

## Current Status
The app is currently running with placeholder Firebase configuration to prevent initialization errors. You can use the app without Firebase, but authentication features won't work.

## 🚀 Quick Setup Checklist

### ✅ Step 1: Create Firebase Project
- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Click "Add project"
- [ ] Name: "scanemon-app" (or your preferred name)
- [ ] Enable Google Analytics (optional)
- [ ] Create project

### ✅ Step 2: Enable Authentication Providers

#### 2.1 Email/Password (Required)
- [ ] Go to Authentication → Sign-in method
- [ ] Enable "Email/Password"
- [ ] Enable "Email link" (optional)
- [ ] Enable "Email verification" (recommended)

#### 2.2 Google Authentication
- [ ] Click "Google" in Sign-in method
- [ ] Click "Enable"
- [ ] Set Project support email: your-email@domain.com
- [ ] Set Project public-facing name: "Scanémon"
- [ ] Save

#### 2.3 Facebook Authentication
- [ ] Click "Facebook" in Sign-in method
- [ ] Click "Enable"
- [ ] Create Facebook App (see detailed instructions below)
- [ ] Enter App ID and App Secret
- [ ] Save

#### 2.4 Additional Providers (Optional)
- [ ] Apple: For iOS users and privacy-conscious users
- [ ] Twitter/X: For gaming community
- [ ] GitHub: For developer audience

### ✅ Step 3: Get Configuration
- [ ] Go to Project settings (gear icon)
- [ ] Scroll to "Your apps"
- [ ] Click web app icon (</>)
- [ ] Register app: "Scanémon Web"
- [ ] Copy configuration object

### ✅ Step 4: Create Environment File
- [ ] Create `.env` file in `app` directory
- [ ] Add Firebase configuration variables
- [ ] Add React app configuration

### ✅ Step 5: Configure Domains
- [ ] Go to Authentication → Settings
- [ ] Add authorized domains:
  - `localhost` (development)
  - `your-domain.com` (production)

### ✅ Step 6: Test Authentication
- [ ] Restart development server
- [ ] Test email/password login
- [ ] Test Google sign-in
- [ ] Test Facebook sign-in

## To Enable Firebase Authentication

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard
4. Choose a project name (e.g., "scanemon-app")

### 2. Enable Authentication Providers

#### 2.1 Email/Password (Required)
1. In your Firebase project, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Configure settings:
   - ✅ Enable Email/Password
   - ✅ Enable Email link (optional)
   - ✅ Enable Email verification (recommended)

#### 2.2 Google Authentication
1. In the "Sign-in method" tab, click "Google"
2. Click "Enable"
3. Configure settings:
   - ✅ Enable Google sign-in
   - Project support email: your-email@domain.com
   - Project public-facing name: "Scanémon"
4. Save

#### 2.3 Facebook Authentication
1. In the "Sign-in method" tab, click "Facebook"
2. Click "Enable"
3. You'll need to create a Facebook App first:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app (Consumer type)
   - Add Facebook Login product
   - Get your App ID and App Secret
4. Back in Firebase, enter:
   - App ID: Your Facebook App ID
   - App Secret: Your Facebook App Secret
5. Save

#### 2.4 Additional Providers (Optional)
- **Apple**: Required for iOS apps, good for privacy
- **Twitter/X**: Gaming community overlap
- **GitHub**: Developer audience
- **Discord**: Gaming community

### 3. Get Your Configuration
1. In your Firebase project, go to "Project settings" (gear icon)
2. Scroll down to "Your apps"
3. Click the web app icon (</>)
4. Register your app if you haven't already:
   - App nickname: "Scanémon Web"
   - Firebase Hosting: No (for now)
5. Copy the configuration object

### 4. Create Environment File
Create a `.env` file in the `app` directory with:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-actual-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id

# React App Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
```

### 5. Configure Authorized Domains
1. In Firebase Console, go to Authentication → Settings
2. Add your domains to "Authorized domains":
   - `localhost` (for development)
   - `your-domain.com` (for production)

### 6. Restart the Development Server
After creating the `.env` file, restart your development server:

```bash
npm start
```

## Provider-Specific Setup

### Google Authentication
- ✅ Automatically configured when you enable Google sign-in
- No additional setup required for web apps

### Facebook Authentication
1. **Create Facebook App**:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create new app → Consumer
   - Add "Facebook Login" product
   - Configure OAuth redirect URIs:
     - `https://your-project.firebaseapp.com/__/auth/handler`
     - `http://localhost:3000/__/auth/handler` (for development)

2. **Get Credentials**:
   - App ID: Found in your Facebook app dashboard
   - App Secret: Found in Facebook app settings

3. **Configure Firebase**:
   - Enter App ID and App Secret in Firebase Console
   - Add your domain to Facebook app settings

### Apple Authentication (Optional)
1. **Create Apple Developer Account** (if you don't have one)
2. **Create App ID** in Apple Developer Console
3. **Configure Sign in with Apple**:
   - Service ID: com.yourdomain.scanemon
   - Domains and Subdomains: your-domain.com
4. **Add to Firebase**:
   - Service ID: com.yourdomain.scanemon
   - Apple Team ID: Your Apple Team ID
   - Key ID: Your Key ID
   - Private Key: Your private key file

## Testing Authentication

### 1. Test Email/Password
```javascript
// In browser console
firebase.auth().signInWithEmailAndPassword('test@example.com', 'password123')
```

### 2. Test Google Sign-in
- Click "Sign in with Google" button
- Should redirect to Google OAuth

### 3. Test Facebook Sign-in
- Click "Sign in with Facebook" button
- Should redirect to Facebook OAuth

## Troubleshooting

### Common Issues

#### "Firebase auth not available"
- Check your `.env` file has correct Firebase config
- Restart development server
- Check browser console for errors

#### "Unauthorized domain"
- Add your domain to Firebase authorized domains
- For localhost: add `localhost` to authorized domains

#### "Facebook login not working"
- Check Facebook app settings
- Verify OAuth redirect URIs
- Check Facebook app is in "Live" mode

#### "Google sign-in popup blocked"
- Allow popups for your domain
- Check browser settings

#### "Provider not enabled"
- Go to Firebase Console → Authentication → Sign-in method
- Enable the provider you're trying to use

#### "Invalid API key"
- Check that your Firebase config is correct
- Verify the API key in your `.env` file
- Make sure you're using the web app configuration

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` files to git
- Use different Firebase projects for dev/staging/prod

### 2. Authentication Rules
- Set up proper Firebase Security Rules
- Configure user data access controls

### 3. Error Handling
- Implement proper error handling in your app
- Show user-friendly error messages

## Current Behavior
- ✅ App loads without Firebase errors
- ✅ Navigation works properly
- ✅ Collection interface displays mock data
- ⚠️ Authentication features disabled (shows "Guest" user)
- ⚠️ User profile dropdown not functional

## Optional: Disable Firebase Completely
If you don't want to use Firebase, you can modify the app to use a different authentication system or remove authentication entirely.

## 🎯 Next Steps After Setup

1. **Test all authentication methods**
2. **Set up user profile management**
3. **Connect authentication to your backend**
4. **Add user data persistence**
5. **Implement role-based access control**

## 📞 Need Help?

- **Firebase Documentation**: [https://firebase.google.com/docs](https://firebase.google.com/docs)
- **Firebase Console**: [https://console.firebase.google.com](https://console.firebase.google.com)
- **Facebook Developers**: [https://developers.facebook.com](https://developers.facebook.com)
- **Google Cloud Console**: [https://console.cloud.google.com](https://console.cloud.google.com) 

---

## 🚀 Firebase Hosting Deployment

### 1. Build the React App
```bash
cd app
npm run build
```

### 2. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 3. Login to Firebase
```bash
firebase login
```

### 4. Initialize Firebase Hosting (if not already done)
```bash
firebase init hosting
# Use "build" as the public directory, configure as SPA, skip overwrite if prompted
```

### 5. Deploy to Firebase Hosting
```bash
firebase deploy
```

### 6. Access Your App
- Your app will be live at: https://scanemon-16c6c.web.app or your custom domain

---

## 🔄 Migrating to Vercel (Future)
- Vercel supports React apps out of the box
- You can use the same build output (`build/`)
- Update environment variables in Vercel dashboard
- Remove Firebase-specific config files when ready
- Vercel offers free tier with custom domains and preview deployments

--- 