/** @jsx React.DOM */

var c3HistoryChart = React.createClass({
    getDefaultProps: function() {
        return {
            id: "chart",
            xTickFormat: "long"
        }
    },
    render: function() {
        var that = this, ticketCategories = [], stackingGroups = [];
        if (that.props.data !== [] && that.props.data.last()) {
            ticketCategories = Object.keys(that.props.data.last());
            stackingGroups = that.props.stackable === true ? [ticketCategories] : [];
        }
        c3.generate({
            bindto: '#'.concat(that.props.id),
            data: {
                type: that.props.chartType,
                json: that.props.data,
                keys: {
                    x: 'created_at',
                    value: ticketCategories
                },
                groups: stackingGroups
            },
            axis: {
                x: {
                    tick: {
                        format: function (x) {
                            if (that.props.xTickFormat === "long") {
                                return new Date(x*1000).toLocaleDateString();
                            }
                            else {
                                return d3.time.format('%b %d %H:%M')(new Date(x*1000));
                            }
                        }
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
        return(
            <div id={this.props.id} className="c3-chart"></div>
        )
    }
});