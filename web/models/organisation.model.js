/*jshint esversion: 6 */


const Waterline = require('waterline');



module.exports = Waterline.Collection.extend({
    identity: 'user',
    connection: 'mysql',

    attributes: {
        name: 'string',
        description: 'string'
    }
});
