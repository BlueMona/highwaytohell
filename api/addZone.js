const Promise = require('bluebird');
const drv = require('cassandra-driver');
const defaultPool = process.env.HWTH_POOL || 'default';
const defaultBackupPool = process.env.HWTH_BACKUP_POOL || 'default';

module.exports = (cassandra, userId, domainName) => {
	return new Promise ((resolve, reject) => {
		let checkConflict = "SELECT * FROM zones WHERE origin = '" + domainName + "'";
		let insertDomain = "INSERT INTO zones (origin, nspool, bkppool, serial) VALUES " +"('" + domainName + "', '" + defaultPool + "', '" + defaultBackupPool + "', '42')";
		let setPerms = "INSERT INTO rbaclookalike (domain, uuid, role) VALUES ('" + domainName + "', '" + userId + "', 'admin')";
		cassandra.execute(checkConflict, [], { consistency: drv.types.consistencies.localQuorum })
		    .then((cflt) => {
			    if (cflt.rows !== undefined && cflt.rows[0] !== undefined && cflt.rows[0].idowner !== false) {
				if (userId === cflt.rows[0].idowner) { reject('zone already exists') }
				else { reject('zone was already registered') }
			    } else {
				    cassandra.execute(insertDomain, [], { consistency: drv.types.consistencies.localQuorum })
					.then((resp) => {
						cassandra.execute(setPerms, [], { consistency: drv.types.consistencies.localQuorum })
						    .then((perms) => { resolve('domain ' + domainName + ' created'); })
						    .catch((e) => { reject('failed setting domain permissions to cassandra'); });
					    })
					.catch((e) => { reject('failed adding domain to cassandra'); });
			    }
			})
		    .catch((e) => { reject('failed querying cassandra'); });
	    });
    };
