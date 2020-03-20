'use strict';

async function getCustomerData(customerName) {
    // Here you';ll fetch your data from your internal DBs
    return `Data for customer ${customerName}`;
}

module.exports = {getCustomerData};
