/** @jsx React.DOM */

var BatteryChart = React.createClass({
    render: function () {
        var batteryChart, that = this;
        var processedData = manipulateData(that.props.data, "lastSeen", "batteryLevel");
        console.log(processedData);
        nv.addGraph(function() {
            batteryChart = nv.models.lineChart()
                .margin({left: 75, right: 50})
                .useInteractiveGuideline(true)
                .transitionDuration(350)
                .showLegend(false)
                .showYAxis(true)
                .showXAxis(true);

            batteryChart.xAxis
                .axisLabel('Time')
                .tickFormat(function(d) { return d3.time.format('%b %d %H:%M')(new Date(d)); });
//                .tickFormat(function(d) { return d; });

            batteryChart.yAxis
                .axisLabel('Battery Level (%)')
                .tickFormat(function(d) {return d;});

            d3.select('#battery-chart')
                .datum(processedData)
                .call(batteryChart);
            nv.utils.windowResize(function() { batteryChart.update() });

            return batteryChart;
        });
        return (
            <svg id="battery-chart"/>
            )
    }
});

var UptimeChart = React.createClass({
    render: function () {
        var uptimeChart, that = this;
        var processedData = manipulateData(that.props.data, "lastSeen", "uptime");
        console.log(processedData);
        nv.addGraph(function() {
            uptimeChart = nv.models.lineChart()
                .margin({left: 75, right: 50})
                .useInteractiveGuideline(true)
                .transitionDuration(350)
                .showLegend(false)
                .showYAxis(true)
                .showXAxis(true);

            uptimeChart.xAxis
                .axisLabel('Time')
                .tickFormat(function(d) { return d3.time.format('%b %d %H:%M')(new Date(d)); });
//                .tickFormat(function(d) { return d; });

            uptimeChart.yAxis
                .axisLabel('Uptime (ms)')
                .tickFormat(function(d) {return d;});

            d3.select('#uptime-chart')
                .datum(processedData)
                .call(uptimeChart)
            nv.utils.windowResize(function() { uptimeChart.update() });

            return uptimeChart;
        });
        return (
            <svg id="uptime-chart"/>
            )
    }
});


var BatteryMaestro = React.createClass({
    getInitialState: function() {
        return {data: []}
    },
    handleSubmit: function() {
        var that = this;
        var email = $('#email-input').val();
        var request_params = {
            email: email
        };
        $.ajax({
            url: '/api/battery',
            dataType: 'json',
            data: request_params,
            type: 'GET',
            success: function(response) {
                history.pushState({}, '', '/battery/?email=' + email);
                that.setState({data: response.data});
            }
        });
        return false;
    },

    submitWithInputsfromURL: function() {
        var emailInputFromURL = getParameterByName('email');
        if (emailInputFromURL.isWhiteString()) {
            return false;
        }
        $('#email-input').val(emailInputFromURL);
        this.handleSubmit();
    },

    componentDidMount: function() {
        this.submitWithInputsfromURL();
    },

    render: function () {
        var chart = (this.state.data.length === 0) ? null:
            [<BatteryChart data={this.state.data}/>, <UptimeChart data={this.state.data}/>];
        return (<div>
            <form onSubmit={this.handleSubmit} className="row">
                <Col xs={3} md={3}>
                    <Input id="email-input" type="text" addonBefore={<Glyphicon glyph="user"/>} placeholder="user email" />
                </Col>
                <Col xs={2} md={2}>
                    <Button bsStyle="info" type="submit">{<Glyphicon glyph="search"/>}</Button>
                </Col>
            </form>
            {chart}
        </div>)
    }
});

React.renderComponent(<BatteryMaestro />, document.getElementById('battery'));

function manipulateData(rawData, xAttr, yAttr) {
    var points = [];
    var sortedData = rawData.sort(compareTimestamp);
    sortedData.forEach(function(point) {
       points.push({
          x: point[xAttr],
          y: point[yAttr]
       });
    });
    return [{
        values: points,
        key: yAttr,
        color: getChartColor(yAttr)
    }]
}

function getChartColor(category) {
    var colors = {
        batteryLevel: "orangered",
        uptime: "green"
    };
    return colors[category];
}

function compareTimestamp(log1, log2) {
    if (log1.lastSeen < log2.lastSeen) {
        return -1;
    }
    if (log1.lastSeen > log2.lastSeen) {
        return 1;
    }
    return 0;
}
