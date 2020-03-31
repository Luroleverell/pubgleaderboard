var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Tournament = require('../models/tournament');
var Event = require('../models/event');
var Gamer = require('../models/gamer');
var multer = require('multer');
var upload = multer();
var fs = require('fs');
var JSZip = require('jszip')
var request = require('request');


/* GET home page. */
router.get('/', function(req, res, next) {
  Tournament.getPublicTournaments().then(function(tournaments){
    res.render('index', {tournaments: tournaments, buttonActive: 'Tournaments'});
  })
});

router.get('/tournament/:event?', User.ensureAuthenticated,  function(req, res, next) {
  User.getUserById(req.session.passport.user, function(err, doc){
    if(req.params.event){
      Event.getEventById(req.params.event).then(function(event){
        Tournament.getTournamentById(event.tournaments).then(function(tournaments){
          res.render('tournament', { title: 'League', events: [], eventId: req.params.event, tournaments: tournaments, buttonActive: ''});
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

router.get('/score/:nbg/:div?/:type?',function(req, res, next){
  if(req.params.div && req.params.nbg){
    let type = req.params.type || 'all';
    Gamer.divisionStats(req.params.nbg, req.params.div).then(function(lists){
      res.render('nbg', {title: 'NBG', lists: lists, type: type});
    });
  }else{
    res('Nothing to show')
  }
});

router.get('/testBucket', function(req, res){
  Tournament.testBucket();/*.then(function(bucket){
    //res.send('<img src="'+path+'" width=100 height=100>');*/
    res.send();
  //})
});

router.get('/observerpack/:tournamentId?/:groupNumber?', function(req, res){
  let id = req.params.tournamentId;//'7229';
  let gnr = req.params.groupNumber;
  
  //console.log(id, gnr);
  if(!id && !gnr){
    res.render('observerpack');
  }
  else if(id && !gnr){
    Gamer.division(id).then(function(groups){
      res.render('observerpack', {id:id, groups:groups});
    });
  }
  else if(id && gnr){
    Gamer.division(id).then(function(groups){
      Gamer.rounds(groups[gnr]).then(function(rounds){
        Gamer.round(rounds[0], res).then(function(){
        });
      });
    });
  }
});

router.post('/observerpack/', [upload.fields([])], function(req, res, next){
  console.log(req.body)
  res.redirect('/observerpack/'+req.body.tournamentId);
});

router.get('/telemetry/:telemetryId', function(req, res){
  Tournament.getTelemetry(req.params.telemetryId, function(telemetryData){
    res.json(telemetryData);
  });
});

router.get('/findMatch', function(req, res){
  res.render('findMatch', {title : 'Find match', buttonActive: 'Find match'})
});

module.exports = router;

