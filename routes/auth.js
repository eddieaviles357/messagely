const router = require('express').Router();
const User = require('../models/user');
const Message = require('../models/message');
const ExpressError = require('../expressError');
const jwt = require('jsonwebtoken');
const {SECRET_KEY} = require('../config');

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async (req, res, next) => {
    try {
        const {username, password} = req.body;
        console.log(req.user)
        if (await User.authenticate(username, password)) { 
            await User.updateLoginTimestamp(username);
            const token = jwt.sign({username}, SECRET_KEY);
            return res.status(200).json({token});
        } else {
            throw new ExpressError('Invalid username or password', 401);
        }
    } catch (err) {
        return next(err);
    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req, res, next) => {
    try {
        const user = await User.register(req.body);
        // update last login timestamp
        if(user) {
            await User.updateLoginTimestamp(user.username);
            return res.status(200).json({
                token: jwt.sign({username: user.username}, SECRET_KEY)
            });
        };
        return res.status(400).json({error: 'OhOh, something went wrong'});
    } catch (err) {
        if(err.code === '23505') next(new ExpressError('Username already taken', 400));
        next(err)
    }
})
module.exports = router;