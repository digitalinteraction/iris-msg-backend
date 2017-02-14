/*jshint esversion: 6 */


// Imports
const express = require('express');
const setupRoutes = require('./router');
const setupDatabase = require('./database');





// App
const app = express();


// Setup db ... ?
setupDatabase.then(function(something) {
    
    console.log('connected!');
    setupRoutes(app);
    
}, function(error) {
    
    console.log('Couldn\'t connect to db');
    console.log(error);
    // throw error;
});

// Other setup ...

// ...
