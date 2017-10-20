const Promise = require('bluebird');
const drv = require('cassandra-driver');

module.exports = (cassandra, domainName, perm) => {
	return new Promise ((resolve, reject) => {
		if (perm.thirdParty.indexOf('@') > 0) {
		    let getRemoteId = "SELECT uuid FROM users where emailaddress = '" + perm.thirdParty + "'";
		    cassandra.execute(getRemoteId, [], { consistency: drv.types.consistencies.localQuorum })
			.then((usr) => {
				if (usr.rows !== undefined && usr.rows[0] !== undefined) {
				    if (usr.rows[0].uuid !== perm.settingUser) {
					let dropPerms = "DELETE FROM rbaclookalike WHERE domain = '" + domainName + "' AND uuid = '" + usr.rows[0].uuid + "'";
					cassandra.execute(dropPerms, [], { consistency: drv.types.consistencies.localQuorum })
					    .then((resp) => { resolve(true); })
					    .catch((e) => { reject('failed dropping from cassandra'); });
				    } else { reject('can not change permissions for yourself'); }
				} else { reject('could not find user ' + perm.thirdParty); }
			    })
			.catch((e) => { reject('failed querying cassandra for third party user ID'); });
		} else if (perm.thirdParty !== perm.settingUser) {
		    let dropPerms = "DELETE FROM rbaclookalike WHERE domain = '" + domainName + "' AND uuid = '" + perm.thirdParty + "'";
		    cassandra.execute(dropPerms, [], { consistency: drv.types.consistencies.localQuorum })
			.then((resp) => { resolve(true); })
			.catch((e) => { reject('failed dropping from cassandra'); });
		} else { reject('can not change permissions for yourself'); }
	    });
    };
