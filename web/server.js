/*jshint esversion: 6 */

(function(express) {
    'use strict';
    
    // Constants
    const PORT = 80;
    
    // App
    const app = express();
    app.get('/', function (req, res) {
        res.send('<h1>SMS Relay Server</h1>');
    });
    
    
    // Start app
    app.listen(PORT);
    console.log('Running on http://localhost:' + PORT);
    
})(require('express'));
