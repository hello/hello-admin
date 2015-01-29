/** @jsx React.DOM */

var chartOptions = ["bar", "area", "line", "step", "spline", "area-spline", "area-step"].map(function(c){
    return <option value={c}>{c.capitalize() + " Chart"}</option>;
});

var d = new Date();
d.setDate(d.getDate() - 1);
var yesterday = d3.time.format("%m-%d-%Y")(d);

var RoomConditionsMaestro = React.createClass({
    getInitialState: function() {
        return {
            sound: [],
            light: [],
            motion: [],
            chartType: "bar",
            chartCategory: "sound"
        }
    },

    componentDidMount: function() {
        this.submitWithInputsfromURL();
    },

    submitWithInputsfromURL: function() {
        var emailInputFromURL = getParameterByName('email');
        if (emailInputFromURL.isWhiteString()) {
            return false;
        }
        $('#email-input').val(emailInputFromURL);
        this.downloadData();
    },

    pushHistory: function(email) {
        history.pushState({}, '', '/label/?email=' + email);
    },

    downloadData: function() {
        var emailInput = $('#email-input').val();
        var dateInput = $('#date-input').val();
        var that = this;
        ['sound', 'light'].forEach(function(sensor){
            var roomRequest = {email: emailInput, sensor: sensor, resolution: "day", ts: getUTCEpochFromLocalTime(new Date(dateInput), true)*1000};
            console.log(roomRequest);
            $.ajax({
                url: "/api/room_conditions",
                type: "GET",
                data: roomRequest,
                dataType: "json",
                success: function(response) {
                    console.log(response);
                    that.pushHistory(emailInput);
                    var sensorData = {};
                    sensorData[sensor] = response.data;
                    that.setState(sensorData);
                }
            });
        });
        var motionRequest = {email: emailInput, date: reformatDate(dateInput)};
        $.ajax({
            url: "/api/motion",
            type: 'GET',
            data: motionRequest,
            dataType: 'json',
            success: function(response) {
                console.log(response);
                that.setState({motion: response.data});
                if (response.data.length === 0) {
                    that.setState({alert: "No data"});
                }
                else {
                    that.setState({alert: ""});
                }
                that.pushHistory(emailInput, dateInput);
            }
        });
        return false;
    },

    handleChartType: function() {
        this.setState({chartType: $("#chart-type").val()});
    },

    handleChartCategory: function() {
        this.setState({chartCategory: $('#chart-category').val()})
    },

    render: function() {
        var chartWithLabel = null;
        if (this.state.chartCategory === 'sound') {
            chartWithLabel = <Row><SoundChartWithLabel data={this.state.sound} chartType={this.state.chartType} /></Row>;
        }
        else if (this.state.chartCategory === 'light') {
            chartWithLabel = <Row><LightChartWithLabel data={this.state.light} chartType={this.state.chartType} /></Row>;
        }
        else if (this.state.chartCategory === 'motion') {
            chartWithLabel = <Row><MotionChartWithLabel data={this.state.motion} chartType={this.state.chartType} /></Row>;
        }

        return (<div>
            <form className="row" onSubmit={this.downloadData}>
                <Col xs={3} sm={3} md={3} lg={3} xl={3}>
                    <Input placeholder="email" id="email-input" type="text" />
                </Col>
                <LongDatetimePicker size="2" placeHolder="date" id="date-input" pickTime={false} format="MM-DD-YYYY" defaultDate={yesterday} />
                <Col xs={2} sm={2} md={2} lg={2} xl={2}>
                    <Input id="chart-category" type="select" onChange={this.handleChartCategory}>
                        <option value="sound">Sound</option>
                        <option value="light">Light</option>
                        <option value="motion">Motion</option>
                    </Input>
                </Col>

                <Col xs={3} sm={3} md={3} lg={3} xl={3}>
                    <Button type="submit"><Glyphicon glyph="search" /></Button>
                </Col>
                <Col xs={2} sm={2} md={2}>
                    <Input type="select" id="chart-type" onChange={this.handleChartType}>{chartOptions}</Input>
                </Col>
            </form>
            {chartWithLabel}
        </div>)
    }
});

React.renderComponent(<RoomConditionsMaestro />, document.getElementById('label'));


function reformatDate(dateString) {
    var dateComponents = dateString.split("-");
    var year = dateComponents[2];
    var month = dateComponents[0];
    var date = dateComponents[1];
    return [year, month, date].join("-");
}