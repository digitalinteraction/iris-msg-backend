/*jshint esversion: 6 */

const _ = require('lodash');

module.exports = {
    
    success: function(res, data) {
        
        res.send({
            meta: {
                success: true,
                messages: []
            },
            data: data
        });
    },
    
    failure: function(res, messages) {
        
        if (!_.isArray(Array)) {
            messages = [messages];
        }
        
        res.status(404).send({
            meta: {
                success: false,
                messages: messages
            }
        });
    },
    
};
