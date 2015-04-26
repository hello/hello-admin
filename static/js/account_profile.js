/** @jsx React.DOM */

var Tile = React.createClass({
    render: function() {
        return <div className="tile">
            <div className="tile-title">
                {this.props.title}
            </div>
            <br/>
            <div className="tile-content">
                {this.props.content}
            </div>
        </div>
    }
});

var UserBasicProfileTile = React.createClass({
    render: function() {
        var response = this.props.response;
        var alert = response.error.isWhiteString() ? null : <Well>{response.error}</Well>;
        var basicProfileTable = ($.isEmptyObject(response.data) || response.data.length === 0) ? null:
            <Table>
                <thead></thead>
                <tbody>
                    <tr><td>ID</td><td>{response.data.id}</td></tr>
                    <tr><td>Name</td><td>{response.data.name}</td></tr>
                    <tr><td>Email</td><td>{response.data.email}</td></tr>
                    <tr><td>Last Modified</td><td>{new Date(response.data.last_modified).toUTCString()}</td></tr>
                </tbody>
            </Table>;
        return (<div>
            {alert}
            {basicProfileTable}
        </div>)

    }
});

var TimelineTile = React.createClass({
    render: function() {
        var lastNightDate =  d3.time.format("%m-%d-%Y")(new Date(new Date().getTime() - 24*3600*1000));
        return <div>
            <p><a target="_blank" href={"/timeline/?email=" + this.props.accountInput + "&date=" + lastNightDate}>Last Night</a></p>
        </div>
    }
});

var RoomConditionsTile = React.createClass({
    render: function() {
        var nowDateTime = d3.time.format("%m/%d/%Y %H:%M:%S")(new Date());
        return <div>
            <p><a target="_blank" href={"/room_conditions/?email=" + this.props.accountInput + "&until=" + nowDateTime}>Last 7 days</a></p>
        </div>
    }
});

var SenseLogsTile = React.createClass({
    render: function() {
        return <div>
            <p><a target="_blank" href={"/sense_logs/?text=&devices=" + this.props.accountInput + "&max_docs=100&start=&end="}>Last 100 documents</a></p>
        </div>
    }
});

var PillStatusTile = React.createClass({
    render: function() {
        return <div>
            <p><a target="_blank" href={"/battery/?search=" + this.props.accountInput + "&end_ts="}>Last 336 heartbeats</a></p>
        </div>
    }
});

var SenseEventsTile = React.createClass({
    render: function() {
        return <div>
            <p><a target="_blank" href={"/sense_events/?account_input=" + this.props.accountInput + "&start_ts=" + new Date().getTime()}>Last 25 events</a></p>
        </div>
    }
});

var MotionTile = React.createClass({
    render: function() {
        var lastNightDate =  d3.time.format("%m-%d-%Y")(new Date(new Date().getTime() - 24*3600*1000));
        return <div>
            <p><a target="_blank" href={"/motion/?email=" + this.props.accountInput + "&date=" + lastNightDate}>Last Night</a></p>
        </div>
    }
});

var SenseSummary = React.createClass({
    render: function() {
        var senseInfoResponse = this.props.senseInfoResponse,
            senseKeyStoreResponse = this.props.senseKeyStoreResponse,
            result = null, lastSeen, keyStore;

        if (senseKeyStoreResponse.error.isWhiteString() && !$.isEmptyObject(senseKeyStoreResponse.data)) {
            if(senseKeyStoreResponse.data.key) {
                keyStore = senseKeyStoreResponse.data.key.slice(senseKeyStoreResponse.data.key.length-7, senseKeyStoreResponse.data.key.length);
            }
            else {
                keyStore = <span className="not-ok">unprovisioned</span>;
            }
        }

        if (senseInfoResponse.data.length > 0) {
            var senseId = senseInfoResponse.data[0].device_account_pair ? senseInfoResponse.data[0].device_account_pair.externalDeviceId : undefined;
            var firmwareVersion = senseInfoResponse.data[0].device_status ? senseInfoResponse.data[0].device_status.firmwareVersion : undefined;
            lastSeen =  senseInfoResponse.data[0].device_status ? new Date(senseInfoResponse.data[0].device_status.lastSeen).toUTCString() : undefined;
            result = <Table>
                <thead/>
                <tbody>
                    <tr><td>ID</td><td>{senseId}</td></tr>
                    <tr><td>Firmware</td><td>{firmwareVersion}</td></tr>
                    <tr><td>Keystore</td><td>{keyStore}</td></tr>
                    <tr><td>Last Seen</td><td>{lastSeen}</td></tr>
                </tbody>
            </Table>;
        }

        return !senseInfoResponse.error.isWhiteString ?
            <Well>{senseInfoResponse.error}</Well>: result;
    }
});

var PillSummary = React.createClass({
    render: function() {
        var pillInfoResponse = this.props.pillInfoResponse,
            pillStatusResponse = this.props.pillStatusResponse,
            pillKeyStoreResponse = this.props.pillKeyStoreResponse,
            result = null, batteryLevel, lastSeen, keyStore;

        if (pillStatusResponse.data.length > 0) {
            if(pillStatusResponse.data[0][0]) {
                batteryLevel = pillStatusResponse.data[0][0].batteryLevel;
                lastSeen = new Date(pillStatusResponse.data[0][0].lastSeen).toUTCString();
            }
        }

        if (pillKeyStoreResponse.error.isWhiteString() && !$.isEmptyObject(pillKeyStoreResponse.data)) {
            if(pillKeyStoreResponse.data.key) {
                keyStore = pillKeyStoreResponse.data.key.slice(pillKeyStoreResponse.data.key.length-7, pillKeyStoreResponse.data.key.length);
            }
            else {
                keyStore = <span className="not-ok">unprovisioned</span>;
            }
        }

        if (pillInfoResponse.data.length > 0) {
            var pillId = pillInfoResponse.data[0].device_account_pair ? pillInfoResponse.data[0].device_account_pair.externalDeviceId : undefined;
            result = <Table>
                <thead/>
                <tbody>
                    <tr><td>ID</td><td>{pillId}</td></tr>
                    <tr><td>Battery</td><td>{batteryLevel}</td></tr>
                    <tr><td>Keystore</td><td>{keyStore}</td></tr>
                    <tr><td>Last Seen</td><td>{lastSeen}</td></tr>
                </tbody>
            </Table>;
        }

        return !pillInfoResponse.error.isWhiteString ?
            <Well>{pillInfoResponse.error}</Well>: result;
    }
});

var AccountProfile = React.createClass({
    getInitialState: function() {
        return {
            basicProfileResponse: {data: {}, error: ""},
            senseInfoResponse: {data: [], error: ""},
            pillInfoResponse: {data: [], error: ""},
            pillStatusResponse: {data: [], error: ""},
            senseKeyStoreResponse: {data: {}, error: ""},
            pillKeyStoreResponse: {data: {}, error: ""},
            accountInput: "",
            submitted: false
        }
    },

    componentDidMount: function() {
        var accountInputFromURL = getParameterByName("account_input"), that = this;
        if (accountInputFromURL){
            this.refs.accountInput.getDOMNode().value = accountInputFromURL;
            that.handleSubmit();
        }
    },
    loadBasicProfile: function() {
        var that = this;
        $.ajax({
            url: "/api/user_search",
            dataType: 'json',
            type: "GET",
            data: {search_input: this.refs.accountInput.getDOMNode().value, search_method: "email"},
            success: function (response) {
                that.setState({basicProfileResponse: response});
            }
        });
    },

    loadSenseInfo: function() {
        var that = this;
        $.ajax({
            url: '/api/device_by_email',
            dataType: 'json',
            type: 'GET',
            data: {email: this.refs.accountInput.getDOMNode().value, device_type: "sense"},
            success: function (response) {
                that.setState({senseInfoResponse: response});
                if (response.data.length > 0) {
                    if (response.data[0].device_account_pair) {
                        if (response.data[0].device_account_pair.externalDeviceId) {
                            var senseId = response.data[0].device_account_pair.externalDeviceId;
                            that.loadSenseKeyStore(senseId);
                        }
                    }
                }
            }
        });
    },

    loadPillInfo: function() {
        var that = this;
        $.ajax({
            url: '/api/device_by_email',
            dataType: 'json',
            type: 'GET',
            data: {email: this.refs.accountInput.getDOMNode().value, device_type: "pill"},
            success: function (response) {
                that.setState({pillInfoResponse: response});
                if (response.data.length > 0) {
                    if (response.data[0].device_account_pair) {
                        if (response.data[0].device_account_pair.externalDeviceId) {
                            var pillId = response.data[0].device_account_pair.externalDeviceId;
                            that.loadPillStatus(pillId);
                            that.loadPillKeyStore(pillId);
                        }
                    }
                }
            }
        });
    },

    loadPillStatus: function(pillId) {
        var that = this;
        $.ajax({
            aysnc: false,
            url: '/api/battery',
            dataType: 'json',
            type: 'GET',
            data: {search_input: pillId, end_ts: new Date().getTime()},
            success: function (response) {
                that.setState({pillStatusResponse: response});
            }
        });
    },

    loadSenseKeyStore: function(senseId) {
        var that = this;
        $.ajax({
            aysnc: false,
            url: "/api/devices/key_store",
            dataType: 'json',
            type: 'GET',
            data: {device_id: senseId, device_type: "sense"},
            success: function (response) {
                that.setState({senseKeyStoreResponse: response});
            }
        });
    },

    loadPillKeyStore: function(pillId) {
        var that = this;
        $.ajax({
            aysnc: false,
            url: "/api/devices/key_store",
            dataType: 'json',
            type: 'GET',
            data: {device_id: pillId, device_type: "pill"},
            success: function (response) {
                that.setState({pillKeyStoreResponse: response});
            }
        });
    },

    handleSubmit: function() {
        history.pushState({}, '', '/account_profile/?account_input=' + this.refs.accountInput.getDOMNode().value);
        this.setState(this.getInitialState());
        this.setState({accountInput: this.refs.accountInput.getDOMNode().value});
        this.loadSenseInfo();
        this.loadBasicProfile();
        this.loadPillInfo();
        this.setState({submitted: true});
        return false;
    },

    render: function() {
        var results = this.state.submitted === false ? null :
            <div><Row>
                <Col xs={4}><Tile title="Basic Profile" content={<UserBasicProfileTile response={this.state.basicProfileResponse} accountInput={this.state.accountInput} />} /></Col>
                <Col xs={4}><Tile title="Sense Summary" content={<SenseSummary senseInfoResponse={this.state.senseInfoResponse} senseKeyStoreResponse={this.state.senseKeyStoreResponse} accountInput={this.state.accountInput} />} /></Col>
                <Col xs={4}><Tile title="Pill Summary" content={<PillSummary pillInfoResponse={this.state.pillInfoResponse} pillStatusResponse={this.state.pillStatusResponse} pillKeyStoreResponse={this.state.pillKeyStoreResponse} accountInput={this.state.accountInput} />} /></Col>
            </Row>
            <Row>
                <Col xs={4}><Tile title="Timeline" content={<TimelineTile accountInput={this.state.accountInput} />} /></Col>
                <Col xs={4}><Tile title="Room Conditions" content={<RoomConditionsTile accountInput={this.state.accountInput} />} /></Col>
                <Col xs={4}><Tile title="Motion "content={<MotionTile accountInput={this.state.accountInput}/>} /></Col>
            </Row>
            <Row>
                <Col xs={4}><Tile title="Sense Logs" content={<SenseLogsTile accountInput={this.state.accountInput} />} /></Col>
                <Col xs={4}><Tile title="Sense Events" content={<SenseEventsTile accountInput={this.state.accountInput} />} /></Col>
                <Col xs={4}><Tile title="Pill Status" content={<PillStatusTile accountInput={this.state.accountInput} />} /></Col>
            </Row></div>;
        return <div>
            <Row><Col xs={6} xsOffset={3}><form onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <div className="input-group">
                        <input className="form-control" type="text" id="account-input" ref="accountInput" placeholder="email please"/>
                        <span className="input-group-addon cursor-hand" onClick={this.handleSubmit}>
                            <Glyphicon glyph="search"/>
                        </span>
                    </div>
                </div>
            </form></Col></Row>
            <br/><br/>
            {results}
        </div>;
    }
});

React.renderComponent(<AccountProfile />, document.getElementById('account-profile'));


function displayDateTime(ts, tzOffsetMillis) {
    var omniTimeFormat = d3.time.format('%a %d %b %H:%M %Z');
    var omniTimeFormatWithoutTz = d3.time.format('%a %d %b %H:%M');
    if (tzOffsetMillis) {
        var adjustedDateTimeString = new Date(ts + tzOffsetMillis).toUTCString().split("GMT")[0];
        var tzOffsetHours =  tzOffsetMillis / 3600000, adjustTimezoneString;
        if (tzOffsetHours >= 0 && tzOffsetHours < 10 ) {
            adjustTimezoneString = "0" + tzOffsetHours.toString() + "00";
        }
        else if (tzOffsetHours < 0 && tzOffsetHours > -10) {
            adjustTimezoneString = "-0" + Math.abs(tzOffsetHours).toString() + "00";
        }
        else {
            adjustTimezoneString = tzOffsetHours.toString() + "00";
        }
        return omniTimeFormatWithoutTz(new Date(adjustedDateTimeString)) +  " " + adjustTimezoneString;
    }

    return omniTimeFormat(new Date(ts));
}