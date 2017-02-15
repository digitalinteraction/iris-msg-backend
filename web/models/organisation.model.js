/*jshint esversion: 6 */


const Waterline = require('waterline');



module.exports = Waterline.Collection.extend({
    identity: 'organisations',
    connection: 'mysqlAdapter',

    attributes: {
        name: 'string',
        description: 'string'
    }
});
