/** @jsx React.DOM */

var C3BaseChart = React.createClass({
    getDefaultProps: function() {
        return {
            id: "c3-chart",
            data: [],
            chartType: "spline",
            stackable: false,
            axis: {
                x: {
                    tick: {
//                        format: function (x) { return d3.time.format('%b %d %H:%M')(new Date(x)); }
                          format: function (x) {return x}
                    },
                    label: {
                        text: "x-axis",
                        position: 'outer-center'
                    }
                },
                y: {
                    label: {
                        text: "y-axis",
                        position: 'outer-middle'
                    }
                },
                y2: {
                    show: false,
                    label: {
                        text: "y2-axis",
                        position: 'outer-middle'
                    }
                }
            },
            bar:  {
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
                enabled: false
            },
            legend: {
                position: "right"
            },
            colors: {}
        }
    },
    render: function() {
        var that = this, categories = [], stackingGroups = [];
        if (that.props.data !== [] && that.props.data.last()) {
            categories = Object.keys(that.props.data.last());
            stackingGroups = that.props.stackable === true ? [categories] : [];
        }
        c3.generate({
            bindto: '#'.concat(that.props.id),
            data: {
                type: that.props.chartType,
                json: that.props.data,
                keys: {
                    x: 'datetime',
                    value: categories
                },
                groups: stackingGroups,
                colors: that.props.colors
//                axes: {
//                    uptime: "y2"
//                }

            },
            axis: that.props.axis,
            bar: that.props.bar,
            grid: that.props.grid,
            zoom: that.props.zoom,
            legend: that.props.legend
        });
        return(
            <div id={this.props.id} className="c3-chart"></div>
        )
    }
});