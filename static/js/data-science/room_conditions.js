/** @jsx React.DOM */

var sensors = ['temperature', 'humidity', 'particulates', 'light', 'sound'];
var chartOptions = ["step", "spline", "area", "area-spline", "area-step", "line", "bar"].map(function(c){
    return <option value={c}>{c.capitalize() + " Chart"}</option>;
});

var RoomConditionsMaestro = React.createClass({
    getInitialState: function() {
        return {
            temperature: [],
            humidity: [],
            particulates: [],
            light: [],
            sound: [],
            chartType: "step"
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
        this.handleSubmit();
    },

    pushHistory: function(email) {
        history.pushState({}, '', '/room_conditions/?email=' + email);
    },

    handleSubmit: function() {
        var emailInput = $('#email-input').val();
        var resolutionInput = $('#resolution-input').val();
        var that = this;
        sensors.forEach(function(sensor){
            $.ajax({
                url: "/api/room_conditions",
                type: "GET",
                data: {email: emailInput, sensor: sensor, resolution: resolutionInput},
                dataType: "json",
                success: function(response) {
                    that.pushHistory(emailInput);
                    var sensorData = {};
                    sensorData[sensor] = manipulateData(response.data);
                    that.setState(sensorData);
                }
            });
        });
        return false;
    },

    handleChartType: function() {
        this.setState({chartType: $("#chart-type").val()});
    },

    render: function() {
        return (<div>
            <form className="row" onSubmit={this.handleSubmit}>
                <Col xs={3} sm={3} md={3} lg={3} xl={3}>
                    <Input id="email-input" type="text" />
                </Col>
                <Col xs={2} sm={2} md={2} lg={2} xl={2}>
                    <Input id="resolution-input" type="select">
                        <option value="day">Last day</option>
                        <option value="week">Last week</option>
                    </Input>
                </Col>
                <Col xs={3} sm={3} md={3} lg={3} xl={3}>
                    <Button type="submit"><Glyphicon glyph="search" /></Button>
                </Col>
                <Col xs={2} sm={2} md={2}>
                    <Input type="select" id="chart-type" onChange={this.handleChartType}>{chartOptions}</Input>
                </Col>
            </form>
            <Row><TemperatureChart data={this.state.temperature} chartType={this.state.chartType} /></Row>
            <Row><HumidityChart data={this.state.humidity} chartType={this.state.chartType} /></Row>
            <Row><ParticulatesChart data={this.state.particulates} chartType={this.state.chartType} /></Row>
            <Row><LightChart data={this.state.light} chartType={this.state.chartType} /></Row>
            <Row><SoundChart data={this.state.sound} chartType={this.state.chartType} /></Row>
        </div>)
    }
});

React.renderComponent(<RoomConditionsMaestro />, document.getElementById('room-conditions'));

function manipulateData(rawData) {
    return rawData.map(function(d){
        return {
            datetime: d.datetime,
            value: d.value
        }
    });
}