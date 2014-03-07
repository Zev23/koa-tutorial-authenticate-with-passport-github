"use strict"

const
  Router = require('koa-router'),
  passport = require('./auth'),

  koa = require('koa'),
  app = koa();


//Middleware: request logger
function *reqlogger(next){
  console.log('%s - %s %s',new Date().toISOString(), this.req.method, this.req.url);
  yield next;
}
app.use(reqlogger);

//Initialize passport
app.use(passport.initialize());

app.use(Router(app));

app.get('/', function *(){
  console.log('Express-style example');
  this.body = "This is root page ('/')";
});



const publicRouter = new Router();

//Configure /auth/github & /auth/github/callback
publicRouter.get('/auth/github', passport.authenticate('github', {scope: ['user','repo']}));
publicRouter.get('/auth/github/callback',
  passport.authenticate('github', {successRedirect:'/', failureRedirect: '/'})
);

app.use(publicRouter.middleware());



//Secures routes
const securedRouter = new Router();

//Middleware: authed
function *authed(next){
  if (this.req.isAuthenticated()){
    yield next;
  } else {
    this.redirect('/auth/github');
  }
}

securedRouter.get('/app', authed, function *(){
  this.body = 'Secured Zone: koa-tutorial\n' + JSON.stringify(this.req.user, null, '\t');
});

app.use(securedRouter.middleware());

app.use(function *(){
  this.body = 'Hello World';
});

app.listen(3000);
