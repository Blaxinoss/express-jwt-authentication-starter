const fs = require('fs');
const passport = require('passport');
const path = require('path');
const User = require('mongoose').model('User');
const LocalStrategy = require('passport-local').Strategy;
const validPassword = require('../lib/utils').validPassword

const pathToKey = path.join(__dirname, '..', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');


const customFields = {
    usernameField: "uname",
    passwordField: "pw"
};

const verifyCallback = (username, password, donefun) => {

    User.findOne({ username: username })
        .then((user) => {
            if (!user) { return donefun(null, false) }

            const isValid = validPassword(password, user.hash, user.salt)

            if (isValid) {
                return donefun(null, user)
            } else {
                return donefun(null, false)
            }
        })
        .catch((err) => {
            donefun(err)
        })
}


const strategy = new LocalStrategy(customFields, verifyCallback)

passport.use(strategy)


passport.serializeUser((user, donefun) => {
    donefun(null, user.id)
})

passport.deserializeUser((userId, donefun) => {
    User.findById(userId)
        .then((user) => {
            donefun(null, user)
        })
        .catch(err => donefun(err))
})

// TODO
const options = {};

// TODO
module.exports = (passport) => { }