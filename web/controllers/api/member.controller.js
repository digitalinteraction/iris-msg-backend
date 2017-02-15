/*jshint esversion: 6 */

const api = require('../../utils/api');
const dummy = require('../../utils/dummy');
const client = require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_SECRET);
var twilio_account = client.accounts(process.env.TWILIO_ACCOUNT_SID);

module.exports = function(app, db) {
    
    
    /**
     * @api {get} member/ MemberIndex
     * @apiName MemberIndex
     * @apiGroup Member
     */
    app.get('/member', function(req, res) {
        
        api.success(res, "Member Index ...");
    });

    /**
     * @api {post} member/:id/verify/request MemberVerifyRequest
     * @apiName MemberVerifyRequest 
     * @apiGroup Member
     */
    app.post('/member/:id/verify/request', function(req, res) {

        req.check({
            'id': {
                in: 'body',
                notEmpty: true,
                isInt : {
                    errorMessage: 'Invalid member id format'
                }, 
                errorMessage: 'Member id invalid'
            }
        });

        req.asyncValidationErrors().then(function() {
            api.success(res, "Member Index ...");

            var verificationCode = _.random(1000, 9999);

            // twilio_account.messages.create({
            //     to: phone,
            //     from: process.env.TWILIO_NUMBER,
            //     body: verificationCode
            // }, (err, messageData) => {
            //     // print SID of the message you just sent
            //     console.log(err);
            //     console.log(messageData.sid);
            // });

            api.success(res, dummy.model.org);
        }, function(errors) {
            api.failure(res, _.map(errors, 'msg'));
        });
    });
    
    
    
    /**
     * @api {post} member/invite/ MemberInvite
     * @apiName MemberInvite
     * @apiGroup Member
     */
    app.post('/member/invite', function(req, res) {
        
        api.success(res, "Members invited ...");
    });
};
