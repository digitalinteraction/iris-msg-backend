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
                in: 'params',
                notEmpty: true,
                isInt: {
                    errorMessage: 'Invalid member id format'
                }, 
                errorMessage: 'Member id required'
            }
        });

        req.asyncValidationErrors().then(function() {

            var memberId = req.params.id;
            db.models.members.findOne({id: memberId})
            .exec(function (errors, data){

                if (errors) {
                    api.failure(res, errors);
                    return;
                }
                if (!data) {
                    api.failure(res, ['User not found']);
                    return;
                }

                var member = data;
                var verificationCode = _.random(1000, 9999);

                var now = new Date ();
                var expiryDatetime = new Date ( now );
                expiryDatetime.setMinutes ( now.getMinutes() + 5 );

                var verificationRecord = {
                    memberId: member.id,
                    code: verificationCode,
                    expiresOn: expiryDatetime
                }

                db.models.verifications.create(verificationRecord, function(errors, data){
                    if (errors) {
                        api.failure(res, errors);
                        return;
                    }

                    verificationRecord = data;

                    twilio_account.messages.create({
                        to: member.phone,
                        from: process.env.TWILIO_NUMBER,
                        body: verificationCode
                    }, (error, messageData) => {
                        
                        if (error) {
                            console.log(error);
                        }
                        
                        if (messageData) {
                            verificationRecord.sId = messageData.sid;
                            verificationRecord.save(function(errors){
                                if (errors) {
                                    api.failure(res, errors);
                                    return;
                                } else {
                                    api.success(res, {from: process.env.TWILIO_NUMBER});
                                }
                            });

                        }

                    });
                });

            });
        }, function(errors) {
            api.failure(res, _.map(errors, 'msg'));
            return;
        });
    });


    /**
     * @api {post} member/:id/verify/check MemberVerifyCheck
     * @apiName MemberVerifyCheck 
     * @apiGroup Member
     */
    app.post('/member/:id/verify/check', function(req, res) {

        req.check({
            'id': {
                in: 'params',
                notEmpty: true,
                isInt: {
                    errorMessage: 'Invalid member id format'
                }, 
                errorMessage: 'Member id required'
            },
            'code': {
                in: 'body',
                notEmpty: true,
                isInt: {
                    errorMessage: 'Invalid code format'
                },
                errorMessage: 'Code required'
            }
        });

        req.asyncValidationErrors().then(function() {

            var memberId = req.params.id;
            var code = req.body.code;

            db.models.members.findOne({id: memberId})
            .exec(function (errors, data){

                if (errors) {
                    api.failure(res, errors);
                    return;
                }
                if (!data) {
                    api.failure(res, ['User not found']);
                    return;
                }

                var now = new Date ();
                var expiryDatetime = new Date ( now );
                expiryDatetime.setMinutes ( now.getMinutes() - 5 );

                // user found, check that code is Invalid
                db.models.verifications.findOne({ memberId: memberId, code: code, expiresOn: { '>=': expiryDatetime } })
                .sort('expiresOn DESC')
                .exec(function (errors, data){

                    if (errors) {
                        api.failure(res, errors);
                        return;
                    }

                    if (!data) {
                        api.failure(res, ['Please check you have entered the code correctly']);
                        return;
                    }

                    // user found, update verified verificationRecord
                    data.verifiedOn = new Date ();
                    data.save();

                    api.success(res, {from: process.env.TWILIO_NUMBER});
                    return;
                    
                });
                
            });
        }, function(errors) {
            api.failure(res, _.map(errors, 'msg'));
            return;
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
