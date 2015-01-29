/** @jsx React.DOM */

var ParticulatesChart = React.createClass({
    getDefaultProps: function() {
        return {data: []}
    },
    render: function() {
        return (
            <C3BaseChart
                id="room-particulates-chart"
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
                            text: "Particulates ( µg/m³ )",
                            position: 'outer-middle'
                        }
                    }
                }}
                legend={{
                    show: false
                }}
                colors={{
                    value: "purple"
                }}
            />
        )
    }
});