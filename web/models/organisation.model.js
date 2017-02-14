/*jshint esversion: 6 */


const Waterline = require('waterline');



module.exports = Waterline.Model.extend({
    identity: 'user',
    connection: 'mysql',

    attributes: {
        name: 'string',
        description: 'string'
    }
});
