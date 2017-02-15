/*jshint esversion: 6 */


// Imports
const _ = require('lodash');
const Waterline = require('waterline');
const mysqlAdapter = require('sails-mysql');
const dummyModel = require('./utils/dummyModel');




// Database Config
const dbConfig = {
    
    adapters: {
        'default': mysqlAdapter,
        mysql: mysqlAdapter
    },
    
    connections: {
        
        mysqlAdapter: {
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
        
        orm.loadCollection(object[key]);
    }
}



module.exports = new Promise(function(resolve, reject) {
    
    
    var org = require('./models/organisation.model.js');
    
    
    // Setup the orm
    var orm = new Waterline();
    
    
    //  Load our models
    registerModels(require('./models'), orm);
    
    
    // initialize the orm
    orm.initialize(dbConfig, function(error, models) {
        
        if(error) {
            reject(error);
        }
        
        
        //
        //
        // models.collections.organisations.destroy({}).exec(function(error){
        //     if (error) {
        //         reject(error);
        //     }
        //
        //     models.collections.organisations.create(dummyModel.organisation, function(error){
        //         if (error) reject(error);
        //     });
        // });
        //
        // models.collections.members.destroy({}).exec(function(error){
        //     if (error) {
        //         reject(error);
        //     }
        //
        //     models.collections.members.create(dummyModel.member, function(error){
        //         if (error) reject(error);
        //     });
        // });
        //
        // models.collections.organisation_members.destroy({}).exec(function(error){
        //     if (error) {
        //         console.log(error);
        //     }
        //
        //     models.collections.organisation_members.create(dummyModel.organisationMember, function(error){
        //         if (error) reject(error);
        //     });
        // });
        
        resolve({
            orm: orm,
            models: models.collections,
            connections: models.connections
        });
    });
});
