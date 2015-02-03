/** @jsx React.DOM */


var Alarms = React.createClass({
    cool: function(e) {
        this.props.parent.removeAlarm(Number($(e.target).attr("id")));
    },

    render: function(){
        var that = this;
        var alarms = this.props.parent.state.alarms.map(function(alarm, index) {
            return [
                <tr className="alarm">
                    <td><LongDatetimePicker size="12" id={"alarm"+index} placeHolder="input an alarm" className="alarm-input" defaultDate={formatAlarmDateTime(alarm)}/></td>,
                    <td><select className="repeated form-control" >{binaryOptions(alarm.repeated)}</select></td>,
                    <td><select className="enabled form-control" >{binaryOptions(alarm.enabled)}</select></td>,
                    <td><select className="editable form-control" >{binaryOptions(alarm.editable)}</select></td>,
                    <td><select className="smart form-control" >{binaryOptions(alarm.smart)}</select></td>,
                    <td><input className="sound form-control" type="text" value={JSON.stringify(alarm.sound)}/></td>
                    <td><input className="week-days form-control" type="text" value={JSON.stringify(alarm.day_of_week)}/></td>
                    <td><Button className="remove-row" id={index} onClick={that.cool}><Glyphicon id={index} glyph="remove"/></Button></td>
                </tr>
            ];
        });
        return (<Table>
            <thead>
                <tr>
                    <th className="col-xs-3 col-sm-3 col-md-3 alert-info">Alarm DateTime</th>
                    <th className="col-xs-1 col-sm-1 col-md-1 alert-warning">Repeated</th>
                    <th className="col-xs-1 col-sm-1 col-md-1 alert-warning">Enabled</th>
                    <th className="col-xs-1 col-sm-1 col-md-1 alert-warning">Editable</th>
                    <th className="col-xs-1 col-sm-1 col-md-1 alert-warning">Smart</th>
                    <th className="col-xs-2 col-sm-2 col-md-2 alert-success">Sound</th>
                    <th className="col-xs-2 col-sm-2 col-md-2 alert-success">Day(s) of week</th>
                    <th className="col-xs-1 col-sm-1 col-md-1 alert-danger">Remove</th>
                </tr>
            </thead>
            <tbody>
                {alarms}
            </tbody>
        </Table>)
    }
});
var AlarmsMaster = React.createClass({
    getInitialState: function() {
        return {alarms: [], error: null, token: ""}
    },

    handleSubmit: function() {
        var that = this;
        var requestData = {
            username: $('#email-input').val(),
            password: $('#password-input').val(),
            app: "admin-alarms"
        };
        $.ajax({
            url: '/api/tokens',
            dataType: 'json',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify(requestData),
            success: function(response) {
                that.setState({token: response.data.token, error: null});
                that.getAlarms();
            }.bind(that)
        });
        return false;
    },

    getAlarms: function() {
        var that = this;
        var requestData = {
            impersonatee_token: that.state.token
        };
        $.ajax({
            url: '/api/alarms',
            dataType: 'json',
            type: 'GET',
            data: requestData,
            success: function(response) {
                console.log(response);
                if (response.status === 200) {
                    that.setState({alarms: response.data});
                }
                else {
                    that.setState({error: response.error});
                }
            }.bind(that)
        });
    },

    addAlarm: function() {
        var alarms = this.state.alarms;
        if (alarms.length > 0) {
            alarms.push(alarms.last());
        }
        else {
            futureDateTime = new Date();
            futureDateTime.setMinutes(futureDateTime.getMinutes() + 5);
            alarms.push({
                year: futureDateTime.getFullYear(),
                month: futureDateTime.getMonth(),
                day_of_month: futureDateTime.getDate(),
                hour: futureDateTime.getHours(),
                minute: futureDateTime.getMinutes(),
                repeated: false,
                enabled: true,
                editable: true,
                smart: false,
                sound: {url: "", id: 4, name: "Pulse"},
                day_of_week: []
            });
        }
        this.setState({alarms: alarms});
    },

    removeAlarm: function(index) {
        var alarms = this.state.alarms;
        alarms.splice(index, 1);
        this.setState({alarms: alarms});
    },

    fetchUIAlarms: function() {
        return $(".alarm").toArray().map(function(alarmRow, index){
            var alarmDateTime = new Date($('#alarm' + index).val());
            var alarmTd = $(alarmRow).children();
            return {
                year: alarmDateTime.getFullYear(),
                month: alarmDateTime.getMonth(),
                day_of_month: alarmDateTime.getDate(),
                hour: alarmDateTime.getHours(),
                minute: alarmDateTime.getMinutes(),
                repeated: alarmTd.children(".repeated").val() === "True",
                enabled: alarmTd.children(".enabled").val() === "True",
                editable: alarmTd.children(".editable").val() === "True",
                smart: alarmTd.children(".smart").val() === "True",
                sound: JSON.parse(alarmTd.children(".sound").val()),
                day_of_week: JSON.parse(alarmTd.children(".week-days").val())
            };
        });
    },

    setAlarms: function() {
        var that = this;
        var postData = JSON.stringify({
            client_time_utc: new Date().getTime(),
            impersonatee_token: that.state.token,
            data: that.fetchUIAlarms()
        });
        console.log('postData', postData);
        $.ajax({
            url: '/api/alarms',
            dataType: 'json',
            type: 'POST',
            contentType: 'application/json',
            data: postData,
            success: function(response) {
                console.log('alarm', response);
                if (response.status === 200) {
                    that.setState({alarms: response.data});
                }
                else {
                    that.setState({error: response.error});
                }
            }.bind(that)
        });
    },

    render: function() {
        return (<div>
            <form onSubmit={this.handleSubmit}>
                <Col xs={3} sm={3} md={3} lg={3} xl={3}>
                    <Input id="email-input" placeholder="Email" type="text" />
                </Col>
                <Col xs={4} sm={4} md={4} lg={4} xl={4}>
                    <Input id="password-input" placeholder="Password (required on first use)" type="password" />
                </Col>
                <Col>
                    <Button bsStyle="success" type="submit"><Glyphicon glyph="search"/></Button>
                </Col>
            </form>
            <Alarms parent={this} removeAlarm={this.removeAlarm} />
            <Row>
                <Col xs={3} sm={3} md={3} lg={3} xl={3} xsOffset={3} smOffset={3} mdOffset={3} lgOffset={3} xlOffset={3}>
                    <Button onClick={this.addAlarm}><Glyphicon glyph="plus"/></Button>
                </Col>
                <Col xs={3} sm={3} md={3} lg={3} xl={3}>
                    <Button onClick={this.setAlarms}><Glyphicon glyph="save"/></Button>
                </Col>
            </Row>
        </div>)
    }
});

React.renderComponent(<AlarmsMaster />, document.getElementById('alarms'));

function formatAlarmDateTime(dt) {
    var alarmDateTime = new Date(dt.year, dt.month, dt.day_of_month, dt.hour, dt.minute);
    return d3.time.format("%m-%d-%Y %I:%M:%S %p")(alarmDateTime);
}

function binaryOptions(condition) {
    return condition === true ? [
        <option>True</option>,
        <option>False</option>
    ]:[
        <option>False</option>,
        <option>True</option>
    ]
}