const Promise = require('bluebird');
const drv = require('cassandra-driver');

module.exports = (cassandra, userId, filter) => {
	return new Promise ((resolve, reject) => {
		let buildList = "SELECT domain FROM rbaclookalike WHERE uuid = '" + userId + "'";
		let queryDomain = "SELECT * FROM zones WHERE origin ";
		cassandra.execute(buildList, [], { consistency: drv.types.consistencies.one })
		    .then((lst) => {
			    if (lst.rows !== undefined && lst.rows[0] !== undefined) {
				let domains = [];
				for (let k = 0; k < lst.rows.length; k++) { domains.push(lst.rows[k].domain); }
				if (domains.length > 0) {
				    if (filter !== undefined && typeof filter === "string") {
					if (domains.indexOf(filter) >= 0) {
					    queryDomain += "= '" + filter + "'";
					} else { reject('not authorized to manage ' + filter + ' - may not exist'); }
				    } else { queryDomain += "IN ('" + domains.join("', '") + "')"; }
				    cassandra.execute(queryDomain, [], { consistency: drv.types.consistencies.one })
					.then((resp) => {
						if (resp.rows !== undefined) { resolve(resp.rows); }
						else { reject('invalid cassandra response'); }
					    })
					.catch((e) => { reject('failed querying cassandra'); });
				} else { resolve([]); }
			    } else { resolve([]); }
			})
		    .catch((e) => { reject('failed querying cassandra for domains list'); });
	    });
    };
