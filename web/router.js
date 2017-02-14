/*jshint esversion: 6 */


// Constants
const PORT = 80;


function configureRouter(object, app) {
    
    for (var key in object) {
        
        // If a nested object, add it recursively
        if (object[key].constructor === Object) {
            configureRouter(object[key], app);
        }
        else {
            object[key](app);
        }
    }
}


module.exports = function(app) {
    
    // Configure routes from the controllers
    const routes = require('./controllers');
    configureRouter(routes, app);
    
    
    
    
    // Start app
    app.listen(PORT);
    console.log('Running on http://localhost:' + PORT);
};
