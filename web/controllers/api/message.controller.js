/*jshint esversion: 6 */

const api = require('../../utils/api');
const dummy = require('../../utils/dummy');

const firebase = require('firebase-admin');



module.exports = function(app) {
    
    
    
    // Load our secrets file & setup firebase
    const serviceAccount = require('../../secrets/firebase.json');
    firebase.initializeApp({
        credential: firebase.credential.cert(serviceAccount),
        databaseURL: "https://sms-relay-a42ab.firebaseio.com"
    });
    
    
    
    
    /**
     * @api {post} announcement/send/ AnnouncementSend
     * @apiName AnnouncementSend
     * @apiGroup Announcement
     */
    app.post('/announcement/send', function(req, res) {
        
        // TODO: Check params ...
        
        
        
        
        // A static token for now
        var token = process.env.FRB_TEST_TOKEN;
        
        
        // Define the payload of our message
        var payload = {
            data: {
                id: '1',
            }
        };
        
        // Define the options of the message
        var options = {
            priority: "high",
            timeToLive: 60 * 60 * 24
        };
        
        // api.success(res, "Announcement Sent ...");
        
        
        // Send the message
        firebase.messaging().sendToDevice(token, payload, options)
            .then(function(response) {
        
                api.success(res, response);
            })
            .catch(function(error) {
                console.log("Error sending message:", error);
                api.failure(res, "Announcement Failed!");
            });
        
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
