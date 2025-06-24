const express = require('express');
const app = express();
const passport = require('passport');
const router = express.Router();
router.get('/google' , passport.authenticate('google', {scope : ['profile' , 'email']} ));
router.get('/google/callback', passport.authenticate('google', {
  successRedirect: 'http://localhost:3000',
  failureRedirect: 'http://localhost:3000/signin',
}));
module.exports = router;