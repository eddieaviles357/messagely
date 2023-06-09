const router = require('express').Router();
const User = require('../models/user');
const Message = require('../models/message');
const ExpressError = require('../expressError');
const {ensureLoggedIn, ensureCorrectUser} = require('../middleware/auth');

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const users = await User.all();
        return res.json({users})
    } catch (err) {
        return next(err)
    }
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get('/:username', ensureCorrectUser, async (req, res, next) => {
    try {
        const user = await User.get(req.user.username);
        return res.json({user: user})
    } catch (err) {
        return next(err);
    }
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', ensureCorrectUser, async (req, res, next) => {
    try {
        console.log(req.user.username);
        const toMessages = await User.messagesTo(req.user.username);
        return res.json({messages: toMessages})
    } catch (err) {
        return next(err);
    }
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from', ensureCorrectUser, async (req, res, next) => {
    try {
        const fromMessages = await User.messagesFrom(req.user.username);
        return res.json({messages: fromMessages})
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
