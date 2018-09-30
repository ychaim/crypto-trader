const express = require('express');
const router = express.Router();
const security = require('../authentication/security');

/* GET users listing. */
router.get('/',  security.isAuthenticated, function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
