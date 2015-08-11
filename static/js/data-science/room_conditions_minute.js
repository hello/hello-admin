/** @jsx React.DOM */

var today = new Date();
var datepickerFormat = d3.time.format("%m/%d/%Y %H:%M:%S");
var todayInDatepickerFormat = datepickerFormat(today);

var allSensors = ['particulates', 'dust_min', 'dust_max', 'dust_variance','dust_raw'];
var sensors = allSensors;

var resolutionList = ['day'];
var colorChoice = {
    particulates: {day: '#00ffff', minute: 'blue'},
    dust_min: {day: 'red', minute: 'violet'},
    dust_max: {day: 'red', minute: 'violet'},
    dust_variance: {day: 'red', minute: 'violet'},
    dust_raw: {day: 'red', minute: 'pink'}
};

var yAxisLabel = {
    particulates: "Particulates ( µg/m³ )",
    dust_min: "Dust Min",
    dust_max: "Dust Max",
    dust_variance: "Dust Variance",
    dust_raw : "Raw dust"
};

var legends = {
    day: 'every minute',
    minute: 'every hour'
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
                            .showLegend(false)
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
        history.pushState({}, '', '/room_conditions_minute/?email=' + email + '&until=' + until + "&all_sensors=" + allSensors);
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
                    resolution: "minute",
                    ts: new Date(until).getTime()
                };
                console.log('sending', request_params);
                $.ajax({
                    url: '/api/room_conditions',
                    dataType: 'json',
                    data: request_params,
                    type: 'GET',
                    success: function(response) {
                        console.log("sensor", response);
                        if (response.error.isWhiteString()) {
                            var d = {};
                            d[sensor] = this.state[sensor];
                            if (d[sensor].length === resolutionList.length) {
                                d[sensor] = [];
                            }
                            d[sensor].push(manipulateData(response.data, sensor, resolution, email));
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
        sensors = allSensors;
        this.loadData(false);
        return false;
    },

    render: function() {
        var alert = this.state.alert === "" ? null : <div><br/><Alert>{this.state.alert}</Alert></div>;
        var fileExporters = sensors.map(function(sensor, i){
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

function manipulateData(rawData, sensor, resolution, email) {
    var offsetScale;
    switch (email) {
        default: offsetScale = 1;
    }
    return {
        values: rawData.filter(function(point){return point.value !== -1}).map(function(point){return {x: point.datetime, y: point.value * offsetScale};}),
        key: legends[resolution],
        color: colorChoice[sensor][resolution],
        disabled: resolution !== "day"
    }
}


