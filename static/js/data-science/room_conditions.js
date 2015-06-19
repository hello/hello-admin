/** @jsx React.DOM */

var today = new Date();
var datepickerFormat = d3.time.format("%m/%d/%Y %H:%M:%S");
var todayInDatepickerFormat = datepickerFormat(today);

var hardwareSensorList = ['wave_count', 'hold_count', 'background', 'num_disturb', 'peak_disturb', 'light_variance', 'light_peakiness', 'dust_min', 'dust_max', 'dust_variance', 'temperature', 'humidity', 'particulates', 'light', 'sound'];
var basicSensorList = ['temperature', 'humidity', 'particulates', 'light', 'sound'];
var sensorList = basicSensorList;

var resolutionList = ['day', 'week'];
var colorChoice = {
    temperature: {day: '#E30B5C', week: 'pink'},
    humidity: {day: '#8db600', week: 'teal'},
    particulates: {day: '#00ffff', week: 'blue'},
    light: {day: 'orange', week: 'brown'},
    sound: {day: 'teal', week: 'indigo'},
    wave_count: {day: 'red', red: 'violet'},
    hold_count: {day: 'red', week: 'violet'},
    background: {day: 'red', week: 'violet'},
    num_disturb: {day: 'red', week: 'violet'},
    peak_disturb: {day: 'red', week: 'violet'},
    light_variance: {day: 'red', week: 'violet'},
    light_peakiness: {day: 'red', week: 'violet'},
    dust_min: {day: 'red', week: 'violet'},
    dust_max: {day: 'red', week: 'violet'},
    dust_variance: {day: 'red', week: 'violet'}
};

var yAxisLabel = {
    temperature: "Temperature ( °C )",
    humidity: "Humidity ( % )",
    particulates: "Particulates ( µg/m³ )",
    light: "Light ( lx )",
    sound: "Sound ( dB )",
    wave_count: "Wave Count ( times )",
    hold_count: "Hold Count ( times )",
    background: "Background ( times )",
    num_disturb: "Number of Disturbances ( times )",
    peak_disturb: "Peak Disturbances ( times )",
    light_variance: "Light Variance",
    light_peakiness: "Light Peakiness",
    dust_min: "Dust Min",
    dust_max: "Dust Max",
    dust_variance: "Dust Variance"
};

var legends = {
    day: 'every 5 minutes',
    week: 'every hour'
};


var vizCanvas = React.createClass({
    render: function() {
//        d3.selectAll("svg > *").remove();
        return <div>{
            sensorList.map(function(s) {
                var sensorData = this.props.data[s];
                if (sensorData.length > 0) {
                    nv.addGraph(function () {
                        var chart = nv.models.lineChart()
                            .margin({left: 75, right: 50})
                            .useInteractiveGuideline(true)
                            .transitionDuration(350)
                            .showLegend(true)
                            .showYAxis(true)
                            .showXAxis(true);

                        chart.xAxis
                            .axisLabel('Time')
                            .tickFormat(function (d) {
                                return d3.time.format('%b %d %H:%M')(new Date(d));
                            });

                        chart.yAxis
                            .axisLabel(yAxisLabel[s])
                            .tickFormat(function (d) {
                                return d.toFixed(2);
                            });

                        d3.select('#' + s)
                            .datum(sensorData)
                            .call(chart);

                        nv.utils.windowResize(function () {
                            chart.update()
                        });
                        return chart;
                    });
                    return <div id={s + "-wrapper"}>
                        <h4 className="chart-title">{s.split("_").map(function(c){return c.capitalize()}).join(" ")}</h4>
                        <svg id={s} />
                    </div>;
                }
            }.bind(this))
        }</div>;
    }
});

var vizForm = React.createClass({
    getInitialState: function() {
        return sensorList.reduce(function(obj, k){obj[k] = [];return obj}, {alert: ""});
    },

    componentDidMount: function() {
        this.submitWithInputsfromURL();
    },

    submitWithInputsfromURL: function() {
        var emailInputFromURL = getParameterByName('email');
        var until = getParameterByName('until');
        if (emailInputFromURL.isWhiteString()) {
            return false;
        }
        $('#email-input').val(emailInputFromURL);
        $('#end-time').val(until);
        this.handleBasicSubmit();
    },

    pushHistory: function(email, until) {
        history.pushState({}, '', '/room_conditions/?email=' + email + '&until=' + until);
    },

    loadData: function() {
        var email = $('#email-input').val().trim();
        var until = $('#end-time').val().trim();
        this.setState(sensorList.reduce(function(obj, k){obj[k] = [];return obj}, {alert: "Loading ..."}));
        sensorList.forEach(function(sensor){
            resolutionList.forEach(function(resolution){
                var request_params = {
                    email: email,
                    sensor: sensor,
                    resolution: resolution,
                    ts: new Date(until).getTime()
                };
                console.log('sending', request_params);
                this.pushHistory(email, until);
                $.ajax({
                    url: '/api/room_conditions',
                    dataType: 'json',
                    data: request_params,
                    type: 'GET',
                    success: function(response) {
                        console.log(response);
                        if (response.error.isWhiteString()) {
                            var d = {};
                            d[sensor] = this.state[sensor];
                            if (d[sensor].length === resolutionList.length) {
                                d[sensor] = [];
                            }
                            d[sensor].push(manipulateData(response.data, sensor, resolution));
                            d["alert"] = "";
                            this.setState(d);
                        }
                        else {
                            this.setState({alert: response.error});
                        }
                    }.bind(this),
                    error: function(xhr, status, err) {
                        console.error(status, err);
                    }.bind(this)
                });
            }.bind(this));
        }.bind(this));
    },

    handleBasicSubmit: function() {
        sensorList = basicSensorList;
        this.loadData();
        return false;
    },

    handleHardwareSubmit: function() {
        sensorList = hardwareSensorList;
        this.loadData();
        return false;
    },

    render: function() {
        var alert = this.state.alert === "" ? null : <div><br/><Alert>{this.state.alert}</Alert></div>;
        var fileExporters = sensorList.map(function(sensor, i){
            return <MenuItem eventKey={i.toString()}>
                <FileExporter fileContent={this.state[sensor]} fileName={sensor} buttonName={sensor.capitalize()}/>
            </MenuItem>;
        }.bind(this));
        return (<div>
            <form onSubmit={this.handleBasicSubmit} className="row">
                <Col xs={3}>
                    <p className="icon-addon addon-xs">
                        <input id="email-input" className="form-control" placeholder="email"/>
                        <label className="glyphicon glyphicon-user"></label>
                    </p>
                </Col>
                <LongDatetimePicker placeHolder="end time" id="end-time" defaultDate={todayInDatepickerFormat} glyphicon="time" />
                <Col xs={1}>
                    <Button type="submit" bsStyle="success"><Glyphicon glyph="search"/></Button>
                </Col>
                <Col xs={2}>
                    <Button bsStyle="warning" onClick={this.handleHardwareSubmit}><Glyphicon glyph="search"/> for hardware</Button>
                </Col>
                <Col xs={1}>
                    <DropdownButton bsStyle="info" title="&darr; JSON">{fileExporters}</DropdownButton>
                </Col>
            </form>
            {alert}
            <vizCanvas data={this.state}/>
        </div>)
    }
});
var vizBox = React.createClass({
    render: function() {
        return (<code className="nonscript">
            <vizForm />
        </code>)
    }
});

React.renderComponent(<vizBox />, document.getElementById('room-conditions'));

function manipulateData(rawData, sensor, resolution) {
    return {
        values: rawData.filter(function(point){return point.value !== -1}).map(function(point){return {x: point.datetime, y: point.value};}),
        key: legends[resolution],
        color: colorChoice[sensor][resolution]
    }
}

