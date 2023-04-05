const router = require('express').Router();
const User = require('../models/user');
const Message = require('../models/message');
const ExpressError = require('../expressError');
const {ensureLoggedIn, ensureCorrectUser} = require('../middleware/auth');

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const message = await Message.get(req.params.id);
        const {from_user: {username: from_u}, to_user: {username: to_u}} = message;

        // Make sure that the currently-logged-in users is either the to or from user.
        if (from_u!== req.user.username && to_u!== req.user.username) {
            throw new ExpressError('You are not allowed to read this message.', 403);
        }

        return res.status(200).json({message});
    } catch (err) {
        return next(err);
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const msg = {
            from_username: req.user.username,
            to_username: req.body.to_username,
            body: req.body.body
        }
        const result = await Message.create( msg );

        return res.status(201).json( {message: result} );
    } catch (err) {
        return next(err);
    }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
    try {
        const {to_user} = await Message.get(req.params.id);
        if (to_user.username !== req.user.username) {
            throw new ExpressError('You are not allowed to read this message.', 403);
        }
        const message = await Message.markRead(req.params.id);
        return res.status(200).json({message});
    } catch (err) {
        return next(err);
    }
});

module.exports = router;