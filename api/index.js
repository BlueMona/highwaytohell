const routerObject = {
	addContact: require('./addContact.js'),
	addHealthCheck: require('./addHealthCheck.js'),
	addNotification: require('./addNotification.js'),
	addPermission: require('./addPermission.js'),
	addRecord: require('./addRecord.js'),
	addToken: require('./addToken.js'),
	addZone: require('./addZone.js'),
	check2fa: require('./check2fa.js'),
	confirm2fa: require('./confirm2fa.js'),
	confirmAddress: require('./confirmAddress.js'),
	confirmContact: require('./confirmContact.js'),
	delContact: require('./delContact.js'),
	delHealthCheck: require('./delHealthCheck.js'),
	delNotification: require('./delNotification.js'),
	delPermission: require('./delPermission.js'),
	delRecord: require('./delRecord.js'),
	delToken: require('./delToken.js'),
	delZone: require('./delZone.js'),
	editToken: require('./editToken.js'),
	disable2fa: require('./disable2fa.js'),
	disableDnssec: require('./disableDnssec.js'),
	enable2fa: require('./enable2fa.js'),
	enableDnssec: require('./enableDnssec.js'),
	getHealthCheck: require('./getHealthCheck.js'),
	getRecords: require('./getRecords.js'),
	getUser: require('./getUser.js'),
	getZone: require('./getZone.js'),
	getZoneDS: require('./getZoneDS.js'),
	listContacts: require('./listContacts.js'),
	listHealthChecks: require('./listHealthChecks.js'),
	listHealthCheckHistory: require('./listHealthCheckHistory.js'),
	listLogins: require('./listLogins.js'),
	listNotifications: require('./listNotifications.js'),
	listPermissions: require('./listPermissions.js'),
	listRecords: require('./listRecords.js'),
	listTokens: require('./listTokens.js'),
	listZones: require('./listZones.js'),
	login: require('./login.js'),
	login2fa: require('./login2fa.js'),
	registerAccount: require('./registerAccount.js'),
	updateAddress: require('./updateAddress.js'),
	updateLoginNotification: require('./updateLoginNotification.js'),
	updatePassword: require('./updatePassword.js')
    };

module.exports = routerObject;
