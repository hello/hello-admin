/** @jsx React.DOM */

var c3Chart = React.createClass({
    getDefaultProps: function() {
        return {id: "chart"}
    },
    render: function() {
        var that = this, categories = [], stackingGroups = [];
        console.log(that.props.data);
        var graphs = [];
        that.props.data.forEach(function(d, i){
            var sumBattery = 0, sumBatteryMod3Arr = [];
            d = d.map(function(o, j) {
                if (o.battery_level <= 100) {
                    sumBattery += o.battery_level;
                }
                if (sumBatteryMod3Arr.length > 24) { // For now have N = 5 as a constant, later make it a url param
                    sumBatteryMod3Arr.shift();
                }
                if (o.battery_level >= 100) {
                    o.batteryMod3  = 0;
                }
                else if (o.battery_level < 10) {
                    o.batteryMod3  = 2;
                }
                else {
                    o.batteryMod3 = o.battery_level % 3;
                }

                o.batteryCumAvg = (sumBattery / (j+1)).toFixed(2);
                sumBatteryMod3Arr.push(o.batteryMod3);

                switch(sumBatteryMod3Arr.length) {
                    case 0: o.batteryMod3MovingAvg = 0; break;
                    case 1: o.batteryMod3MovingAvg = sumBatteryMod3Arr[0]; break;
                    default: o.batteryMod3MovingAvg = (sumBatteryMod3Arr.reduce(function(x, y){return x + y}) / sumBatteryMod3Arr.length).toFixed(2);
                }
                return o;
            });

            var pillIdTitle = d && d !== [] && d.last() ?
                <h3>{"Pill " + d.last().device_id}</h3>:null;

            graphs.push([
                pillIdTitle,
                <div id={"pill" + i.toString()} className="c3-chart"></div>
            ]);

            if (d && d !== [] && d.last()) {
                categories = ['uptime', 'battery_level', 'batteryCumAvg', 'batteryMod3', 'batteryMod3MovingAvg'];
                stackingGroups = that.props.stackable === true ? [categories] : [];
            }
            c3.generate({
                bindto: '#pill'.concat(i.toString()),
                data: {
                    type: that.props.chartType,
                    json: d,
                    keys: {
                        x: 'last_seen',
                        value: categories
                    },
                    groups: stackingGroups,
                    axes: {
                        uptime: "y2"
                    },
                    colors: {
                        uptime: "orangered",
                        battery_level: "#0D98BA",
                        batteryMod3: "green",
                        batteryCumAvg: "orange",
                        batteryMod3MovingAvg: "purple"
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
                            text: "Battery Level (%)",
                            position: 'outer-middle'
                        }
                    },
                    y2: {
                        show: true,
                        label: {
                            text: "Uptime (seconds)",
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
        });

        return(<div>
            {graphs}
        </div>)
    }
});


var BatteryChart = React.createClass({
    getInitialState: function() {
        return {
            data: [[], [], [], [], [], [], [], [], [], []],
            zoomable: false,
            chartType: "area",
            alert: ""
        }
    },

    componentDidMount: function() {
        $("#zoom-check").attr("checked", false);
        this.submitWithInputsfromURL();
    },

    handleZoom: function() {
        this.setState({zoomable: $('#zoom-check').is(':checked')});
    },


    handleChartType: function() {
        this.setState({chartType: $("#chart-type").val()});
    },

    submitWithInputsfromURL: function() {
        var searchInputFromURL = getParameterByName('search');
        var endTsInputFromURL = getParameterByName('end_ts');
        if (searchInputFromURL.isWhiteString()) {
            return false;
        }
        $('#search-input').val(searchInputFromURL);
        $('#end-ts').val(endTsInputFromURL);
        this.handleSubmit();
    },

    pushHistory: function(search, endTs) {
        history.pushState({}, '', '/battery/?search=' + search + '&end_ts=' + endTs);
    },

    handleSubmit: function() {
        var that = this;
        that.setState({
            alert: "Loading ...",
            data: [[], [], [], [], [], [], [], [], [], []]
        });
        var searchInput = $('#search-input').val().trim();
        var endTs = $('#end-ts').val();
        var requestData = {
            search_input: searchInput,
            end_ts: endTs.isWhiteString() ? new Date().getTime() : getUTCEpochFromLocalTime(endTs)*1000
        };
        $.ajax({
            url: "/api/battery",
            type: "GET",
            dataType: "json",
            data: requestData,
            success: function(response) {
                console.log('raw', response.data);
                that.pushHistory(searchInput, endTs);
                if (response.error.isWhiteString()) {
                    that.setState({data: filterData(response.data), alert: ""});
                }
                else {
                    that.setState({data: [], alert: response.error})
                }
            }
        });
        return false;
    },

    render: function() {
        var chartOptions = ["area", "area-spline", "area-step", "spline", "step", "line", "bar"].map(function (c) {
            return <option value={c}>{c.capitalize() + " Chart"}</option>;
        });
        var alert = this.state.alert === "" ? null : <Alert>{this.state.alert}</Alert>;
        var notes = this.state.alert === "" ? <p className="chart-remark">Notes: <br/>
                &nbsp;&nbsp;- By default, data is shown for the last 14 days<br/>
                &nbsp;&nbsp;- Legends are clickable to toggle visiblity by group<br/>
                &nbsp;&nbsp;- Zooming/Dragging may be laggy in certain browsers
            </p>: null;
        return (<div>
            <form className="row" onSubmit={this.handleSubmit}>
                <Col xs={3} sm={3} md={3}>
                    <Input id="search-input" type="text" placeholder="email / pill ID partial"/>
                </Col>
                <LongDatetimePicker placeHolder="end timestamp (now)" id="end-ts" size="3" />
                <Col xs={1} sm={1} md={1}>
                    <Button bsStyle="info" bsSize="large" className="btn-circle" type="submit"><Glyphicon glyph="search"/></Button>
                </Col>
                <Col xs={2} sm={2} md={2}>
                    <Input type="select" id="chart-type" onChange={this.handleChartType}>{chartOptions}</Input>
                </Col>
                <Col xs={1} sm={1} md={1}>
                    <Input type="checkbox" id="zoom-check" label="Zoomable&nbsp;" onChange={this.handleZoom}/>
                </Col>
                <Col xs={1} sm={1} md={1}>
                    <Button><FileExporter fileContent={this.state.data} fileName="battery"/></Button>
                </Col>
            </form>
            {alert}
            <Row>
                <Col xs={12} sm={12} md={12}>
                    <c3Chart id="battery-graph" data={this.state.data} zoomable={this.state.zoomable} chartType={this.state.chartType}/>
                </Col>
            </Row>
            {notes}

        </div>)
    }
});
React.renderComponent(<BatteryChart />, document.getElementById('battery'));

function filterData(data) {
    return data.map(function(s){
        return s.map(function(d){
            if (d.last_seen < Math.pow(10, 12)) {
                d.last_seen *= 1000;
            }
            return d;
        }).sort(compareTimestamp);
    });
}

function compareTimestamp(log1, log2) {
    if (log1.last_seen < log2.last_seen) {
        return -1;
    }
    if (log1.last_seen > log2.last_seen) {
        return 1;
    }
    return 0;
}

