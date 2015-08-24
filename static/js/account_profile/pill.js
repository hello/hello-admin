var PillSummary = React.createClass({
    render: function() {
        var pillResponse = this.props.pillResponse,
            pillStatusResponse = this.props.pillStatusResponse,
            pillKeyStoreResponse = this.props.pillKeyStoreResponse,
            result = null, batteryLevel = null, lastSeen = null, keyStore = null, uptime = null;
        if (pillStatusResponse.data.length > 0) {
            if(pillStatusResponse.data[0][0]) {
                batteryLevel = pillStatusResponse.data[0][0].batteryLevel ?
                    <span>{pillStatusResponse.data[0][0].batteryLevel + " %"}</span> : null;
                var lastSeenEpoch = pillStatusResponse.data[0][0].lastSeen;
                lastSeen = <span className={lastSeenEpoch < new Date().getTime() - 4*3600*1000 ? "not-ok" : "ok"} dangerouslySetInnerHTML={{__html: utcFormatter(new Date(lastSeenEpoch))}}/>;
                uptime = millisecondsToHumanReadableString(pillStatusResponse.data[0][0].uptime * 1000, true);
            }
            else {
                batteryLevel = <span className="not-ok">-</span>;
                lastSeen = <span className="not-ok">-</span>;
                uptime = <span className="not-ok">-</span>;

            }
        }

        if (pillKeyStoreResponse.error.isWhiteString()) {
            if(!$.isEmptyObject(pillKeyStoreResponse) && pillKeyStoreResponse.data.key) {
                keyStore = pillKeyStoreResponse.data.key.slice(pillKeyStoreResponse.data.key.length-5, pillKeyStoreResponse.data.key.length) + " " + (pillKeyStoreResponse.data.created_at || "");
            }
        }
        else {
            keyStore = <span className="not-ok">unprovisioned</span>;
        }

        var pillColor = <Button className="device-color" bsSize="xsmall" disabled>BLUE</Button>;
        if (pillResponse.data.length > 0) {
            var pillId = pillResponse.data[0].device_account_pair ? pillResponse.data[0].device_account_pair.externalDeviceId : undefined;
            var pillInternalId = pillResponse.data[0].device_account_pair ? " (" + pillResponse.data[0].device_account_pair.internalDeviceId + ")" : undefined;
            var lastNightDate =  d3.time.format("%m-%d-%Y")(new Date(new Date().getTime() - 24*3600*1000));
            var pairedByAdmin = pillResponse.data[0].paired_by_admin === true ? "&nbsp;&nbsp;by admin": "";
            var lastPairing =  pillResponse.data[0].pairing_ts ? <span dangerouslySetInnerHTML={{__html: utcFormatter(new Date(pillResponse.data[0].pairing_ts)) + pairedByAdmin}}/> : null;
            result = <div>
                <Table>
                    <thead/>
                    <tbody>
                        <tr><td>ID</td><td>{pillId + pillInternalId}</td></tr>
                        <tr><td>Keystore</td><td>{keyStore}</td></tr>
                        <tr><td>Battery</td><td>{batteryLevel}</td></tr>
                        <tr><td>Uptime</td><td>{uptime}</td></tr>
                        <tr><td>Color</td><td>{pillColor}</td></tr>
                        <tr><td>Last Seen</td><td>{lastSeen}</td></tr>
                        <tr><td>Last Pairing</td><td>{lastPairing}</td></tr>
                        <tr><td/><td/></tr>
                    </tbody>
                </Table>
                <ul className="extra">
                    <li><a target="_blank" href={"/battery/?search=" + pillId + "&end_ts="}>Heartbeats</a></li>
                    <li><a target="_blank" href={"/motion/?email=" + this.props.email + "&date=" + lastNightDate}>Motion</a></li>
                </ul>
            </div>;
        }

        return !pillResponse.error.isWhiteString ?
            <Well>{pillResponse.error}</Well>: result;
    }
});