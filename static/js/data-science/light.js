/** @jsx React.DOM */

var LightChart = React.createClass({
    getDefaultProps: function() {
        return {data: []}
    },
    render: function() {
        return (
            <C3BaseChart
                id="room-light-chart"
                data={this.props.data}
                chartType={this.props.chartType}
                axis={{
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
                            text: "Light (lm)",
                            position: 'outer-middle'
                        }
                    }
                }}
                legend={{
                    show: false
                }}
                colors={{
                    value: "orange"
                }}
            />
        )
    }
});


var LightChartWithLabel = React.createClass({
    getDefaultProps: function() {
        return {data: []}
    },
    render: function() {
        return (
            <C3BaseChartWithClickHandler
                id="room-light-chart"
                data={this.props.data}
                chartType={this.props.chartType}
                axis={{
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
                            text: "Light (lm)",
                            position: 'outer-middle'
                        }
                    }
                }}
                legend={{
                    show: false
                }}
                colors={{
                    value: "orange"
                }}
            />
        )
    }
});