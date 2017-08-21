#!/bin/sh

export DO_BACKUP=true
export DO_LAST_MINUTE=yep
if test -f /var/lib/highwaytohell/.profile; then
    . /var/lib/highwaytohell/.profile
else
    tmpfile=/opt/codedeploy-agent/vars
    orig=`umask`
    umask 037
    (
	curl http://169.254.169.254/latest/user-data/ 2>/dev/null
	echo
    ) | while read line
	do
	    test "$line" || continue
	    echo "$line" | grep '^<?xml' >/dev/null && break
	    echo "$line" | grep HTTP_PROXY >/dev/null && continue
	    echo export $line
	done >$tmpfile
    umask $orig
    . $tmpfile
    rm -f $tmpfile
fi
ret=1
HOSTNAME=`hostname`
test -z "$NODE_ENV" && NODE_ENV=untagged
test "$NODE_ENV" = productiondr && REGION=us-west-2 || REGION=us-east-1
msgpfx="[$DEPLOYMENT_ID@$HOSTNAME.$NODE_ENV]"
if test -x /usr/local/bin/slack; then
    trap '/usr/local/bin/slack $SLACK_HOOK $msg >/dev/null ; if test "0$ret" != "00" -a -x /usr/local/bin/rollback_peerio-backend; then cd /; /usr/local/bin/rollback_peerio-backend; fi; exit $ret' EXIT
    /usr/local/bin/slack $SLACK_HOOK "$msgpfx processing highwaytohell https://console.aws.amazon.com/codedeploy/home?region=$REGION#/deployments/$DEPLOYMENT_ID)" >/dev/null
fi

if test -d /usr/src/ansible; then
    ANSIBLE=/usr/src/ansible
else
    ANSIBLE=/etc/ansible
fi
OLDDIR=/var/spool/last-backend
WRKDIR=/var/spool/peerio-backend
DEPLOY=/var/spool/peerio-codedeploy

set_version()
{
    if grep peerio_hwth_local_version $ANSIBLE/host_vars/127.0.0.1.yml >/dev/null; then
	sed -i "s|^peerio_hwth_local_version.*|peerio_hwth_local_version: $1|" $ANSIBLE/host_vars/127.0.0.1.yml
    else
	echo "peerio_hwth_local_version: $1" >>host_vars/127.0.0.1.yml
    fi
    rm -f $ANSIBLE/roles/hwth/files/highwaytohell_*_all.deb
    cp -p $WRKDIR/highwaytohell_${1}_all.deb $ANSIBLE/roles/hwth/files/
    cp -p $WRKDIR/highwaytohell_${1}_all.deb /root/highwaytohell.deb
    dpkg -i $WRKDIR/highwaytohell_${1}_all.deb
    return $?
}

if test `df -P . | awk 'NR==2 {print $4}'` -lt 1000000; then
    /usr/local/sbin/codedeploy_purge_archives
    /usr/local/sbin/codedeploy_purge_backups
    test "$SLACK_HOOK" && /usr/local/bin/slack $SLACK_HOOK "$msgpfx purged old backups" >/dev/null
elif test `df -i . | awk 'NR==2 {print $4}'` -lt 100000; then
    /usr/local/sbin/codedeploy_purge_archives
    /usr/local/sbin/codedeploy_purge_backups
    test "$SLACK_HOOK" && /usr/local/bin/slack $SLACK_HOOK "$msgpfx purged old backups" >/dev/null
fi
rm -fr /tmp/npm-* /var/lib/highwaytohell/.npm /root/.npm
if test -d $OLDDIR; then
    rm -fr $OLDDIR
fi
if test -d $WRKDIR; then
    mv $WRKDIR $OLDDIR
fi
echo $DEPLOYMENT_ID >$DEPLOY/ID
mv $DEPLOY $WRKDIR

cd $ANSIBLE
if test -s $ANSIBLE/roles/hwth/meta/main.yml; then
    # don't replay dependencies, instead include corresponding handlers
    rm -fr $ANSIBLE/roles/hwth/meta
    (
	cat $ANSIBLE/roles/rsyslog/handlers/main.yml
	cat $ANSIBLE/roles/munin/handlers/main.yml
	cat $ANSIBLE/roles/nrpe/handlers/main.yml
	cat $ANSIBLE/roles/zabbix/handlers/main.yml
	cat $ANSIBLE/roles/nsd/handlers/main.yml
	cat $ANSIBLE/roles/nginx/handlers/main.yml
	cat $ANSIBLE/roles/hwth/handlers/main.yml
    ) >$ANSIBLE/roles/hwth/handlers/main.yml.new
    mv $ANSIBLE/roles/hwth/handlers/main.yml.new $ANSIBLE/roles/hwth/handlers/main.yml
fi
VERS=`ls $WRKDIR/highwaytohell_*deb | sed 's|[^_]*_\([0-9a-z\.-]*\)\_all\.deb|\1|'`
if test "$VERS"; then
    if set_version $VERS; then
	if ! test -f /var/lib/highwaytohell/.profile; then
	    /usr/local/bin/slack $SLACK_HOOK "$msgpfx missing profile, running ansible starting up highwaytohell services" >/dev/null
	    if ! ANSIBLE_HOST_KEY_CHECKING=False /usr/local/bin/ansible-playbook -i ./hosts playbooks/hwth-deploy.yml; then
		if test -f /var/lib/highwaytohell/.profile; then
		    . /var/lib/highwaytohell/.profile
		fi
		test "$NODE_ENV" = productiondr && REGION=us-west-2 || REGION=us-east-1
		msgpfx="[$DEPLOYMENT_ID@$HOSTNAME.$NODE_ENV]"
		msg="$msgpfx failed deploying $VERS"
	    else
		if test -f /var/lib/highwaytohell/.profile; then
		    . /var/lib/highwaytohell/.profile
		fi
		test "$NODE_ENV" = productiondr && REGION=us-west-2 || REGION=us-east-1
		msgpfx="[$DEPLOYMENT_ID@$HOSTNAME.$NODE_ENV]"
		msg="$msgpfx successfully applied $VERS ($RUN_WORKERS)"
		ret=0
		echo OK >$WRKDIR/.installed
	    fi
	else
	    if test -f /var/lib/highwaytohell/.profile; then
		. /var/lib/highwaytohell/.profile
	    fi
	    test "$NODE_ENV" = productiondr && REGION=us-west-2 || REGION=us-east-1
	    msgpfx="[$DEPLOYMENT_ID@$HOSTNAME.$NODE_ENV]"
	    msg="$msgpfx successfully applied $VERS ($RUN_WORKERS)"
	    ret=0
	    echo OK >$WRKDIR/.installed
	fi
    elif test "$RUN_WORKERS"; then
	msg="$msgpfx failed installing highwaytohell_$VERS ($RUN_WORKERS)"
    else
	msg="$msgpfx failed installing highwaytohell_$VERS"
    fi
elif test "$RUN_WORKERS"; then
    msg="$msgpfx could not find packages ($RUN_WORKERS)"
else
    msg="$msgpfx could not find packages"
fi
