/** @jsx React.DOM */

var MotionChart = React.createClass({
    getDefaultProps: function() {
        return {data: []}
    },
    render: function() {
        return (
            <C3BaseChart
                id="motion-chart"
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
                            text: "Sound ( dB )",
                            position: 'outer-middle'
                        }
                    }
                }}
                legend={{
                    show: false
                }}
                colors={{
                    value: "brown"
                }}
            />
        )
    }
});


var MotionChartWithLabel = React.createClass({
    getDefaultProps: function() {
        return {data: []}
    },
    render: function() {
        return (
            <C3BaseChartWithClickHandler
                id="motion-chart-with-handler"
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
                            text: "Accerlation (distance/time²)",
                            position: 'outer-middle'
                        }
                    }
                }}
                legend={{
                    show: false
                }}
                colors={{
                    value: "brown"
                }}
                xAttr="timestamp"
                tzOffsetAttr="timezone_offset"
            />
        )
    }
});

