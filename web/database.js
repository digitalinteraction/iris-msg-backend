/*jshint esversion: 6 */


// Imports
const Waterline = require('waterline');
const mysqlAdapter = require('sails-mysql');



console.log(Waterline.Model);



// Database Config
const dbConfig = {
    
    adapters: {
        'default': mysqlAdapter,
        mysql: mysqlAdapter
    },
    
    connections: {
        myLocalDisk: {
          adapter: 'disk'
        },
        
        myLocalMySql: {
            adapter: 'mysql',
            url: process.env.SQL_URL,
        }
    },
      
    defaults: {
        migrate: 'alter'
    }
};



function registerModels(object, orm) {
    
    for (var key in object) {
        
        // If a nested object, register recursively
        if (object[key].constructor === Object) {
            registerModels(object[key], app);
        }
        else {
            
        }
    }
}



module.exports = new Promise(function(resolve, reject) {
    
    // Setup the orm
    const orm = new Waterline();
    
    //  Load our modules
    const models = require('./models');
    
    console.log(models);
    
    console.log('connecting to db ... ');
    resolve();
});
