/*jshint esversion: 6 */

const api = require('../utils/api');
const dummy = require('../utils/dummy');


module.exports = function(app) {
    
    /**
     * @api {get} / Api Status
     * @apiName ApiIndex
     * @apiGroup General
     */
    app.get('/', function(req, res) {
        
        api.success(res, {
            msg: 'SMS Relay Server v0',
            status: 'wip'
        });
    });
    
    
    
    /*
     *  Setup routes for apidocs
     */
    app.use('/docs', require('express').static('api'));
};
