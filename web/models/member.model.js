/*jshint esversion: 6 */


const Waterline = require('waterline');



module.exports = Waterline.Collection.extend({
    identity: 'members',
    connection: 'mysqlAdapter',

    attributes: {
        
        name: {
            type: 'string',
            required: true
        },
        
        phone: {
            type: 'string',
            required: true
        }
    }
});
