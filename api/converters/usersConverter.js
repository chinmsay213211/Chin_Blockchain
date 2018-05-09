const hasher = require('./hasher');


exports.convertToChaincode = function (data) {
    const hash = hasher.create(data["_id"]);

    const companyHash = hasher.create(data["company_id"]);

    let publicKeyHashes = [];
    if (data['public_keys'] !== 'undefined' && data['public_keys']) {
        for (let i = 0; i < data['public_keys'].length; i++) {
            publicKeyHashes[i] = data['public_keys'][i];
        }
    }

    let managerUserHashes = [];
    if (data['manager_user_ids'] !== 'undefined' && data['manager_user_ids']) {
        for (let i = 0; i < data['manager_user_ids'].length; i++) {
            managerUserHashes[i] = data['manager_user_ids'][i];
        }
    }

    return {
        Hash: hash,
        FirstName: data["first_name"],
        LastName: data["last_name"],
        Email: data["email"],
        Role: data['role'],
        CompanyHash: companyHash,
        PhoneNumber: data["phone_number"],
        InvitationCode: data["invitation_code"],
        PublicKeysHashes: publicKeyHashes,
        ManagerUserHashes: managerUserHashes,
        Timestamp: data['timestamp'].getTime()
    };
};

exports.convertToMongo = function (data) {

};
