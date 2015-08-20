/** @jsx React.DOM */

var SparkLine = React.createClass({
    getDefaultProps: function() {
        return {
            xAttr: "x",
            yAttr: "y",
            yUpperBound: 100,
            yLowerBound: 0,
            width: 280,
            height: 207,
            strokeColor: 'black',
            strokeWidth: '0.6px',
            interpolate: 'none',
            terminalCircleDiameter: 2.1,
            terminalColor: "rgba(75, 0, 130, 0.6)",
            flagCircleDiameter: 3,
            zeroCircleDiameter: 1,
            flagColor: "rgba(255, 0, 0, 0.4)",
            zeroColor: "gray",
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
        var data = this.props.data;
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
            y.domain([0,  Math.max.apply(Math, data.map(function(d){return d[this.props.yAttr];}.bind(this)))]);

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
                var xHumanDateTip = d[this.props.xAttr] ? d3.time.format.utc("%b %d %H:%M")(new Date(d[this.props.xAttr])) : d;
                var yValueTip = d[this.props.yAttr] === null || d[this.props.yAttr] === undefined ? d : d[this.props.yAttr];
                return "<span class='label label-default label-uptime-terminal'>" +
                    xHumanDateTip + " -- " + yValueTip + "</span>";
            }.bind(this));

        var svg = d3.select(this.getDOMNode())
            .append('svg')
            .attr('width', this.props.width)
            .attr('height', this.props.height)
            .append('g');

        svg.call(tip);

        svg.append('circle')
            .data(data.slice(0,1))
            .attr('class', 'sparkcircle')
            .attr('cx', firstX).attr('cy', firstY)
            .attr('fill', this.props.terminalColor)
            .attr('stroke', 'none')
            .attr('r', this.props.terminalCircleDiameter)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        data.forEach(function(d){
            if (d[this.props.yAttr] <= this.props.yUpperBound && d[this.props.yAttr] >= this.props.yLowerBound && d[this.props.yAttr] !== 0) {
                svg.append('circle')
                    .data([d])
                    .attr('class', 'sparkcircle')
                    .attr('cx', x(d[this.props.xAttr])).attr('cy', y(d[this.props.yAttr]))
                    .attr('fill', this.props.flagColor)
                    .attr('stroke', 'none')
                    .attr('r', this.props.flagCircleDiameter)
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide);
            }
        }.bind(this));

        svg.append('path')
            .datum(data)
            .attr('class', 'sparkline')
            .style('fill', 'none')
            .style('stroke', this.props.strokeColor)
            .style('stroke-width', this.props.strokeWidth)
            .attr('d', line);

        svg.append('circle')
            .data(data.reverse().slice(0,1))
            .attr('class', 'sparkcircle')
            .attr('cx', lastX).attr('cy', lastY)
            .attr('fill', this.props.terminalColor)
            .attr('stroke', 'none')
            .attr('r', this.props.terminalCircleDiameter)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        return svg;
    }
});


var UptimeTile = React.createClass({
    getInitialState : function() {
        return {"uptime" : []}
    },
    loadUptimeByEmail : function(email) {
        if (email) {
            $.ajax({
                url: "/api/sense_uptime/",
                dataType: "json",
                type: 'GET',
                data: {email: email, padded: 1},
                success: function (response) {
                    this.setState({uptime : response.data})
                }.bind(this)
            });
        }
        else {
            this.setState({uptime: []});
        }
    },
    componentDidMount : function() {
        this.loadUptimeByEmail(this.props.email);
    },
    render: function() {
        var upTimeProportion = <span>&nbsp;</span>;
        if (this.state.uptime.length > 0) {
            
            var cleanUptime = this.state.uptime.slice(1, this.state.uptime.length-1); // remove last hour because incomplete

            var totalUpTime = cleanUptime.map(function(i){return i.count}).reduce(function(x, y){return x+y;}, 0);
            upTimeProportion = (totalUpTime /(cleanUptime.length*60)*100).toFixed(2) + " %";
        }
        return <Table>
            <thead/>
            <tbody>
                <tr><td>10-day-ratio = {upTimeProportion}</td></tr>
                <tr><td>
                    <SparkLine xAttr="ts" yAttr="count" yUpperBound={58} yLowerBound={0}
                        data={this.state.uptime.slice(1, this.state.uptime.length -1)}/>
                </td></tr>
                <tr><td/><td/></tr>
            </tbody>
        </Table>
    }
});