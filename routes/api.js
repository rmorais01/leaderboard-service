var express = require('express');
var router = express.Router();

/* 
 * Provides service help   
 * 
*/
router.get('/', function(req, res, next) {
      res.send("Submit data: api/setscore || Display results: api/getleaderboard");
});

/* 
*  Provides a list of the top 5 players based on their scores 
*/
router.get('/getleaderboard', function(req, res) {
      var redisClient = req.redisClient;
      redisClient.zrevrange('scores', "0", "4", function (err, reply) {
          if (reply) {
              var results = reply;
              res.json(results);
          }
          else {
              console.log("ERROR " + err);
              var status = {"status":"success"};
              res.json(status);
          } 
      });
    
});

/* 
*  Sets the score for a player. 
*/
router.post('/setscore', function(req, res) {
      var status = {"status":"failed"};
      var redisClient = req.redisClient;
      
      var player = req.body.player;
      var score = req.body.score;
  
      validate(player, score), function (err, reply) {
          if (err) {
            console.log("ERROR " + err);
            status[reason] = reply;
            res.json(status);
            return;
          } 
      }

      redisClient.zadd('scores', score, player, function (err, reply) {
          if (err) {
            console.log("ERROR " + err);
          } 
      });
      status = {"status":"success"};
      res.json(status);
});


function validate (player, score) {
     console.log("DATA " + player + " " + score);
     if (player === null || score == null) {
          throw  "Invalid Data: requires parameters 'player' and 'score'" ;
     } 
     if (isNaN(score)) {
         throw "Invalid Data: 'score' must be a number" ;
     }  
}

module.exports = router;
