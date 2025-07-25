# Google OAuth Setup Guide for SnapLink

## Frontend Setup ✅ (Already Completed)

The frontend has been updated with:
- Google login button with proper styling
- OAuth callback handling
- Environment variable support
- Error handling and loading states

## Backend Setup Required 🚧

### 1. Install Required Packages

```bash
cd BackEnd
npm install passport passport-google-oauth20 express-session
```

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:4000/api/v1/users/auth/google/callback` (development)
   - `https://yourdomain.com/api/v1/users/auth/google/callback` (production)

### 3. Update Backend .env File

Add these variables to your backend `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/users/auth/google/callback

# Session Secret (generate a random string)
SESSION_SECRET=your_super_secret_session_key_here

# Frontend URL for redirects
FRONTEND_URL=http://localhost:5173
```

### 4. Create Google OAuth Route (user.routes.js)

Add these routes to your `user.routes.js`:

```javascript
import passport from 'passport';

// Google OAuth routes
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  async (req, res) => {
    try {
      // Generate JWT token for the user
      const token = generateAccessToken(req.user._id);
      
      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  }
);
```

### 5. Create Passport Configuration

Create `src/config/passport.js`:

```javascript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/user.models.js';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }
    
    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      await user.save();
      return done(null, user);
    }
    
    // Create new user
    const newUser = new User({
      googleId: profile.id,
      username: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0].value,
      isVerified: true // Google accounts are pre-verified
    });
    
    await newUser.save();
    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
```

### 6. Update User Model

Add Google OAuth fields to your user model:

```javascript
// Add these fields to your user schema
googleId: {
  type: String,
  unique: true,
  sparse: true
},
avatar: {
  type: String
},
isVerified: {
  type: Boolean,
  default: false
}
```

### 7. Update app.js

Add session and passport middleware:

```javascript
import session from 'express-session';
import passport from './config/passport.js';

// Add before your routes
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());
```

## Testing the Implementation

1. Start your backend server
2. Start your frontend server
3. Go to login page
4. Click "Continue with Google"
5. Complete Google OAuth flow
6. Should redirect back to dashboard

## Security Notes

- Always use HTTPS in production
- Store client secrets securely
- Implement proper error handling
- Consider rate limiting on auth endpoints
- Validate and sanitize all user data

## Troubleshooting

- Check Google Cloud Console credentials
- Verify redirect URIs match exactly
- Check browser network tab for errors
- Review server logs for authentication issues
