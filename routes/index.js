var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Tournament = require('../models/tournament');
var Event = require('../models/event');
var Gamer = require('../models/gamer');

/* GET home page. */
router.get('/', function(req, res, next) {
  Tournament.getPublicTournaments().then(function(tournaments){
    res.render('index', {tournaments: tournaments});
  })
});

router.get('/tournament/:event?', User.ensureAuthenticated,  function(req, res, next) {
  User.getUserById(req.session.passport.user, function(err, doc){
    if(req.params.event){
      Event.getEventById(req.params.event).then(function(event){
        Tournament.getTournamentById(event.tournaments).then(function(tournaments){
          res.render('tournament', { title: 'League', events: [], eventId: req.params.event, tournaments: tournaments});
        });
      })
    }else{
      Tournament.getTournamentByUsername(doc.username).then(function(tournaments){
        Event.getEventByUsername(doc.username).then(function(events){
          res.render('tournament', { title: 'League', events: events, tournaments: tournaments});
        });
      });
    }
  });  
});

router.get('/nbg/:div?/:type?',function(req, res, next){
  if(req.params.div && req.params.type){
    Gamer.divisionStats(5890, req.params.div, req.params.type).then(function(stats){
      console.log(stats)
      res.render('nbg', {title: 'NBG', stats: stats});
    });
  }
});

module.exports = router;

