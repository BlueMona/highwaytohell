const Promise = require('bluebird');
const crypto = require('crypto');
const logger = require('../lib/logger.js')('login-internals');
const redisToken = require('../lib/redisToken.js')();

module.exports = (cassandra, request, emailaddr, password) => {
	return new Promise ((resolve, reject) => {
		let pwHash = crypto.createHash('sha256').update(password).digest('hex');
		let validUser = "SELECT uuid, pwhash, username, confirmcode FROM users WHERE emailaddress = '" + emailaddr + "'";
		cassandra.execute(validUser)
		    .then((resp) => {
			    if (resp.rows !== undefined && resp.rows[0] !== undefined && resp.rows[0].pwhash !== undefined) {
				let clientIP = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
				let userId = resp.rows[0].uuid;
				if (resp.rows[0].confirmcode !== "true") {
				    reject('email not confirmed yet');
				} else if ((Buffer.compare(Buffer.from(pwHash), Buffer.from(resp.rows[0].pwhash))) === 0) {
				    let check2fa = "SELECT enabled FROM twofa WHERE uuid = '" + userId + "'";
				    cassandra.execute(check2fa)
					.then((nresp) => {
						let logConnection = "INSERT INTO logins (uuid, clientip, time, succeeded) VALUES ('" + userId +"', '" + clientIP + "', '" + Date.now() + "', true);"
						if (nresp.rows !== undefined && nresp.rows[0] !== undefined && nresp.rows[0].enabled === true) {
						    redisToken.getToken('2fa:' + userId, false)
							.then((ourToken) => {
								if (ourToken === clientIP) {
								    cassandra.execute(logConnection)
									.then((log) => { resolve(resp.rows[0]); })
									.catch((e) => {
										logger.error('failed logging connection from ' + clientIP + ' for ' + userId);
										resolve(resp.rows[0]);
									    });
								} else { reject({ reason: '2FA', userid: resp.rows[0].uuid }); }
							    })
							.catch((e) => { reject({ reason: '2FA', userid: resp.rows[0].uuid }); });
						} else {
						    cassandra.execute(logConnection)
							.then((log) => { resolve(resp.rows[0]); })
							.catch((e) => {
								logger.error('failed logging connection from ' + clientIP + ' for ' + userId);
								resolve(resp.rows[0]);
							    });
						}
					    })
					.catch((e) => { reject('failed querying cassandra for 2fa'); });
				} else {
				    let logConnection = "INSERT INTO logins (uuid, clientip, time, succeeded) VALUES ('" + userId +"', '" + clientIP + "', '" + Date.now() + "', false);"
				    cassandra.execute(logConnection)
					.then((log) => { reject('wrong password'); })
					.catch((e) => {
						logger.error('failed logging failed connection from ' + clientIP + ' for ' + userId);
						reject('wrong password');
					    });
				}
			    } else { reject('no such user'); }
			})
		    .catch((e) => { reject('failed querying cassandra'); });
	    });
    };
