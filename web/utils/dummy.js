/*jshint esversion: 6 */

module.exports = {
    
    model: {
        org: {
            id: 1,
            name: 'Solidary Greek Movement',
            desc: 'Nulla vitae elit libero, a pharetra augue. Nullam id dolor id nibh ultricies vehicula ut id elit. Donec ullamcorper nulla non metus auctor fringilla.',
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
                id: 2,
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
        ]
    }
};
