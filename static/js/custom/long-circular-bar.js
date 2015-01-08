/** @jsx React.DOM */

var LongCircularBar = React.createClass({
    getDefaultProps: function() {
        return {
            score: 0,
            min: 0,
            max: 100,
            width: "80",
            readOnly: true,
            thickness: ".2",
            bgColor: "lightblue",
            fgColor: "rgba(0, 129, 255, 0.58)",
            font: '"Lucida Console", Monaco, monospace',
            fontWeight: "800"
        }
    },
    componentDidMount: function() {
        $('.dial').knob({
            min: this.props.min,
            max: this.props.max,
            width: this.props.width,
            readOnly: this.props.readOnly,
            thickness: this.props.thickness,
            bgColor: this.props.bgColor,
            fgColor: this.props.fgColor,
            font: this.props.font,
            fontWeight: this.props.fontWeight
        });
    },
    render: function() {
        var classes = React.addons.classSet({
            dial: true
        });
        return (
            <input type="text" value={this.props.score} className={classes}/>
        )
    }
});
