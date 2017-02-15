/*jshint esversion: 6 */


// Imports
const express = require('express');
const setupRoutes = require('./router');
const setupDatabase = require('./database');

global._ = require('lodash');



// App
const app = express();

// Setup db ... ?
setupDatabase.then(function(db) {
    
    console.log('connected!');
    setupRoutes(app, db);
    
}, function(error) {
    
    console.log('Couldn\'t connect to db');
    console.log(error);
    // throw error;
});

// Other setup ...

// ...
