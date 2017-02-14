/*jshint esversion: 6 */

const api = require('../../utils/api');
const dummy = require('../../utils/dummy');


module.exports = function(app) {
    
    
    /**
     *  AnnouncementSend
     */
    app.post('/announcement/send', function(req, res) {
        
        // TODO: Check params ...
        
        api.success(res, "Announcement sent ...");
    });
    
    
    /**
     *  MessageResponse
     */
    app.post('/message/response', function(req, res) {
        
        // TODO: Check params ...
        
        api.success(res, "Response noted ...");
    });
    
    
    app.get('/announcement/:id/messages', function(req, res) {
        
        api.success(res, dummy.list.message);
    });
};
