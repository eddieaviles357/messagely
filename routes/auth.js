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
        if (await User.authenticate(username, password)) { 
            await User.updateLoginTimestamp(username);
            const token = jwt.sign({username}, JWT_SECRET);
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

module.exports = router;