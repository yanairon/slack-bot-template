'use strict';

async function getCustomerData(customerName) {
    // Here you'll fetch your data from your internal DBs etc.
    // The command have to return in 3 seconds, so you might want to implement some caching mechanism
    return `Data for customer ${customerName}`;
}

module.exports = {getCustomerData};
