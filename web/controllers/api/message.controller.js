/*jshint esversion: 6 */

const api = require('../../utils/api');
const dummy = require('../../utils/dummy');


module.exports = function(app) {
    
    
    /**
     * @api {post} announcement/send/ AnnouncementSend
     * @apiName AnnouncementSend
     * @apiGroup Announcement
     */
    app.post('/announcement/send', function(req, res) {
        
        // TODO: Check params ...
        
        api.success(res, "Announcement sent ...");
    });
    
    
    /**
     * @api {post} message/response/ MessageResponse
     * @apiName MessageResponse
     * @apiGroup Announcement
     */
    app.post('/message/response', function(req, res) {
        
        // TODO: Check params ...
        
        api.success(res, "Response noted ...");
    });
    
    
    /**
     * @api {get} announcement/:id/messages/ Request User information
     * @apiName AnnouncementMessages
     * @apiGroup Announcement
     */
    app.get('/announcement/:id/messages', function(req, res) {
        
        // TODO: Check params ...
        
        api.success(res, dummy.list.message);
    });
};
