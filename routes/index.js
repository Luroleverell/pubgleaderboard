var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Tournament = require('../models/tournament');

/* GET home page. */
router.get('/', function(req, res, next) {
  Tournament.getPublicTournaments().then(function(tournaments){
    res.render('index', {tournaments: tournaments});
  })
});

router.get('/tournament', User.ensureAuthenticated,  function(req, res, next) {
  User.getUserById(req.session.passport.user, function(err, doc){
    Tournament.getTournamentByUsername(doc.username).then(function(tournaments){
      res.render('tournament', { title: 'League', tournaments: tournaments});
    });
  });  
});

module.exports = router;

