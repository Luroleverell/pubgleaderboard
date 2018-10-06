var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer(); 
var nconf = require('nconf');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var Tournament = require('../models/tournament');
var passport = require('passport');

//var MatchS  = require('../models/tournament');

var placementPoints = [0,400,330,280,240,210,180,150,120,100,80,60,40,30,20,10,0,0,0,0,0  ,0,0,0,0,0,0,0,0,0,0  ,0,0,0,0,0,0,0,0,0,0  ,0,0,0,0,0,0,0,0,0,0  ,0,0,0,0,0,0,0,0,0,0  ,0,0,0,0,0,0,0,0,0,0  ,0,0,0,0,0,0,0,0,0,0  ,0,0,0,0,0,0,0,0,0,0  ,0,0,0,0,0,0,0,0,0,0];
var killPoints = 16;

router.post('/add', [upload.fields([]), User.ensureAuthenticated], function(req, res, next) {
  var newTournament = new Tournament({
    username: req.user.username,
    tournament: req.body.tournamentName,
    public: false,
    settings: {
      placementPoints: placementPoints,
      killPoints: killPoints,
      useSameLobby: false
    }
  });
  
  Tournament.createTournament(newTournament, function(err, tournament){
    if(err) throw err;
  });
  
  req.flash('success', 'You have added a new tournament/league');
  
  res.location('/tournament');
  res.redirect('/tournament');
});

router.get('/pubgAPI/:playername/:shard', User.ensureAuthenticated, function(req, res, next){
  Tournament.getMatchesByPlayername(req.params.playername, req.params.shard, function(result){
    res.json(result);
  })
})

router.get('/edit/:id', function(req, res, next) {
  Tournament.getTournamentById(req.params.id).then(function(tournament){
    let matchList = tournament.matches || '';
    if(!(matchList=='')){
      matchList.sort(function(a,b){
        return new Date(a.matchDate) - new Date(b.matchDate);
      })
    }
    res.render('editTournament', {tournament: tournament, matches: matchList || ''});
  });
});

router.post('/edit/:id', [
  upload.fields([]), 
  User.ensureAuthenticated
  ], function(req, res, next){
  
  Tournament.addMatch(req.params.id, req.body.matchId, req.body.teamNameList, function(exists){
    if(exists){
      req.flash('alert', 'Match allredy added to the tournament');
    }else{
      req.flash('success', 'You have added a new match');
    }
    res.location('/tournaments/edit/'+req.params.id);
    res.redirect('/tournaments/edit/'+req.params.id);
  });
});

router.get('/getTournament/:tournamentId', function(req, res, next){
  Tournament.getTournamentById(req.params.tournamentId).then(function(tournament){
    res.json(tournament);
  })
})

router.post('/remove/:tourId/:matchId?', upload.fields([]), function(req, res, next){
  Tournament.getTournamentById(req.params.tourId).then(function(doc){
    User.getUserById(req.session.passport.user, function(err, userDoc){
      if (err) throw err;
      if(userDoc.username == doc.username){
        Tournament.removeTourMatch(req.params.tourId, req.params.matchId, function(err){
          if (err) throw err;
          if(req.params.matchId){
            req.flash('success', 'You have successfully removed the match');
            res.location('/tournaments/edit/'+req.params.tourId);
            res.redirect('/tournaments/edit/'+req.params.tourId);
          }else{
            req.flash('success', 'You have successfully removed the tournament');
            res.location('/tournament');
            res.redirect('/tournament');
          }
        });
      }
    });
  });
});

router.post('/public/:id', [upload.fields([]), User.ensureAuthenticated], function(req, res, next){
  var public = (req.body.public == 'on' ? true : false);
  Tournament.changePublic(req.params.id, public).then(function(){
    res.location('/tournament');
    res.redirect('/tournament');
  });
});

router.get('/changeTeamName/:tournamentId/:matchId/:teamIndex/:teamName/:teamId', [upload.fields([]), User.ensureAuthenticated], function(req, res, next){
  Tournament.changeTeamName(req.params.tournamentId, req.params.matchId, req.params.teamIndex, req.params.teamName, req.params.teamId).then(function(){
    res.json('');
  });
});

router.get('/changePoint/:tournamentId/:index/:newPoint', [upload.fields([]), User.ensureAuthenticated], function(req, res, next){
  Tournament.changePoint(req.params.tournamentId, req.params.index, req.params.newPoint).then(function(){
    res.json('');
  });
});

router.get('/changeKeepTeamId/:tournamentId/:newValue', function(req, res){
  let newKeepTeamId = (req.params.newValue == 'true' ? true : false);
  Tournament.changeKeepTeamId(req.params.tournamentId, newKeepTeamId).then(function(doc){
    res.json('');
  })
})

module.exports = router;