/** @jsx React.DOM */

var c3Chart = React.createClass({
    getDefaultProps: function() {
        return {id: "chart"}
    },
    render: function() {
        var that = this, categories = ["variance", "max", "min", "average"], stackingGroups = [];

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
                    axes: {
                        variance: "y2"
                    },
                    colors: {
                        average: "orangered",
                        max: "#0D98BA",
                        min: "green",
                        variance: "violet"
                    }
                },
                axis: {
                    x: {
                        tick: {
                            format: function (x) { return d3.time.format('%b %d %H:%M')(new Date(x));}
                        },
                        label: {
                            text: "Time",
                            position: 'outer-center'
                        }
                    },
                    y: {
                        label: {
                            text: "Count",
                            position: 'outer-middle'
                        }
                    },
                    y2: {
                        show: true,
                        label: {
                            text: "Variance",
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
            <Button bsSize="small"><FileExporter fileContent={this.props.data} fileName="dust-statistic"/></Button>
            {graphs}
        </div>)
    }
});

var DustStatsChart = React.createClass({
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
        history.pushState({}, '', '/dust_stats/?device_id=' + deviceId  + "&date=" + date + "&length=" + length);
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
                length: length
            };
            $.ajax({
                url: "/api/dust_stats",
                type: "GET",
                dataType: "json",
                async: false,
                data: requestData,
                success: function(response) {
                    aggData[deviceId.trim()] = response.data.sort(compareTimestamp);
                }
            });
        });
        that.setState({data: aggData});
        return false;
    },

    render: function() {
        return (<div>
            <form className="row" onSubmit={this.handleSubmit}>
                <Col xs={4} sm={4} md={4}>
                    <LongTagsInput id="device-id-input" tagClass="label label-info" placeHolder="SenseIDs" />
                </Col>
                <LongDatetimePicker size="2" placeHolder="date" id="date" pickTime={false} format="MM-DD-YYYY" />
                <Col xs={2} sm={2} md={2}>
                    <Input id="length" type="text" placeholder="# data points"/>
                </Col>
                <Col xs={1} sm={1} md={1}>
                    <Button bsStyle="info" bsSize="large" className="btn-circle" type="submit"><Glyphicon glyph="search"/></Button>
                </Col>
            </form>
            <p className="chart-remark">Notes: <br/>
                &nbsp;&nbsp;- This chart relies on logging consistency, {'regex_pattern = "collecting time (\\d+)\\t.*?dust (\\d+) (\\d+) (\\d+) (\\d+)\\t"'}<br/>
                &nbsp;&nbsp;- Can display data for up to 3 senses at once.
                &nbsp;&nbsp;- Always pull latest data first
            </p><br/>
            <Row>
                <Col xs={12} sm={12} md={12}>
                    <c3Chart id="dust-stats-chart" data={this.state.data} zoomable={this.state.zoomable} chartType={this.state.chartType}/>
                </Col>
            </Row>
        </div>)
    }
});

React.renderComponent(<DustStatsChart />, document.getElementById('dust-stats'));

function compareTimestamp(log1, log2) {
    return (log1.timestamp > log2.timestamp);
}

function reformatDate(dateString) {
    var dateComponents = dateString.split("-");
    var year = dateComponents[2];
    var month = dateComponents[0];
    var day = dateComponents[1];
    var startEpochMillis = new Date([year, month, day].join("-") + " 00:00:00 GMT").getTime();
    return startEpochMillis;
}