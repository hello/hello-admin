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
                            format: function (x) { return d3.time.format('%b %d %H:%M')(new Date(x)); }
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
        var startTsFromURL = getParameterByName('start_ts');
        var endTsFromURL = getParameterByName('end_ts');
        var lengthFromURL = getParameterByName('length') || 100;

        $('#length').val(lengthFromURL);

        if (deviceIdFromURL.isWhiteString()) {
            return false;
        }

        $('#device-id-input').val(deviceIdFromURL);
        $('#start-ts').val(startTsFromURL);
        $('#end-ts').val(endTsFromURL);

        this.handleSubmit();
    },

    pushHistory: function(deviceId, startTs, endTs, length) {
        history.pushState({}, '', '/dust_stats/?device_id=' + deviceId + "&start_ts=" + startTs + "&end_ts=" + endTs + "&length=" + length);
    },

    handleSubmit: function() {
        var that = this;
        var deviceIds = $('#device-id-input').val().split(",");
        var startTs = $('#start-ts').val();
        var endTs = $('#end-ts').val();
        var length = $('#length').val();
        var startEpochMillis = startTs.isWhiteString() ? new Date().getTime()-3*24*3600000 : getUTCEpochFromLocalTime(startTs)*1000;
        var endEpochMillis = endTs.isWhiteString() ? new Date().getTime() : getUTCEpochFromLocalTime(endTs)*1000;
        that.pushHistory(deviceIds, startTs, endTs, length);
        var aggData = {};
        deviceIds.forEach(function(deviceId){
            var requestData = {
                device_id: deviceId.trim(),
                start_ts: startEpochMillis,
                end_ts: endEpochMillis,
                length: length
            };
            $.ajax({
                url: "/api/dust_stats",
                type: "GET",
                dataType: "json",
                async: false,
                data: requestData,
                success: function(response) {
                    aggData[deviceId.trim()] = filterData(response.data, startEpochMillis, endEpochMillis);
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
                <LongDatetimePicker placeHolder="start ts" id="start-ts" size="3" />
                <LongDatetimePicker placeHolder="end ts" id="end-ts" size="3" />
                <Col xs={1} sm={1} md={1}>
                    <Input id="length" type="text" placeholder="Length"/>
                </Col>
                <Col xs={1} sm={1} md={1}>
                    <Button bsStyle="info" bsSize="large" className="btn-circle" type="submit"><Glyphicon glyph="search"/></Button>
                </Col>
            </form>
            <p className="chart-remark">Notes: <br/>
                &nbsp;&nbsp;- This chart relies on logging consistency, {'regex_pattern = "collecting time (\d+)\\t.*?dust (\d+) (\d+) (\d+) (\d+)\\t"'}<br/>
                &nbsp;&nbsp;- Leaving the start_ts and end_ts blank assumes querying for recent logs<br/>
                &nbsp;&nbsp;- Max data size is 700, however for good performance, less than 200 points is reccommended<br/>
                &nbsp;&nbsp;- Latest logs show up first, so you want to adjust end timestamp in case you want backtrack in further<br/>
                &nbsp;&nbsp;- Can display data for up to 3 senses at once.
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

function filterData(data, startTs, endTs) {
    console.log(startTs, endTs);
    return data.filter(function(d){
        if (startTs && endTs) {
            return Number(startTs) <= d.timestamp && Number(endTs) >= d.timestamp;
        }
        else if (startTs) {
            return Number(startTs) <= d.timestamp;
        }
        else if (endTs) {
            return Number(endTs) >= d.timestamp;
        }
        else {
            return d;
        }
    }).sort(compareTimestamp);
}

function compareTimestamp(log1, log2) {
    return log1.timestamp - log2.timestamp;
}

