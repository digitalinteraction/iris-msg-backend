/*jshint esversion: 6 */

module.exports = {
    
    model: {
        org: {
            id: 1,
            name: 'Solidary Greek Movement',
            description: 'Nulla vitae elit libero, a pharetra augue. Nullam id dolor id nibh ultricies vehicula ut id elit. Donec ullamcorper nulla non metus auctor fringilla.',
            members: 7,
            donors: 42,
            messages: 1337,
        },
        donor: {
            id: 1,
            name: "Geoff Testington",
            quota: 200,
            number: "0123456789",
        }
    },
    
    list: {
        org: [
            {
                id: 1,
                name: 'Solidary Greek Movement'
            },
            {
                id: 2,
                name: 'Greek Solidary Movement'
            },
            {
                id: 3,
                name: 'Movement of Greek Solidarity'
            }
        ],
        
        donor: [
            {
                id: 1,
                name: "Geoff Testington",
                quota: 200,
                number: "0123456789",
            },
            {
                id: 2,
                name: "Dave Phillips",
                quota: 50,
                number: "1098765432",
            }
        ],
        
        member: [
            {
                id: 1,
                name: "Timmy Matthews",
                number: "0123456789",
            },
            {
                id: 2,
                name: "Leeroy Jenkins",
                number: "1098765432",
            }
        ],
        
        message: [
            {
                id: 1,
                body: "Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Cras justo odio, dapibus ac facilisis in, egestas eget quam.",
                recipient: "+447769774859"
            },
            {
                id: 2,
                body: "Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Cras justo odio, dapibus ac facilisis in, egestas eget quam.",
                recipient: "+447783109327"
            }
            
        ]
    }
};
