/*jshint esversion: 6 */


const Waterline = require('waterline');



module.exports = Waterline.Collection.extend({
    identity: 'verifications',
    connection: 'mysqlAdapter',

    attributes: {
        
        memberId: {
            type: 'integer',
            required: true
        },
        
        code: {
            type: 'string'
        },

        verifiedOn: {
            type: 'datetime'
        },

        exiresOn: {
            type: 'datetime'
        },

        sId: {
            type: 'string'
        }
    }
});
