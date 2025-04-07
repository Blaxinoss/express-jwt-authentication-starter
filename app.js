const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('passport');

const session = require('express-session')
const MongoStore = require('connect-mongo');

/**
 * -------------- GENERAL SETUP ----------------
 */

// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();

// Create the Express application
var app = express();

// Configures the database and opens a global connection that can be used in any module with `mongoose.connection`
require('./config/database');

// Must first load the models
require('./models/user');

// Pass the global passport object into the configuration function
require('./config/passport')(passport);

// This will initialize the passport object on every request

app.use(session({
    secret: process.env.SECRET,  // سر التشفير
    resave: false,  // لا تعيد حفظ الجلسات التي لم تتغير
    saveUninitialized: false,  // لا تحفظ الجلسات الفارغة

    store: MongoStore.create({
        mongoUrl: process.env.DB_STRING,  // رابط الاتصال بقاعدة البيانات
        collectionName: 'sessions',  // اسم الكولكشن في MongoDB
        ttl: 14 * 24 * 60 * 60,  // مدة صلاحية الجلسة (14 يوم)
        autoRemove: 'native'  // يحذف الجلسات المنتهية تلقائيًا
    }),
    cookie: {
        secure: false, maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true, // للسماح بجلب الكوكي من الـ frontend
        sameSite: 'lax'
    }  // مدة الجلسة (يوم واحد)
}));

app.use(passport.initialize());
app.use(passport.session())
// Instead of using body-parser middleware, use the new Express implementation of the same thing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allows our Angular application to make HTTP requests to Express application
app.use(cors());

// Where Angular builds to - In the ./angular/angular.json file, you will find this configuration
// at the property: projects.angular.architect.build.options.outputPath
// When you run `ng build`, the output will go to the ./public directory
app.use(express.static(path.join(__dirname, 'public')));



app.use((req, res, next) => {
    console.log(req.user);
    console.log("🔍 Session Data:", req.session);

    next();
})

app.get('/home', (req, res) => {
    res.send("<h1>Welcome home</h1>")
})


/**
 * -------------- ROUTES ----------------
 */

// Imports all of the routes from ./routes/index.js
app.use(require('./routes'));


/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000
app.listen(3000);
