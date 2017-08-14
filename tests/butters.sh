i#!/bin/sh

if ! ./samples.d/butters | grep peerio.com; then
    echo failed listing domains
    exit 1
#elif ! ./samples.d/butters -d peerio.com -a get --getdsrecords | grep '^{}$'; then
# backends error on circleci? should divert logs to file
#    echo failed fetching ds records
#    exit 1
elif ! ./samples.d/butters -d peerio.com -a get --getdsrecords | grep '^{}$'; then
    echo failed fetching ds records
    exit 1
elif ! butters -R notifications; then
    echo failed listing notifications
    exit 1
elif ! butters -R records; then
    echo failed listing records
    exit 1
fi

exit 0
