const mongoose = require('mongoose');
const router = require('express').Router();
const User = mongoose.model('User');
const passport = require('passport');
const utils = require('../lib/utils');
const { isAuth, isAdmin } = require('./authMiddleware');
const genPassword = require('../lib/utils').genPassword

// TODO
router.get('/protected', (req, res, next) => {
});


router.get('/login', (req, res, next) => {
    const form = `
    <h1>Login Page</h1>
    <form method="POST" action="/users/login">
        Enter Username:<br>
        <input type="text" name="uname"><br>
        Enter Password:<br>
        <input type="password" name="pw"><br><br>
        <input type="submit" value="Submit">
    </form>
`;
    res.send(form);
})

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/users/login-failure',
    successRedirect: '/users/login-success'
}));


router.get('/login-success', (req, res) => {
    console.log("Login successful for user:", req.user);
    res.send(`<h1>Hello, you are authorized<a href="/users/protected-route">go to protected route</a> </h1>`);
});

router.get('/protected-route', isAuth, (req, res, next) => {
    res.send('you made it to the route.')
})

router.get('/admin-route', isAdmin, (req, res, next) => {
    res.send('wassap admin');
})

router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/home')
})


router.post('/register', function (req, res, next) {

    const saltHash = genPassword(req.body.pw)

    const salt = saltHash.salt;
    const hash = saltHash.hash

    const newUser = new User({
        username: req.body.uname,
        hash: hash,
        salt: salt,
        admin: true,
    })

    newUser.save()
        .then((user) => {
            console.log(user)
        })

    // res.redirect('/login');
    res.send({ message: "added successfuly" })

});

module.exports = router;