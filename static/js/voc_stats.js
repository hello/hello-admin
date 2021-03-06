/** @jsx React.DOM */

var c3Chart = React.createClass({
    getDefaultProps: function() {
        return {id: "chart"}
    },
    render: function() {
        var that = this, categories = ["tvoc", "eco2", "current", "voltage", "temp", "humid"], stackingGroups = [];

        if (that.props.data === {}) {
            return <div/>;
        }

        var graphs = Array.apply(null, {length: 3}).map(Number.call, Number).map(function(i){
            return <Row><div id={"graph" + i.toString()} className="c3-chart"></div></Row>;
        });
        Object.keys(that.props.data).forEach(function(deviceId, i){
            c3.generate({
                bindto: "#graph" + i.toString(),
                data: {
                    type: that.props.chartType,
                    json: that.props.data[deviceId],
                    keys: {
                        x: 'timestamp',
                        value: categories
                    },
                    groups: stackingGroups,
                    colors: {
                        tvoc: "lightgreen",
                        eco2: "grey",
                        current: "green",
                        voltage: "red",
                        temp: "orange",
                        humid: "blue"
                    }
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            fit: true,
                            format: function (x) { return d3.time.format.utc('%b %d %H:%M')(new Date(x));},
                            count: 40
                        },
                        label: {
                            text: "Time",
                            position: 'outer-center'
                        }
                    },
                    y: {
                        label: {
                            text: "Units (whatever they are)",
                            position: 'outer-middle'
                        }
                    }
                },
                bar: {
                    width: {
                        ratio: 0.4
                    }
                },
                grid: {
                    y: {
                        show: false
                    }
                },
                zoom: {
                    enabled: that.props.zoomable
                },
                legend: {
                    position: "right"
                }
            });
            d3.select("#graph" + i.toString() + " svg").append('text')
                .attr('x', d3.select("#graph" + i.toString() + " svg").node().getBoundingClientRect().width / 2)
                .attr('y', 16)
                .attr('text-anchor', 'middle')
                .style('font-size', '1.4em')
                .text("Sense " + deviceId);
            });
        return(<div>
            <Button bsSize="small"><FileExporter fileContent={this.props.data} fileName="voc-statistics"/></Button>
            {graphs}
        </div>)
    }
});

var VOCStatsChart = React.createClass({
    getInitialState: function() {
        return {
            data: {},
            zoomable: false,
            chartType: "line"
        }
    },

    componentDidMount: function(){
        this.submitWithInputsfromURL();
    },

    submitWithInputsfromURL: function() {
        var deviceIdFromURL = getParameterByName('device_id');
        var dateFromURL = getParameterByName('date');
        var lengthFromURL = getParameterByName('length') || 100;

        $('#length').val(lengthFromURL);
        $('#date').val(dateFromURL);

        if (deviceIdFromURL.isWhiteString()) {
            return false;
        }

        $('#device-id-input').val(deviceIdFromURL);

        this.handleSubmit();
    },

    pushHistory: function(deviceId, date, length) {
        history.pushState({}, '', '/voc_stats/?device_id=' + deviceId  + "&date=" + date + "&length=" + length);
    },

    handleSubmit: function() {
        var that = this;
        var deviceIds = $('#device-id-input').val().split(",");
        var date = $('#date').val();
        var length = $('#length').val();
        that.pushHistory(deviceIds, date, length);
        var aggData = {};
        deviceIds.forEach(function(deviceId){
            var requestData = {
                device_id: deviceId.trim(),
                start_time: reformatDate(date),
                length: length,
                type: "voc"
            };
            $.ajax({
                url: "/api/device_stats",
                type: "GET",
                dataType: "json",
                async: false,
                data: requestData,
                success: function(response) {
                    console.log(response.data);
                    aggData[deviceId.trim()] = response.data.sort(compareTimestamp);
                }
            });
        });
        that.setState({data: aggData});
        console.log(aggData);
        return false;
    },

    render: function() {
        return (<div>
            <form className="row" onSubmit={this.handleSubmit}>
                <Col xs={4} sm={4} md={4}>
                    <LongTagsInput id="device-id-input" tagClass="label label-info" placeHolder="SenseIDs" />
                </Col>
                <LongDatetimePicker size="3" placeHolder={moment.utc().format("YYYY-MM-DD HH:mm:ss")} id="date" pickTime={true} format="MM-DD-YYYY HH:mm:ss" useSeconds={false} useCurrent={false} defaultDate={moment.utc().format("YYYY-MM-DD HH:mm:ss")} minDate={moment().subtract(14, 'd')} maxDate={moment().add(1, 'd')} />
                <Col xs={2} sm={2} md={2}>
                    <Input id="length" type="text" placeholder="# data points"/>
                </Col>
                <Col xs={1} sm={1} md={1}>
                    <Button bsStyle="info" bsSize="large" className="btn-circle" type="submit"><Glyphicon glyph="search"/></Button>
                </Col>
            </form>
            <p className="chart-remark">Notes: <br/>
                &nbsp;&nbsp;- This chart relies on logging consistency, {'regex_pattern = "TVOC (\\d+),(\\d+),(\\d+),(\\d+),(\\d+),(\\d+)"'}<br/>
                &nbsp;&nbsp;- Can display data for up to 3 senses at once.<br/>
                &nbsp;&nbsp;- All times UTC
            </p><br/>
            <Row>
                <Col xs={12} sm={12} md={12}>
                    <c3Chart id="voc-stats-chart" data={this.state.data} zoomable={this.state.zoomable} chartType={this.state.chartType}/>
                </Col>
            </Row>
        </div>)
    }
});

React.renderComponent(<VOCStatsChart />, document.getElementById('voc-stats'));

function compareTimestamp(log1, log2) {
    return (log1.timestamp > log2.timestamp);
}

function reformatDate(dateString) {
    var dateTimeSplit = dateString.split(" ");
    var dateComponents = dateTimeSplit[0].split("-");
    var year = dateComponents[2];
    var month = dateComponents[0];
    var day = dateComponents[1];
    var startEpochMillis = new Date([year, month, day].join("-") + " " + dateTimeSplit[1] + " GMT").getTime();
    return startEpochMillis;
}