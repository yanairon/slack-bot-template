'use strict';
const validateMessage = require('../middlewares/security');
const dal = require('../dal/customersData');

function customersData(app) {
    app.post(`/customersData`,
        validateMessage,
        async (req, res) => {
            // each word can be an argument to your command, like a name of a customer, for example
            const args = req.body.text.trim().split(' ');
            const customerName = args[0];

            const response = await dal.getCustomerData(customerName);

            res.json(response);
        });
}

module.exports = customersData;
