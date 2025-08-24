// This is what you need to add to your backend UserController

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('584929634825-8j870f1f1dsv9cd2g8fj6g265b1r3b14.apps.googleusercontent.com');

// Add this method to your UserController
async googleAuth(req, res, next) {
try {
const { googleToken, email, username, picture } = req.body;

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: '584929634825-8j870f1f1dsv9cd2g8fj6g265b1r3b14.apps.googleusercontent.com',
    });

    const payload = ticket.getPayload();
    const googleId = payload['sub'];
    const verifiedEmail = payload['email'];

    // Check if user exists
    let user = await User.findOne({ where: { email: verifiedEmail } });

    if (!user) {
      // Create new user
      user = await User.create({
        username: username || verifiedEmail.split('@')[0],
        email: verifiedEmail,
        password: 'google_oauth_' + googleId, // Placeholder password
        googleId: googleId,
        picture: picture
      });
    }

    // Generate JWT token
    const access_token = signToken({ id: user.id });

    res.status(200).json({
      access_token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        picture: user.picture
      }
    });

} catch (error) {
next(error);
}
}

// Add this route to your userRoutes.js:
// router.post('/google-auth', UserController.googleAuth);

// You'll also need to install: npm install google-auth-library
// And add googleId and picture fields to your User model migration
