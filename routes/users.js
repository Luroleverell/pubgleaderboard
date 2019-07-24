var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer(); 
var User = require('../models/user');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var LocalStrategy = require('passport-local').Strategy;
var validation = require('../models/validation');
var passport = require('passport');
var {check, body, validationResult} = require('express-validator/check');

/* GET users listing. */
router.get('/register', function(req, res, next) {
  res.render('register',{title: 'Register', buttonActive: 'Register'});
});

router.post('/register',[
  upload.fields([]), 
  check('username').custom(function(value){
    return findUserByUsername(value).then(function(User){})  
  }),
  check('email').custom(function(value){
    return findUserByEmail(value).then(function(User){})
  })
  ], function(req, res, next){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      res.render('register',{
        errors: errors.array(),
        email : req.body.email,
        username : req.body.username
      });
    }else{
      var newUser = new User ({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
      });
      
      User.createUser(newUser, function(err, user){
        if(err) throw err;
      })
      
      req.flash('success', 'You are now registered and can log in');
      
      res.location('/');
      res.redirect('/');
    }
  });

router.get('/login', function(req, res, next) {
  res.render('login',{title: 'Login', buttonActive: 'Log in'});
});

router.post('/login',
  passport.authenticate('local', {failureRedirect: '/users/login', failureFlash: 'Invalid username or password'}),
  function(req, res) {
      req.flash('success', 'You are now logged in');
      res.redirect('/');
  });

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

 
passport.use(new LocalStrategy(function(username, password, done){
  passReqToCallback: true,
  User.getUserByUsername(username, function(err, user){
    if (err) throw err;
    if (!user){
      return done(null, false, {message: 'Unknown user'})
    }
    
    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null, user);
      }else{
        return done(null, false, {message: 'Invalid password'});
      }
    });
  });
}));

router.get('/logout', function(req, res) {
  req.logout();
  req.flash('alert', 'You are now logged out');
  req.session = null;
  res.redirect('/users/login');
});

router.get('/getUser', function(req, res){
  res.json(req.user || '');
})


function findUserByUsername(username){
  if(username){
    return new Promise(function(resolve, reject){
      User.findOne({username: username}).exec(function(err, doc){
        if (err) return reject(err)
        if (doc) return reject(new Error('This username is allready taken!'))
        else return resolve(username)
      })
    })
  }
}

function findUserByEmail(email){
  if(email){
    return new Promise(function(resolve, reject){
      User.findOne({email: email}).exec(function(err, doc){
        if (err) return reject(err)
        if (doc) return reject(new Error('This email is allready taken!'))
        else return resolve(email)
      })
    })
  }
}    
  
module.exports = router;
