var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Item = require('../models/item');
var Tournament = require('../models/tournament');
var Event = require('../models/event');
var Gamer = require('../models/gamer');
var multer = require('multer');
var upload = multer();
var fs = require('fs');
var JSZip = require('jszip')
var request = require('request');
var fetch = require('node-fetch');


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

router.get('/testApi', function(req, res){
  Gamer.test().then(function(data){
    res.render('test', {data: data});
  });
});


router.get('/score/:nbg/:div?/:type?/:colorCode?',function(req, res, next){
  if(req.params.div && req.params.nbg){
    let type = req.params.type || 'all';
    let rgbtable = ['','','','','','','','','','','','','','','','','','','',''];
    
    let code = req.params.colorCode
    if(code){
      let aryColor = code.split('');
      for(let i=0;i<=aryColor.length-1;i++){
        let color = '';
        switch(aryColor[i].toLowerCase()){
          case 'g':
            color = 'green';
            break;
          case 'b':
            color = 'blue';
            break;
          case 'n':
            color = 'neutral';
            break;
          case 'y':
            color = 'yellow';
            break;
          case 'r':
            color = 'red';
            break;
          case '1':
            color = 'gold';
            break;
          case '2':
            color = 'silver';
            break;
          case '3':
            color = 'bronze';
            break;
          default:
            color = 'neutral'
        }
        rgbtable[i] = color;
      }
    }
    
    Gamer.divisionStats(req.params.nbg, req.params.div).then(function(lists){
      res.render('nbg', {title: 'NBG', lists: lists, type: type, rgbtable: rgbtable});
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
      Gamer.signup(groups[gnr], res).then(function(signup){
        
      });
      /*Gamer.rounds(groups[gnr]).then(function(rounds){
        Gamer.round(rounds[0], res).then(function(){
        });
      });*/
    });
  }
});

router.post('/observerpack/', [upload.fields([])], function(req, res, next){
  res.redirect('/observerpack/'+req.body.tournamentId);
});

router.get('/forsent/:tournamentId?', function(req, res){
  let id = req.params.tournamentId;
  
  if(!id){
    res.render('forsent');
  }else{
    res.render('forsent', {id:id});
  }
})

router.post('/forsent/', [upload.fields([])], function(req, res, next){
  res.redirect('/forsent/'+req.body.tournamentId);
});

router.post('/gamer/forsent/', [upload.fields([])], function(req, res){
  let id = req.body.tournamentId;
  let date = req.body.date;

  Gamer.tables(id, date).then(function(lateJoins){
    res.render('forsent', {id:id, date:date, lateJoins:lateJoins});
  });
});


router.get('/telemetry/:telemetryId', function(req, res){
  Tournament.getTelemetry(req.params.telemetryId, function(telemetryData){
    if(telemetryData == 'Error') res.send()
    else res.json(telemetryData);
  });
});

router.get('/findMatch', function(req, res){
  res.render('findMatch', {title : 'Find match', buttonActive: 'Find match'})
});

router.get('/item', function(req, res){
  res.render('item');
});

router.get('/items/:filter', function(req, res){
  let code = req.query.code;
  if(code){
    
  }
  let filter = req.params.filter;
  Item.getItems(filter, function(err, items){
    res.json(items);
  });
});

router.post('/item', [upload.fields([])], function(req, res){
  let id = req.body.id;
  let name = req.body.name;
  let drop = req.body.drop;
  let slot = req.body.slot;
  
  console.log(id);
  
  var newItem = new Item({
    id:id,
    name:name,
    drop:drop,
    slot:slot
  });
  
  Item.add(newItem, function(){
    Item.getItems(function(err, items){
      res.render('item',{items:items});
    });
  });
});

module.exports = router;

