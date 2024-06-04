/**
 * 
 * @On(event = { "CREATE" }, entity = "custloyal_csSrv.Redemptions")
 * @param {Object} req - User information, tenant-specific CDS model, headers and query parameters
*/
module.exports = async function(req) {
    const tx = cds.transaction(req);
    const { redeemedAmount, customer_ID } = req.data;

    // Fetch the customer's current total reward points and total redeemed reward points
    const [{ totalRewardPoints, totalRedeemedRewardPoints }] = await tx.run(
        SELECT.from('custloyal_csSrv.Customers')
            .where({ ID: customer_ID })
            .columns('totalRewardPoints', 'totalRedeemedRewardPoints')
    );

    // Check if the customer has enough reward points to redeem
    if (totalRewardPoints < redeemedAmount) {
        req.error(400, 'Insufficient reward points');
        return;
    }

    // Deduct the redeemed amount from the customer's total reward points
    // and add that to his total redeemed points
    const newTotalRewardPoints = totalRewardPoints - redeemedAmount;
    const newTotalRedeemedRewardPoints = totalRedeemedRewardPoints + redeemedAmount;

    // Update the customer's total reward points and total redeemed reward points
    await tx.run(
        UPDATE('custloyal_csSrv.Customers')
            .set({
                totalRewardPoints: newTotalRewardPoints,
                totalRedeemedRewardPoints: newTotalRedeemedRewardPoints
            })
            .where({ ID: customer_ID })
    );
}