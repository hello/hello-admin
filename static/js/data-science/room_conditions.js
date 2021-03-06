/** @jsx React.DOM */

var today = new Date();
var datepickerFormat = d3.time.format("%m/%d/%Y %H:%M:%S");
var todayInDatepickerFormat = datepickerFormat(today);

var allSensors = ['wave_count', 'hold_count', 'background', 'num_disturb', 'peak_disturb', 'light_variance', 'light_peakiness', 'dust_min', 'dust_max', 'dust_variance', 'temperature', 'humidity', 'particulates', 'light', 'sound'];
var basicSensors = ['temperature', 'humidity', 'particulates', 'particulates_smooth', 'light', 'sound'];
var sensors = basicSensors;

var resolutionList = ['day', 'week', 'minute'];
var colorChoice = {
    temperature: {day: "#009BFF", week: "#41D7AB", minute: "#FFAA00"},
    humidity: {day: "#009BFF", week: "#41D7AB", minute: "#FFAA00"},
    particulates: {day: "#009BFF", week: "#41D7AB", minute: "#FFAA00"},
    particulates_smooth: {day: "#009BFF", week: "#41D7AB", minute: "#FFAA00"},
    light: {day: "#009BFF", week: "#41D7AB", minute: "#FFAA00"},
    sound: {day: "#009BFF", week: "#41D7AB", minute: "#FFAA00"},
    wave_count: {day: "#009BFF", week: "#41D7AB", minute: "#FFAA00"},
    hold_count: {day: "#009BFF", week: "#41D7AB", minute: "#FFAA00"},
    background: {day: "#009BFF", week: "#41D7AB", minute: "#FFAA00"},
    num_disturb: {day: "#009BFF", week: "#41D7AB", minute: "#FFAA00"},
    peak_disturb: {day: "#009BFF", week: "#41D7AB", minute: "#FFAA00"},
    light_variance: {day: "#009BFF", week: "#41D7AB", minute: "#FFAA00"},
    light_peakiness: {day: "#009BFF", week: "#41D7AB", minute: "#FFAA00"},
    dust_min: {day: "#009BFF", week: "#41D7AB", minute: "#FFAA00"},
    dust_max: {day: "#009BFF", week: "#41D7AB", minute: "#FFAA00"},
    dust_variance: {day: "#009BFF", week: "#41D7AB", minute: "#FFAA00"}
};

var yAxisLabel = {
    temperature: "Temperature ( °C )",
    humidity: "Humidity ( % )",
    particulates: "Raw Particulates ( µg/m³ )",
    particulates_smooth: "Smooth Particulates ( µg/m³ )",
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
    day: 'every 5 minutes last 24 hours',
    week: 'every hour last week',
    minute: 'every minute last 24 hours '
};

var vizCanvas = React.createClass({
    render: function() {
//        d3.selectAll("svg > *").remove();
        return <div>{
            sensors.map(function(s) {
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
                        <h4 className="chart-title">{yAxisLabel[s]}</h4>
                        <svg id={s} />
                    </div>;
                }
            }.bind(this))
        }</div>;
    }
});

var RoomConditionMaster = React.createClass({
    getInitialState: function() {
        return sensors.reduce(function(obj, k){obj[k] = [];return obj}, {alert: "", allSensors: false});
    },

    componentDidMount: function() {
        this.submitWithInputsfromURL();
    },

    submitWithInputsfromURL: function() {
        var emailInputFromURL = getParameterByName('email');
        var until = getParameterByName('until');
        this.setState({allSensors: getParameterByName("all_sensors") === 'true'});

        if (emailInputFromURL.isWhiteString()) {
            return false;
        }
        $('#email-input').val(emailInputFromURL);
        $('#end-time').val(until);

        if (this.state.allSensors === true) {
            this.handleHardwareSubmit();
        }
        else {
            this.handleBasicSubmit();
        }
    },

    pushHistory: function(email, until, allSensors) {
        history.pushState({}, '', '/room_conditions/?email=' + email + '&until=' + until + "&all_sensors=" + allSensors);
    },

    loadData: function(allSensors) {
        var email = $('#email-input').val().trim();
        var until = $('#end-time').val().trim();
        this.setState(sensors.reduce(function(obj, k){obj[k] = [];return obj}, {alert: "Loading ..."}));
        this.pushHistory(email, until, allSensors);

        sensors.forEach(function(sensor){
            resolutionList.forEach(function(resolution){
                var request_params = {
                    email: email,
                    sensor: sensor,
                    resolution: resolution,
                    ts: new Date(until).getTime()
                };
                console.log('sending', request_params);
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
        sensors = basicSensors;
        this.loadData(false);
        return false;
    },

    handleHardwareSubmit: function() {
        sensors = allSensors;
        this.loadData(true);
        return false;
    },

    render: function() {
        var alert = this.state.alert === "" ? null : <div><br/><Alert>{this.state.alert}</Alert></div>;

        var JsonExporter = sensors.map(function(sensor, i){
            console.log(this.state[sensor]);
            return <MenuItem eventKey={i.toString()}>
                <FileExporter fileContent={this.state[sensor]} fileName={sensor} buttonName={sensor.capitalize()}/>
            </MenuItem>;
        }.bind(this));

        var CsvExporter = sensors.map(function(sensor, i){
            var csvContent = [];
            this.state[sensor].forEach(function(part){
                csvContent.push(part.key + "," + sensor);
                part.values.forEach(function(value){
                    csvContent.push(value.x + "," + value.y);
                }.bind(this));
            }.bind(this));
            return <MenuItem eventKey={i.toString()}>
                <FileExporter fileContent={csvContent.join("\r\n")} fileName={sensor} dataType="data:text/csv," buttonName={sensor.capitalize()} needStringify={false}/>
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
                    <Button type="submit"><Glyphicon glyph="search"/></Button>
                </Col>
                <Col xs={1}>
                    <Button onClick={this.handleHardwareSubmit}><Glyphicon glyph="search"/> HW</Button>
                </Col>
                <Col xs={2}>
                    <DropdownButton bsStyle="info" title="&darr; JSON">{JsonExporter}</DropdownButton>
                </Col>
                <Col xs={2}>
                    <DropdownButton bsStyle="info" title="&darr; CSV">{CsvExporter}</DropdownButton>
                </Col>
            </form>
            {alert}
            <vizCanvas data={this.state}/>
        </div>)
    }
});

React.renderComponent(<RoomConditionMaster />, document.getElementById('room-conditions'));

function manipulateData(rawData, sensor, resolution) {
    return {
        values: rawData.map(function(point){return {x: point.datetime, y: point.value};}),
        key: legends[resolution],
        color: colorChoice[sensor][resolution],
        disabled: resolution !== "day"
    }
}

