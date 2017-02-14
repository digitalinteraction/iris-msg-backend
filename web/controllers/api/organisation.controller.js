/*jshint esversion: 6 */

const api = require('../../utils/api');
const dummy = require('../../utils/dummy');

module.exports = function(app) {
    
    
    
    
    
    
    
    /**
     * @api {get} /organisations OrganisationIndex
     * @apiName OrganisationIndex
     * @apiGroup Organisation
     */
    app.get('/organisations', function(req, res) {
        
        api.success(res, dummy.list.org);
    });
    
    
    
    
    /**
     * @api {post} /organisation/add OrganisationCreate
     * @apiName OrganisationCreate
     * @apiGroup Organisation
     */
    app.post('/organisation/add', function(req, res) {
        
        var orgId = req.params.orgId;
        
        api.success(res, dummy.model.org);
    });
    
    app.get('/organisation/add', function(req, res) {
        api.failure(res, 'Please use POST');
    });
    
    
    
    
    /**
     * @api {get} /organisation/:id OrganisationShow
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
     * @api {get} /organisation/:id/donors OrganisationDonorIndex
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
     * @api {get} /organisation/:id/members OrganisationMemberIndex
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
     * @api {post} /organisation/:id/donor/add OrganisationDonorCreate
     * @apiName OrganisationDonorCreate
     * @apiGroup Organisation
     */
    app.post('/organisation/:id/donor/add', function(req, res) {
        
        api.success(res, dummy.model.donor);
        
    });
};
