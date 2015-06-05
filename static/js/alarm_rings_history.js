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

var SmartAlarmHistory = React.createClass({
    render: function() {
        return <Table>
            <thead><tr>
                <th>Account ID</th>
                <th>Local Schedule</th>
                <th>Expected Local Ringtime</th>
                <th>Actual Local Ringtime</th>
                <th>Last local sleep cycle</th>
                <th>Timezone ID</th>
            </tr></thead>
            <tbody>{this.props.data && this.props.data.length > 0 ?
                this.props.data.sort(function(d1, d2){return new Date(d2.scheduled_at_local).getTime() - new Date(d1.scheduled_at_local).getTime();}).map(function(d){
                    return <tr>
                        <td>{d.account_id}</td>
                        <td>{d.scheduled_at_local}</td>
                        <td>{d.expected_ringtime_local}</td>
                        <td>{d.actual_ringtime_local}</td>
                        <td>{d.last_sleep_cycle_local}</td>
                        <td>{d.timezone_id}</td>
                    </tr>
                })
                : null}</tbody>
        </Table>
    }
});

var RingTimeHistory = React.createClass({
    render: function() {
        return <Table>
            <thead><tr>
                <th>Actual UTC Ringtime</th>
                <th>Expected UTC Ringtime</th>
                <th>Sound IDs</th>
            </tr></thead>
            <tbody>{this.props.data && this.props.data.length > 0 ?
                this.props.data.sort(function(d1, d2){return d2.actual_ring_time_utc - d1.actual_ring_time_utc;}).map(function(d){
                    return <tr>
                        <td>{d3.time.format.utc("%Y-%m-%d %H:%M:%S")(new Date(d.actual_ring_time_utc))}</td>
                        <td>{d3.time.format.utc("%Y-%m-%d %H:%M:%S")(new Date(d.expected_ring_time_utc))}</td>
                        <td>{d.sound_ids}</td>
                    </tr>
                })
                : null}</tbody>
        </Table>
    }
});

var TimezoneHistory = React.createClass({
    render: function() {
        return <Table>
            <thead><tr>
                <th>Timezone ID</th>
                <th>Timezone Offset</th>
            </tr></thead>
            <tbody>{this.props.data && this.props.data.length > 0 ?
                this.props.data.map(function(d){
                    return <tr>
                        <td>{d.timezone_id}</td>
                        <td>{d.timezone_offset}</td>
                    </tr>
                })
                : null}</tbody>
        </Table>
    }
});

var AlarmRingsFromLogs = React.createClass({
    getInitialState: function() {
        return {data: null}
    },
    loadRingTimeFromLogsByEmail: function(email) {
        $.ajax({
            url: '/api/device_by_email',
            dataType: 'json',
            type: 'GET',
            data: {
                email: email,
                device_type: "sense"
            },
            success: function (response) {
                var senseIdList = [];
                response.data.forEach(function(d) {
                    if (d.device_account_pair && !$.isEmptyObject(d.device_account_pair)) {
                        senseIdList.push(d.device_account_pair.externalDeviceId);
                    }
                });
                if (senseIdList.length > 0) {
                    this.loadRingTimeFromLogsBySenseIdList(senseIdList);
                }
            }.bind(this)
        });
        return false;
    },
    loadRingTimeFromLogsBySenseIdList: function(senseIdList) {
        $.ajax({
            url: '/api/sense_logs_new',
            dataType: 'json',
            type: 'GET',
            data: {
                query: "text:RINGING",
                categories: JSON.stringify({device_id: senseIdList}),
                start: this.props.start,
                end: this.props.end,
                limit: 60
            },
            success: function (response) {
                console.log(response.results);
                this.setState({data: response.results});
            }.bind(this)
        });
        return false;
    },
    componentWillReceiveProps: function() {
        console.log("email", this.props.email);
        if (this.props.email) {
            this.loadRingTimeFromLogsByEmail(this.props.email);
        }
    },
    render: function() {
        console.log(this.state.data);
        return this.state.data ?
            <Table>
                <thead><th>Sense ID</th><th>Upload Time (UTC)</th></thead>
                <tbody>{
                    this.state.data.sort(function(d1, d2){return d2.variable_1 - d1.variable_1;}).map(function(d){
                        return <tr>
                            <td>{d.device_id}</td>
                            <td>{d3.time.format.utc("%Y-%m-%d %H:%M:%S")(new Date(d.variable_1))}</td>
                        </tr>;
                    })
                }</tbody>
            </Table> : null;
    }
});


var RingTimeHistoryMaster = React.createClass({
    getInitialState: function () {
        return {alert: null, smartAlarmHistory: [], ringTimeHistory: [], email: "", startEpoch: 0, endEpoch: 0};
    },

    loadRingTimeFromServer: function() {
        var email = this.refs.email.getDOMNode().value.trim(),
            start = this.refs.start.refs.start.getDOMNode().value.trim(),
            end = this.refs.end.refs.end.getDOMNode().value.trim();

        var startEpoch = start ? new Date(start + " GMT").getTime() : new Date().getTime() - 8*24*3600*1000,
            endEpoch = end ? new Date(end + " GMT").getTime() : new Date().getTime();

        history.pushState({}, '', '/alarm_rings_history/?email=' + email);

        var reqParams = {email: email, start: startEpoch, end: endEpoch};
        console.log('reqParams', reqParams);
        this.setState(reqParams);
        $.ajax({
            url: '/api/alarm_rings_history',
            dataType: 'json',
            type: 'GET',
            data: reqParams,
            success: function (response) {
                console.log(response);
                if (response.error.isWhiteString()) {
                    this.setState({
                        alert: null,
                        smartAlarmHistory: response.data.smart_alarm_history,
                        ringTimeHistory: response.data.ringtime_history,
                        timezoneHistory: response.data.timezone_history
                    });
                }
                else {
                    this.setState({
                        alert: <Alert bsStyle="danger">{response.error}</Alert>,
                        smartAlarmHistory: [],
                        ringTimeHistory: [],
                        timezoneHistory: []
                    });
                }
            }.bind(this)
        });
        return false;
    },

    componentDidMount: function() {
        var emailFromURL = getParameterByName("email");
        if (emailFromURL) {
            this.refs.email.getDOMNode().value = emailFromURL;
            this.loadRingTimeFromServer();
        }
        return false;
    },

    render: function() {
        return (<div><br/>
            <form className="row" onSubmit={this.loadRingTimeFromServer}>
                <Col xs={3}><input ref="email" type="text" className="form-control" placeholder="email" /></Col>
                <LongDatetimePicker ref="start" reference="start" glyphicon="time" placeHolder="start (GMT) <optional>" size="3" />
                <LongDatetimePicker ref="end" reference="end" glyphicon="time" placeHolder="end (GMT) <optional>" size="3" />
                <Col xs={1}><Button type="submit"><Glyphicon glyph="search" /></Button></Col>
            </form><br/>
            <Row>
                <Col xs={8}>
                    <Tile title="Smart Alarm History" content={<SmartAlarmHistory data={this.state.smartAlarmHistory}/>} />
                    <Tile title="Timezone History" content={<TimezoneHistory data={this.state.timezoneHistory}/>} />
                </Col>
                <Col xs={4}>
                    <Row><Tile title="Alarm Rings From Logs" content={<AlarmRingsFromLogs email={this.state.email} start={this.state.start} end={this.state.end} />} /></Row>
                    <Row><Tile title="Ring Time History" content={<RingTimeHistory data={this.state.ringTimeHistory} />} /></Row>
                </Col>
            </Row>
        </div>);
    }
});

React.render(<RingTimeHistoryMaster />, document.getElementById("alarm-rings-history"));


