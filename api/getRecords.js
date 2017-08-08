const Promise = require('bluebird');

module.exports = (cassandra, domain, record) => {
	return new Promise ((resolve, reject) => {
		let queryRecords = "SELECT * FROM records WHERE origin = '" + domain + "' and name = '" + record + "' AND type in ('A', 'CNAME', 'TXT', 'MX', 'SOA', 'PTR', 'NS', 'AAAA')";
			    /*FIXME: maybe remove type from PK?*/
		cassandra.execute(queryRecords)
		    .then((resp) => {
			    if (resp.rows !== undefined) { resolve(resp.rows);
			    } else { resolve([]); }
			})
		    .catch((e) => { reject('failed querying cassandra'); });
	    });
    };
