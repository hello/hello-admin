var PillSummary = React.createClass({
    getInitialState: function() {
        return {pillColor: "", heartbeat: {}, motion: {}};
    },

    getPillColor(pillId, accountId) {
        $.ajax({
            url: "/api/pill_color",
            type: 'GET',
            data: {pill_id: pillId,  account_id: accountId},
            success: function(response) {
                if (response.error.isWhiteString()){
                    this.setState({pillColor: response.data});
                }
                else {
                    this.setState({pillColor: <span className="not-ok">--</span>});
                }
            }.bind(this)
        });
    },

    getLastHeartbeat(pillId) {
        $.ajax({
            url: "/api/last_heartbeat",
            type: 'GET',
            data: {pill_id: pillId},
            success: function(response) {
                this.setState({heartbeat: response.data});
            }.bind(this)
        });
    },

    getLastMotion(email, date) {
        $.ajax({
            url: "/api/last_motion",
            type: 'GET',
            data: {email: email, date: date},
            success: function(response) {
                if (response.error.isWhiteString()) {
                    this.setState({motion: response.data});
                }
            }.bind(this)
        });
    },

    componentDidUpdate: function(nextProps, nextState) {
        var currentSenseId = this.props.senseResponse.data && this.props.senseResponse.data.length > 0  ? this.props.senseResponse.data[0].device_account_pair.external_device_id : null;
        var nextSenseId = nextProps.senseResponse.data && nextProps.senseResponse.data.length > 0  ? nextProps.senseResponse.data[0].device_account_pair.external_device_id : null;

        var currentPillId = this.props.pillResponse.data && this.props.pillResponse.data.length > 0  ? this.props.pillResponse.data[0].device_account_pair.external_device_id : null;
        var nextPillId = nextProps.pillResponse.data && nextProps.pillResponse.data.length > 0  ? nextProps.pillResponse.data[0].device_account_pair.external_device_id : null;

        var currentAccountId = this.props.pillResponse.data && this.props.pillResponse.data.length > 0  ? this.props.pillResponse.data[0].device_account_pair.account_id : null;
        var nextAccountId = nextProps.pillResponse.data && nextProps.pillResponse.data.length > 0  ? nextProps.pillResponse.data[0].device_account_pair.account_id : null;

        var currentEmail = this.props.email;
        var nextEmail = nextProps.email;

        if (currentSenseId !== nextSenseId || currentAccountId !== nextAccountId) {
            this.getPillColor(currentSenseId, currentAccountId);
        }

        if (currentPillId !== nextPillId) {
           this.getLastHeartbeat(currentPillId);
        }

        if (currentEmail !== nextEmail) {
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate()-1);
            this.getLastMotion(this.props.email, d3.time.format("%Y-%m-%d")(yesterday));
        }
        return false;
    },

    render: function() {
        var pillResponse = this.props.pillResponse,
            pillKeyStoreResponse = this.props.pillKeyStoreResponse,
            result = null, battery_level = null, lastHeartbeat = null, lastMotion = null, keyStore = null, uptime = null;
        if (!$.isEmptyObject(this.state.heartbeat)) {
            battery_level = <span>{this.state.heartbeat.battery_level + " %"}</span>;
            lastHeartbeat = <span className={this.state.heartbeat.created_at < new Date().getTime() - 4*3600*1000 ? "not-ok" : "ok"} dangerouslySetInnerHTML={{__html: utcFormatter(new Date(this.state.heartbeat.created_at))}}/>;
            uptime = millisecondsToHumanReadableString(this.state.heartbeat.uptime * 1000, true);
        }

        if (!$.isEmptyObject(this.state.motion)) {
            lastMotion = <span dangerouslySetInnerHTML={{__html: utcFormatter(new Date(this.state.motion.timestamp))}}/>;
        }

        if (pillKeyStoreResponse.error.isWhiteString()) {
            if(!$.isEmptyObject(pillKeyStoreResponse) && pillKeyStoreResponse.data.key) {
                keyStore = pillKeyStoreResponse.data.key.slice(pillKeyStoreResponse.data.key.length-5, pillKeyStoreResponse.data.key.length) + " " + (pillKeyStoreResponse.data.created_at || "");
            }
        }
        else {
            keyStore = <span className="not-ok">unprovisioned</span>;
        }

        var pillColor = <Button className="device-color" bsSize="xsmall" disabled>{this.state.pillColor}</Button>;
        if (pillResponse.data.length > 0) {
            var pillId = pillResponse.data[0].device_account_pair ? pillResponse.data[0].device_account_pair.external_device_id : undefined;
            var pillInternalId = pillResponse.data[0].device_account_pair ? " (" + pillResponse.data[0].device_account_pair.internal_device_id + ")" : undefined;
            var lastNightDate =  d3.time.format("%m-%d-%Y")(new Date(new Date().getTime() - 24*3600*1000));
            var pairedByAdmin = pillResponse.data[0].paired_by_admin === true ? "&nbsp;&nbsp;by admin": "";
            var lastPairing =  pillResponse.data[0].pairing_ts ? <span dangerouslySetInnerHTML={{__html: utcFormatter(new Date(pillResponse.data[0].pairing_ts)) + pairedByAdmin}}/> : null;
            result = <div>
                <Table>
                    <thead/>
                    <tbody>
                        <tr><td>ID</td><td>{pillId + pillInternalId}</td></tr>
                        <tr><td>Keystore</td><td>{keyStore}</td></tr>
                        <tr><td>Battery</td><td>{battery_level}</td></tr>
                        <tr><td>Uptime</td><td>{uptime}</td></tr>
                        <tr><td>Color</td><td>{pillColor}</td></tr>
                        <tr><td>Last Heartbeat</td><td>{lastHeartbeat}</td></tr>
                        <tr><td>Last Motion</td><td>{lastMotion}</td></tr>
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


var PillLimitedSummary = React.createClass({
    render: function() {
        var keyStore = null;
        var pillKeyStoreResponse = this.props.pillKeyStoreResponse;

        if (pillKeyStoreResponse.error.isWhiteString()) {
            if(!$.isEmptyObject(pillKeyStoreResponse) && pillKeyStoreResponse.data.key) {
                keyStore = pillKeyStoreResponse.data.key.slice(pillKeyStoreResponse.data.key.length-5, pillKeyStoreResponse.data.key.length) + " " + (pillKeyStoreResponse.data.created_at || "");
            }
        }
        else {
            keyStore = <span className="not-ok">unprovisioned</span>;
        }

        return <Table>
            <tbody>
                <tr><td>ID</td><td>{this.props.pillId}</td></tr>
                <tr><td>Keystore</td><td>{keyStore}</td></tr>
                <tr><td/><td/></tr>
            </tbody>
        </Table>;
    }
});