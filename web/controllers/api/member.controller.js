/*jshint esversion: 6 */

const api = require('../../utils/api');
const dummy = require('../../utils/dummy');


module.exports = function(app) {
    
    
    /**
     * @api {get} member/ MemberIndex
     * @apiName MemberIndex
     * @apiGroup Member
     */
    app.get('/member', function(req, res) {
        
        api.success(res, "Member Index ...");
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
