/*jshint esversion: 6 */

const api = require('../../utils/api');
const dummy = require('../../utils/dummy');


module.exports = function(app) {
    
    
    /*
     *  Member Index route
     */
    app.get('/member', function(req, res) {
        
        api.success(res, "Member Index ...");
    });
    
    
    
    /*
     *  MemberInvite
     */
    app.post('/member/invite', function(req, res) {
        
        api.success(res, "Members invited ...");
    });
};
