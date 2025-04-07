const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const app = express();

// إعداد السيشن
app.use(session({
    secret: 'your-secret-key', // غيريها لكلمة سر قوية
    resave: false,
    saveUninitialized: false
}));

// إعداد Passport
app.use(passport.initialize());
app.use(passport.session());

// إعداد Google Strategy
passport.use(new GoogleStrategy({
    clientID: '1001482267198-vio6uqmmejj7ppv47a2por100n8d3ih3.apps.googleusercontent.com', // حطي الـ Client ID بتاعك هنا
    clientSecret: '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', // حطي الـ Client Secret هنا
    callbackURL: 'http://localhost:3000/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    // هنا بترجعي بيانات اليوزر من جوجل
    console.log('Google Profile:', profile);
    return done(null, profile); // الـ profile فيه بيانات زي id, displayName, emails
}));

// Serialize و Deserialize
passport.serializeUser((user, done) => {
    done(null, user.id); // بيخزن الـ Google ID في السيشن
});

passport.deserializeUser((id, done) => {
    // هنا ممكن تجيبي بيانات اليوزر من الداتابيز لو عايزة
    done(null, { id: id }); // بنرجع الـ ID بس كمثال
});

// راوتات
app.get('/', (req, res) => {
    res.send('<a href="/auth/google">Login with Google</a>');
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

app.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        res.send(`مرحبًا ${req.user.id}، إنت مسجل دخول بنجاح!`);
    } else {
        res.redirect('/');
    }
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.send('خطأ');
        res.redirect('/');
    });
});

// تشغيل السيرفر
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});