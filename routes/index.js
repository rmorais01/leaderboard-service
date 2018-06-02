var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("Sample Microservice for Docker and Kubernetes Demo - /api ");
});

module.exports = router;
