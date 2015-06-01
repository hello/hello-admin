/** @jsx React.DOM */

var SearchifyStats = React.createClass({
    getInitialState: function() {
        return {
            data: [],
            stackable: false,
            zoomable: true,
            chartType: "bar",
            alert: <Alert>Loading</Alert>
        }
    },

    loadData: function() {
        this.setState(this.getInitialState());
        $.ajax({
            url: "/api/searchify_stats",
            type: "GET",
            dataType: "json",
            success: function(response) {
                console.log(response);
                if (response.error.isWhiteString()){
                    this.setState({data: response.data, alert: null});
                }
                else {
                    this.setState({alert: <Alert>{response.error}</Alert>});
                }
            }.bind(this)
        });
    },

    componentDidMount: function() {
        $("#stack-check").attr("checked", false);
        $("#zoom-check").attr("checked", true);
        this.loadData();
    },

    generateGraph: function() {
        var that = this;
        c3.generate({
            bindto: "#searchify-stats-chart",
            data: {
                type: "bar",
                json: this.state.data,
                keys: {
                    x: "name",
                    value: ["size"]
                },
                colors: {
                    count: "#7DF9FF"
                }
//                color: function (color, d) {
//                    console.log(d);
//                    return d.id ? d3.rgb(color).darker(d.value/100000) : color;
//                }
            },
            axis: {
                x: {
                    type : 'category',
                    tick: {
                        format: function (i) {
                            console.log(i);
                            return d3.time.format.utc('%b %d %H:%M')(new Date(that.state.data[i].created_at));
                        }
                    },
                    label: {
                        text: 'Creation Time (UTC)',
                        position: "outer center"
                    }

                },
                rotated: false
            },
            bar: {
                width: {
                    ratio: 0.2
                }
            },
            grid: {
              y: {
                  show: false
              }
            },
            zoom: {
                enabled: true
            },
            legend: {
                position: "right",
                show: false
            },
            tooltip: {
                format: {
                    title: function (i) {
                        return that.state.data[i].name;
                    },
                    value: function (value) {
                        return value + " documents";
                    }
                }
            }
        });
    },

    render: function() {
        this.generateGraph();
        return (<div>
            <h3>Index Size</h3>
            {this.state.alert}
            <div id="searchify-stats-chart" className="c3-chart"></div>
        </div>)
    }
});
React.renderComponent(<SearchifyStats />, document.getElementById("searchify-stats"));