function addHealthCheck(domainName) {
    var actionForm = document.getElementById('formhealthchecks');
    var headersForm = document.getElementById('checkheaders');
    var healthyForm = document.getElementById('checkhealthy');
    var idForm = document.getElementById('checkid');
    var invertForm = document.getElementById('checkinvert');
    var matchForm = document.getElementById('checkmatch');
    var targetForm = document.getElementById('checktarget');
    var typeForm = document.getElementById('checktype');
    var unhealthyForm = document.getElementById('checkunhealthy');
    actionForm.action = '/healthchecks/' + domainName + '/add';
    headersForm.value = '';
    healthyForm.value = 3;
    idForm.value = '';
    invertForm.checked = false;
    matchForm.value = '';
    targetForm.value = '';
    typeForm.value = 'http';
    unhealthyForm.value = 2;
    showForm('Add Health Check');
}

function addNotification(domainName) {
    var actionForm = document.getElementById('formAction');
    var downForm = document.getElementById('notifydown');
    var idForm = document.getElementById('checkid');
    var targetForm = document.getElementById('notifytarget');
    var typeForm = document.getElementById('notifytype');
    var upForm = document.getElementById('notifyup');
    actionForm.value = 'add';
    downForm.value = 2;
    idForm.value = '';
    targetForm.value = '';
    typeForm.value = 'http-post';
    upForm.value = 3;
    showForm('Add Notification');
}

function addRecord() {
    var actionForm = document.getElementById('formAction');
    var healthCheckForm = document.getElementById('recordhc');
    var nameForm = document.getElementById('targetSource');
    var prioForm = document.getElementById('recordprio');
    var setIdForm = document.getElementById('recordsetid');
    var targetForm = document.getElementById('recordtarget');
    var ttlForm = document.getElementById('recordttl');
    var typeForm = document.getElementById('recordtype');
    actionForm.value = 'add';
    healthCheckForm.value = 'STATIC';
    nameForm.value = '';
    prioForm.value = 0;
    setIdForm.value = '';
    targetForm.value = '';
    ttlForm.value = 3600;
    typeForm.value = 'A';
    showForm('Register Record');
}

function addToken() {
    var actionForm = document.getElementById('formtokens');
    var permsForm = document.getElementById('tokperms');
    var sourcesForm = document.getElementById('toksources');
    actionForm.action = '/tokens/add';
    permsForm.value = '*';
    sourcesForm.value = '*';
    showForm('Add Token');
}

function checkRegistration() {
    var left = document.getElementById('pass1').value;
    var right = document.getElementById('pass2').value;
    if (left && right && left !== "" && right !== "") {
	if (left === right) {
	    if (left.length >= 12) { return true; }
	    else { alert('please try with a longer password (12 chars min)'); }
	} else { alert('mismatching passwords, try again'); }
    } else { alert('password can not be empty'); }
    return false;
}

function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); }
function drop(ev) {
    ev.preventDefault();
    var d = document.getElementById('droppable');
    d.style.position = 'absolute';
    d.style.left = ev.clientX + 'px';
    d.style.top = ev.clientY + 'px';
}

function dropDomain(domainName) {
    var usure = confirm('Drop domain ' + domainName + '? This can not be un-done');
    if (usure === true) {
	post('/domains/' + domainName + '/del', { })
    }
}

function dropHealthCheck(domainName, checkId) {
    var usure = confirm('Drop health check ' + checkId + '? This can not be un-done');
    if (usure === true) {
	post('/healthchecks/' + domainName + '/del/' + checkId, { });
    }
}

function dropNotification(domainName, checkId, type) {
    var usure = confirm('Drop ' + type + ' notification for ' + checkId + '? This can not be un-done');
    if (usure === true) {
	post('/notifications/' + domainName + '/del/' + checkId, { /* notificationType: type */ });
    }
}

function dropRecord(domainName, name, type, setId) {
    var usure = confirm('Drop record ' + name + '? This can not be un-done');
    if (usure === true) {
	post('/records/' + domainName + '/del/' + name, { setId: setId, recordType: type });
    }
}

function dropToken(tokenString) {
    var usure = confirm('Drop token? This can not be un-done');
    if (usure === true) {
	post('/tokens/del', { tokenString: tokenString });
    }
}

function editHealthCheck(domainName, checkId, checkType, checkHeaders, checkTarget, checkMatch, checkHealthy, checkUnhealthy, checkInvert) {
    var actionForm = document.getElementById('formhealthchecks');
    var headersForm = document.getElementById('checkheaders');
    var healthyForm = document.getElementById('checkhealthy');
    var idForm = document.getElementById('checkid');
    var invertForm = document.getElementById('checkinvert');
    var matchForm = document.getElementById('checkmatch');
    var targetForm = document.getElementById('checktarget');
    var typeForm = document.getElementById('checktype');
    var unhealthyForm = document.getElementById('checkunhealthy');
    actionForm.action = '/healthchecks/' + domainName + '/edit/' + checkId;
    headersForm.value = checkHeaders;
    healthyForm.value = checkHealthy;
    idForm.value = checkId;
    invertForm.checked = (checkInvert !== 'no');
    matchForm.value = checkMatch;
    targetForm.value = checkTarget;
    typeForm.value = checkType;
    unhealthyForm.value = checkUnhealthy;
    showForm('Edit Health Check');
}

function editNotification(domainName, checkId, checkType, checkTarget, checkHealthy, checkUnhealthy) {
    var actionForm = document.getElementById('formAction');
    var downForm = document.getElementById('notifydown');
    var idForm = document.getElementById('checkid');
    var targetForm = document.getElementById('notifytarget');
    var typeForm = document.getElementById('notifytype');
    var upForm = document.getElementById('notifyup');
    actionForm.value = 'edit';
    downFrom.value = checkUnhealthy;
    idForm.value = checkId;
    targetForm.value = checkTarget;
    typeForm.value = checkType;
    upForm.value = checkHealthy;
    showForm('Edit Notification');
}

function editRecord(domainName, recName, recType, recPriority, recTarget, recSetId, recHealthCheck, recTtl) {
    var actionForm = document.getElementById('formAction');
    var healthCheckForm = document.getElementById('recordhc');
    var nameForm = document.getElementById('targetSource');
    var prioForm = document.getElementById('recordprio');
    var setIdForm = document.getElementById('recordsetid');
    var targetForm = document.getElementById('recordtarget');
    var ttlForm = document.getElementById('recordttl');
    var typeForm = document.getElementById('recordtype');
    actionForm.value = 'edit';
    healthCheckForm.value = (recHealthCheck !== 'none' ? recHealthCheck : 'STATIC');
    nameForm.value = recName;
    prioForm.value = recPriority;
    setIdForm.value = recSetId;
    targetForm.value = recTarget;
    ttlForm.value = recTtl;
    typeForm.value = recType;
    showForm('Update Record');
}

function editToken(tokenId, tokenPerms, tokenSources) {
    var actionForm = document.getElementById('formtokens');
    var idForm = document.getElementById('tokenid');
    var permsForm = document.getElementById('tokperms');
    var sourceForm = document.getElementById('toksources');
    actionForm.action = '/tokens/edit';
    idForm.value = tokenId;
    permsForm.value = tokenPerms;
    sourceForm.value = tokenSources;
    showForm('Edit Token');
}

function hideForm() {
    var form = document.getElementById('overlay');
    if (form) { form.style.visibility = 'hidden'; }
}

function load() {
    var form = document.getElementById('overlay');
    if (form) {
	window.onkeyup = function () { if (event.keyCode == 27) { form.style.visibility = 'hidden'; } };
    }
}

function post(path, params, method) {
    method = method || 'post';

    var my = document.createElement('form');
    my.setAttribute('method', method);
    my.setAttribute('action', path);

    for (var key in params) {
	if (params.hasOwnProperty(key)) {
	    var hiddenField = document.createElement('input');
	    hiddenField.setAttribute('type', 'hidden');
	    hiddenField.setAttribute('name', key);
	    hiddenField.setAttribute('value', params[key]);
	    my.appendChild(hiddenField);
	}
    }
    document.body.appendChild(my);
    my.submit();
}

function showForm(title) {
    var form = document.getElementById('overlay');
    if (form) { form.style.visibility = 'visible'; }
    if (title !== undefined) {
	var formTitle = document.getElementById('formname');
	if (formTitle) { formTitle.innerHTML = title; }
	var submitForm = document.getElementById('hacksubmit');
	if (submitForm) { submitForm.value = title; }
    }
}

function updateFormAction(where) {
    var form = document.getElementById('form' + where);
    if (form) {
	if (where === 'domains') {
	    var actionUrl = document.getElementById('targetSource').value;
	    form.action = '/domains/' + actionUrl + '/add';
	} else if (where === 'records') {
	    var actionUrl = document.getElementById('targetSource').value;
	    var domainName = document.getElementById('formHelper').value;
	    var malcolm = document.getElementById('formAction').value;
	    form.action = '/records/' + domainName + '/' + malcolm + '/' + actionUrl;
	} else if (where === 'notifications') {
	    var actionUrl = document.getElementById('checkid').value;
	    var domainName = document.getElementById('formHelper').value;
	    var malcolm = document.getElementById('formAction').value;
	    form.action = '/notifications/' + domainName + '/' + malcolm + '/' + actionUrl;
	} else {
	    alert('unhandled form');
	}
    } else {
	alert('could not locate form element');
    }
}

function updateSetId() {
    var recordForm = document.getElementById('targetSource');
    var setIdForm = document.getElementById('recordsetid');
    if (recordForm && setIdForm) {
	setIdForm.value = recordForm.value;
    }
}
