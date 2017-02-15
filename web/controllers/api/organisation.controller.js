/*jshint esversion: 6 */

const api = require('../../utils/api');
const dummy = require('../../utils/dummy');

module.exports = function(app) {
    
    
    
    
    
    
    
    /**
     * @api {get} organisations/ OrganisationIndex
     * @apiName OrganisationIndex
     * @apiGroup Organisation
     */
    app.get('/organisations', function(req, res) {
        
        api.success(res, dummy.list.org);
    });
    
    
    
    
    /**
     * @api {post} organisation/add/ OrganisationCreate
     * @apiName OrganisationCreate
     * @apiGroup Organisation
     */
    app.post('/organisation/add', function(req, res) {
        
        req.check({
            'name': {
                in: 'body',
                notEmpty: true,
                isLength: {
                    options: [{ min: 3, max: 50 }],
                    errorMessage: 'Organisation name must be between 3 and 50 characters in length'
                },
                errorMessage: 'Organisation name invalid'
            },
            'description': {
                in: 'body',
                isLength: {
                    options: [{ min: 0, max: 300 }],
                    errorMessage: 'Organisation name must be less than 300 characters in length'
                },
                errorMessage: 'Organisation description invalid'
            },
            'phone': {
                in: 'body',
                notEmpty: true,
                errorMessage: 'Organisation phone invalid'
            },
            'quota': {
                in: 'body',
                notEmpty: true,
                errorMessage: 'Organisation quota invalid'
            }
        });

        req.asyncValidationErrors().then(function() {
            var name = req.params.name;
            var description = req.params.description;
            var phone = req.params.phone;
            var quota = req.params.quota;

            api.success(res, dummy.model.org);
        }, function(errors) {
            api.failure(res, _.map(errors, 'msg'));
        });

        // req.getValidationResult().then(function(result) {
        //     if (!result.isEmpty()) {
        //         api.failure(res, _.map(result.array(), 'msg'));
        //     }
        //     else {
                
        //     }
        // });

    });
    
    app.get('/organisation/add', function(req, res) {
        api.failure(res, 'Please use POST');
    });
    
    
    
    
    /**
     * @api {get} organisation/:id/ OrganisationShow
     * @apiName OrganisationShow
     * @apiGroup Organisation
     */
    app.get('/organisation/:id', function(req, res) {
        
        if (isNaN(req.params.id)) {
            
            api.failure(res, "Invalid Organisation Id");
        }
        else {
            api.success(res, dummy.model.org);
        }
    });
    
    
    
    /**
     * @api {get} organisation/:id/donors/ OrganisationDonorIndex
     * @apiName OrganisationDonorIndex
     * @apiGroup Organisation
     */
    app.get('/organisation/:id/donors', function(req, res) {
        
        if (isNaN(req.params.id)) {
            
            api.failure(res, "Invalid Organisation Id");
        }
        else {
            api.success(res, dummy.list.donor);
        }
    });
    
    
    
    /**
     * @api {get} organisation/:id/members/ OrganisationMemberIndex
     * @apiName OrganisationMemberIndex
     * @apiGroup Organisation
     */
    app.get('/organisation/:id/members', function(req, res) {
        
        if (isNaN(req.params.id)) {
            api.failure(res, "Invalid Organisation Id");
        }
        else {
            api.success(res, dummy.list.member);
        }
    });
    
    
    
    /**
     * @api {post} organisation/:id/donor/add/ OrganisationDonorCreate
     * @apiName OrganisationDonorCreate
     * @apiGroup Organisation
     */
    app.post('/organisation/:id/donor/add', function(req, res) {
        
        api.success(res, dummy.model.donor);
    });
};
