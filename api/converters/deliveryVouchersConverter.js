const hasher = require('./hasher');

exports.convertToChaincode = function (data) {
    const hash = hasher.create(data["_id"]);

    const deliverToCompanyHash = hasher.create(data["deliver_to_company_id"]);

    let managerUserHashes = [];
    if (data["manager_user_ids"] !== 'undefined' && data["manager_user_ids"]) {
        for (let i = 0; i < data["manager_user_ids"].length; i++) {
            managerUserHashes[i] = hasher.create(data["manager_user_ids"][i]);
        }
    }

    const orderTransportationHash = hasher.create(data["order_transportation_id"]);

    const driverUserHash = hasher.create(data["driver_user_id"]);

    const truckHash = hasher.create(data["truck_id"]);

    const confirmedByManagerUserHash = hasher.create(data["confirmed_by_manager_user_id"]);

    return {
        Hash: hash,
        Number: data["number"],
        DeliveryToCompanyHash: deliverToCompanyHash,
        ManagerUserHash: managerUserHashes,
        OrderTransportationHash: orderTransportationHash,
        Drops: data["drops"] ,
        DriverUserHash: driverUserHash,
        TruckHash: truckHash,
        OpeningKm: data["opening_km"],
        ClosingKm: data["closing_km"],
        TotalKm: data["total_km"],
        time_start: new Date().getTime(),
        time_end: new Date().getTime(),
        WorkingHours: data["working_hours"],
        DrivingHours: data["driving_hours"],
        RestHours: data["rest_hours"],
        PdnNumber: data["pdn_number"],
        delivery_status: data["delivery_status"],
        ConfirmedByManagerUserHash: confirmedByManagerUserHash,
        ClientSignatureImage: data["client_signature_image"],
        ClientSignedDvPhoto: data["client_signed_dv_photo"],
        ClientBadgePhoto: data["client_badge_photo"],
        Timestamp: new Date().getTime()
    };
};

exports.convertToMongo = function (data) {

};
