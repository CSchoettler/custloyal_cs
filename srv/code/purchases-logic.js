/**
 * 
 * @On(event = { "CREATE" }, entity = "custloyal_csSrv.Purchases")
 * @param {Object} request - User information, tenant-specific CDS model, headers and query parameters
*/
module.exports = async function(request) {
    // Calculate reward points
    request.data.rewardPoints = Math.floor(request.data.purchaseValue / 10);

    // Update the related customer's total purchase value and total reward points
    const customer = await SELECT.one.from('custloyal_csSrv.Customers').where({ ID: request.data.customer_ID });
    if (customer) {
        const updatedCustomer = {
            totalPurchaseValue: customer.totalPurchaseValue + request.data.purchaseValue,
            totalRewardPoints: customer.totalRewardPoints + request.data.rewardPoints
        };
        await UPDATE('custloyal_csSrv.Customers').set(updatedCustomer).where({ ID: request.data.customer_ID });
    } else {
        throw new Error('Customer not found');
    }
}