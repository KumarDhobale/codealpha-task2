const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   PUT /api/users/follow/:id
// @desc    Follow or unfollow a user
// @access  Private
router.put('/follow/:id', auth, async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Check if the current user is already following the target user
        if (currentUser.following.some((follow) => follow.user.toString() === req.params.id)) {
            // If they are, remove the follow (unfollow)
            currentUser.following = currentUser.following.filter(
                ({ user }) => user.toString() !== req.params.id
            );
        } else {
            // If they are not, add the follow
            currentUser.following.unshift({ user: req.params.id });
        }

        await currentUser.save();
        res.json(currentUser.following);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;