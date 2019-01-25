'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const expect      = require('chai').expect;
const cors        = require('cors');
const helmet      = require('helmet');
const MongoClient = require('mongodb').MongoClient;

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
app.use((req, res, next) => {
  console.log(req.path);
  next();
});
*/

//Connect to database
const client = new MongoClient(process.env.DATABASE, { useNewUrlParser: true });

client.connect()
  .then(() => {
    console.log('Successfully connected to database');

    const db = client.db('fcc');

    //Routing for API 
    apiRoutes(app, db);

    //Sample front-end
    app.route('/:project/')
      .get((req, res) => {
        res.sendFile(process.cwd() + '/views/issue.html');
      });


    //Index page (static HTML)
    app.route('/')
      .get((req, res) => {
        res.sendFile(process.cwd() + '/views/index.html');
      });

    //For FCC testing purposes
    fccTestingRoutes(app);

    //404 Not Found Middleware
    app.use((req, res, next) => {
      res.status(404)
        .type('text')
        .send('Not Found');
    });

    //Start our server and tests!
    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
      if(process.env.NODE_ENV==='test') {
        console.log('Running Tests...');
        setTimeout(() => {
          try {
            runner.run();
          } catch(e) {
            const error = e;
              console.log('Tests are not valid:');
              console.log(error);
          }
        }, 3500);
      }
    });
  
  })
  .catch(err => console.error('Database connection error: ' + err));

module.exports = app; //for testing
