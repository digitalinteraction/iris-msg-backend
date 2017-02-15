/*jshint esversion: 6 */


const Waterline = require('waterline');



module.exports = Waterline.Collection.extend({
    identity: 'organisation_members',
    connection: 'mysqlAdapter',

    attributes: {
        
        organisationId: {
            model: 'organisations'
        },
        
        memberId: {
            model: 'members'
        },
        
        role: {
            type: 'string',
            enum: ['ORGANISER', 'DONOR', 'SUBSCRIBER']
        }
    }
});
