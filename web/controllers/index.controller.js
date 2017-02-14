/*jshint esversion: 6 */


module.exports = function(app) {
    
    /**
     * @api {get} / Api Status
     * @apiName ApiIndex
     * @apiGroup General
     */
    app.get('/', function(req, res) {
        
        res.send({
            meta: {
                success: 1,
                messages: []
            },
            data: {
                msg: 'SMS Relay Server v0',
                status: 'wip'
            }
        });
    });
};
