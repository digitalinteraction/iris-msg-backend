/*jshint esversion: 6 */

const api = require('../../utils/api');
const dummy = require('../../utils/dummy');

module.exports = function(app) {
    
    
    
    
    
    
    
    /*
     *  OrganisationIndex
     */
    app.get('/organisations', function(req, res) {
        
        api.success(res, dummy.list.org);
    });
    
    
    
    
    /*
     *  OrganisationCreate
     */
    app.post('/organisation/add', function(req, res) {
        
        var orgId = req.params.orgId;
        
        api.success(res, dummy.model.org);
    });
    
    app.get('/organisation/add', function(req, res) {
        api.failure(res, 'Please use POST');
    });
    
    
    
    
    /*
     *  OrganisationShow
     */
    app.get('/organisation/:id', function(req, res) {
        
        if (isNaN(req.params.id)) {
            
            api.failure(res, "Invalid Organisation Id");
        }
        else {
            api.success(res, dummy.model.org);
        }
    });
    
    
    
    /*
     *  OrganisationDonorIndex
     */
    app.get('/organisation/:id/donors', function(req, res) {
        
        if (isNaN(req.params.id)) {
            
            api.failure(res, "Invalid Organisation Id");
        }
        else {
            api.success(res, dummy.list.donor);
        }
    });
    
    
    
    /*
     *  OrganisationMemberIndex
     */
    app.get('/organisation/:id/members', function(req, res) {
        
        if (isNaN(req.params.id)) {
            api.failure(res, "Invalid Organisation Id");
        }
        else {
            api.success(res, dummy.list.member);
        }
    });
    
    
    
    /*
     *  OrganisationDonorCreate
     */
    app.post('/organisation/:id/donor/add', function(req, res) {
        
        api.success(res, dummy.model.donor);
        
    });
};
