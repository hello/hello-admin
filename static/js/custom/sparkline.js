/** @jsx React.DOM */

var SparkLine = React.createClass({
    getDefaultProps: function() {
        return {
            xAttr: "x",
            yAttr: "y",
            width: 140,
            height: 50,
            strokeColor: 'black',
            strokeWidth: '0.6px',
            interpolate: 'none',
            circleDiameter: 2,
            data: [9, 3, 2, 0, 1, 3] //Lukas's birthday :)
        };
    },
    componentDidMount: function() {
        return this.renderSparkline();
    },
    componentDidUpdate: function() {
        return this.renderSparkline();
    },
    render: function() {
        return <div/>
    },
    renderSparkline: function() {
        var thisDOMNode = this.getDOMNode();
        while (thisDOMNode.firstChild) {
            thisDOMNode.removeChild(thisDOMNode.firstChild);
        }
        var data = this.props.data.slice();
        if (data.length === 0) {
            return false;
        }
        var x = d3.scale.linear().range([2, this.props.width - 2]);
        var y = d3.scale.linear().range([this.props.height - 2, 2]);

        var ref, lastX, lastY, firstX, firstY, line;
        if (((ref = data[0]) != null ? ref[this.props.xAttr] : void 0) != null) {
            data.forEach(function(d) {
                return d[this.props.xAttr] = d3.time.format.iso.parse(d[this.props.xAttr]);
            }.bind(this));

            line = d3.svg.line()
                .interpolate(this.props.interpolate)
                .x(function(d, i) {return x(d[this.props.xAttr]);}.bind(this))
                .y(function(d) {return y(d[this.props.yAttr]);}.bind(this));

            x.domain(d3.extent(data, function(d) {return d[this.props.xAttr];}.bind(this)));
            y.domain(d3.extent(data, function(d) {return d[this.props.yAttr];}.bind(this)));

            firstX = x(data[0][this.props.xAttr]);
            firstY = y(data[0][this.props.yAttr]);

            lastX = x(data[data.length - 1][this.props.xAttr]);
            lastY = y(data[data.length - 1][this.props.yAttr]);
        }
        else {
            line = d3.svg.line()
                .interpolate(this.props.interpolate)
                .x(function(d, i) {return x(i);})
                .y(function(d) {return y(d);});

            x.domain([0, data.length]);
            y.domain(d3.extent(data));

            firstX = x(data[0]);
            firstY = y(data[0]);

            lastX = x(data.length - 1);
            lastY = y(data[data.length - 1]);
        }
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 10])
            .html(function(d) {
                return "<span class='label label-default label-uptime-terminal'>" +  (d[this.props.yAttr] || d) + "</span>";
            }.bind(this));

        var svg = d3.select(this.getDOMNode())
            .append('svg')
            .attr('width', this.props.width)
            .attr('height', this.props.height)
            .append('g');

        svg.call(tip);

        svg.append('circle')
            .data(data)
            .attr('class', 'sparkcircle')
            .attr('cx', firstX).attr('cy', firstY)
            .attr('fill', 'red')
            .attr('stroke', 'none')
            .attr('r', this.props.circleDiameter)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        svg.append('path')
            .datum(data)
            .attr('class', 'sparkline')
            .style('fill', 'none')
            .style('stroke', this.props.strokeColor)
            .style('stroke-width', this.props.strokeWidth)
            .attr('d', line);

        svg.append('circle')
            .data(data.reverse())
            .attr('class', 'sparkcircle')
            .attr('cx', lastX).attr('cy', lastY)
            .attr('fill', 'red')
            .attr('stroke', 'none')
            .attr('r', this.props.circleDiameter)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        return svg;
    }
});
