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
            var pillIdTitle = d && d !== [] && d.last() ?
                <h3>{"Pill " + d.last().deviceId}</h3>:null;
            graphs.push([
                pillIdTitle,
                <div id={"pill" + i.toString()} className="c3-chart"></div>
            ]);
            if (d && d !== [] && d.last()) {
                categories = ['uptime', 'batteryLevel'];
                stackingGroups = that.props.stackable === true ? [categories] : [];
            }
            c3.generate({
                bindto: '#pill'.concat(i.toString()),
                data: {
                    type: that.props.chartType,
                    json: d,
                    keys: {
                        x: 'lastSeen',
                        value: categories
                    },
                    groups: stackingGroups,
                    axes: {
                        uptime: "y2"
                    },
                    colors: {
                        uptime: "orangered",
                        batteryLevel: "#0D98BA"
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
                            text: "Uptime (milliseconds)",
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
            chartType: "area"
//            pill904: []
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
        if (searchInputFromURL.isWhiteString()) {
            return false;
        }
        $('#search-input').val(searchInputFromURL);
        this.handleSubmit();
    },

    pushHistory: function(search) {
        history.pushState({}, '', '/battery/?search=' + search);
    },

    handleSubmit: function() {
        var that = this;
        var searchInput = $('#search-input').val();
        var requestData = searchInput.indexOf('@') !== -1 ?  {email: searchInput} : {pill_id: searchInput};
        $.ajax({
            url: "/api/battery",
            type: "GET",
            dataType: "json",
            data: requestData,
            success: function(response) {
                console.log(response.data);
                that.setState({data: filterData(response.data)});
                that.pushHistory(searchInput);
            }
        });
        return false;
    },

    render: function() {
        var chartOptions = ["area", "area-spline", "area-step", "spline", "step", "line", "bar"].map(function (c) {
            return <option value={c}>{c.capitalize() + " Chart"}</option>;
        });
        var that = this;

        return (<div>
            <form className="row" onSubmit={this.handleSubmit}>
                <Col xs={3} sm={3} md={3} xsOffset={1} smOffset={1} mdOffset={1}>
                    <Input id="search-input" type="text" placeholder="Enter email / part of pill ID"/>
                </Col>
                <Col xs={2} sm={2} md={2}>
                    <Button bsStyle="info" bsSize="large" className="btn-circle" type="submit"><Glyphicon glyph="search"/></Button>
                </Col>
                <Col xs={2} sm={2} md={2}>
                    <Input type="select" id="chart-type" onChange={this.handleChartType}>{chartOptions}</Input>
                </Col>
                <Col xs={1} sm={1} md={1}>
                    <Input type="checkbox" id="zoom-check" label="Zoomable" onChange={this.handleZoom}/>
                </Col>
            </form>
            <Row>
                <Col xs={12} sm={12} md={12}>
                    <c3Chart id="battery-graph" data={that.state.data} zoomable={that.state.zoomable} chartType={that.state.chartType}/>
                </Col>
            </Row>
            <p className="chart-remark">Notes: <br/>
            &nbsp;&nbsp;- Legends are clickable to toggle visiblity by group<br/>
            &nbsp;&nbsp;- Filtering is prefered to zooming for finer granularity<br/>
            &nbsp;&nbsp;- Zooming/Dragging may be laggy in certain browsers
            </p>

        </div>)
    }
});
React.renderComponent(<BatteryChart />, document.getElementById('battery'));

function filterData(data) {
    return data.map(function(s){
        return s.map(function(d){
            if (d.lastSeen < Math.pow(10, 12)) {
                d.lastSeen *= 1000;
            }
            return d;
        }).filter(function(f){
            return f.lastSeen >= new Date().getTime() - 10*24*3600*1000;
        });
    });
}