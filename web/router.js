/*jshint esversion: 6 */


// Imports
const _ = require('lodash');
const api = require('./utils/api');
const dummy = require('./utils/dummy');


// Constants
const PORT = 80;


function configureRouter(object, app, db) {
    
    for (var key in object) {
        
        // If a nested object, add it recursively
        if (object[key].constructor === Object) {
            configureRouter(object[key], app, db);
        }
        else if (_.isFunction(object[key])){
            object[key](app, db);
        }
    }
}


module.exports = function(app, db) {
    
    // Enable cross-origin stuff
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        next();
    });
    
    
    
    // Configure routes from the controllers
    const routes = require('./controllers');
    configureRouter(routes, app, db);
    
    
    
    // Configure error pages
    app.use(function(req, res, next){
        api.failure(res, 'Endpoint not found', req.url);
    });
    
    
    
    
    // Start app
    app.listen(PORT);
    console.log('Running on http://localhost:' + PORT);
};
