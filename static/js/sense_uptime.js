var SparkLine = React.createClass({
    getDefaultProps: function() {
        return {
            xAttr: "x",
            yAttr: "y",
            yUpperBound: 100,
            yLowerBound: 0,
            width: 140,
            height: 50,
            strokeColor: 'black',
            strokeWidth: '0.6px',
            interpolate: 'none',
            terminalCircleDiameter: 2.1,
            terminalColor: "rgba(75, 0, 130, 0.6)",
            flagCircleDiameter: 3,
            flagColor: "rgba(255, 0, 0, 0.4)",
            data: []
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
            if (d[this.props.yAttr] <= this.props.yUpperBound && d[this.props.yAttr] >= this.props.yLowerBound) {
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

var SenseUptimeMaster = React.createClass({
    getInitialState: function() {
        return {groups: [], groupStatus: [], uptimeProportion: {}, uptimeHistory: {}, emails: {}}
    },
    componentDidMount: function() {
        this.loadFirmwareGroups();
    },
    loadFirmwareGroups: function() {
        $.ajax({
            url: '/api/fw_groups',
            dataType: 'json',
            contentType: 'application/json',
            data: {mode: "devices"},
            type: 'GET',
            success: function(response) {
                console.log(response);
                this.setState({groups: response.data});
            }.bind(this)
        });
        return false;
    },
    loadFirmwareGroupStatus: function() {
        var group = this.refs.group.getDOMNode().value;
        if (group.isWhiteString()) {
            return false;
        }
        $.ajax({
            url: '/api/firmware_group_status',
            dataType: 'json',
            contentType: 'application/json',
            data: {group: group.trim()},
            type: 'GET',
            success: function(response) {
                console.log("group status", response);
                this.setState({groupStatus: response.data.sort(compareString)});
            }.bind(this)
        });
    },

    loadAccountEmail: function(senseId) {
        $.ajax({
            url: "/api/account_search",
            dataType: 'json',
            type: "GET",
            data: {input: senseId, type: "sense_id"},
            success: function (response) {
                var newEmailsState = this.state.emails;
                if (response.error.isWhiteString() && response.data && response.data.length > 0) {
                    newEmailsState[senseId] = response.data[0].email;
                }
                else {
                    newEmailsState[senseId] = ""
                }
                this.setState({emails: newEmailsState});
            }.bind(this)
        });
    },
    massDiagnose: function() {
        this.loadUptimeQueue(0);
    },
    individualDiagnose: function(senseId) {
        this.loadUptimeQueue(-1, senseId, true);
    },

    loadUptime: function(senseId, email) {
        $.ajax({
            url: "/api/sense_uptime",
            dataType: "json",
            type: 'GET',
            data: {email: email, padded: 1},
            success: function (response) {
                var newUptimeProportionState = this.state.uptimeProportion;
                var newUptimeHistoryState = this.state.uptimeHistory;
                if (response.error.isWhiteString() && response.data.length > 1){
                    var cleanUptime = response.data.slice(1, response.data.length-1); // remove last hour because incomplete
                    var totalUpTime = cleanUptime.map(function(i){return i.count}).reduce(function(x, y){return x+y;}, 0);
                    newUptimeProportionState[senseId] = (totalUpTime /(cleanUptime.length*60)*100).toFixed(2) + " %";
                    newUptimeHistoryState[senseId] = cleanUptime;
                    this.setState({uptimeProportion : newUptimeProportionState, uptimeHistory: newUptimeHistoryState});
                }
            }.bind(this)
        });
    },

    loadUptimeQueue: function(i, senseId, single) {
        if (i > this.state.groupStatus.length-1) {
            return false;
        }
        if (!senseId) {
            senseId = this.state.groupStatus[i].device_id;
        }
        $.ajax({
            url: "/api/account_search",
            dataType: 'json',
            type: "GET",
            data: {input: senseId, type: "sense_id"},
            success: function (response) {
                var newEmailsState = this.state.emails;
                if (response.error.isWhiteString() && response.data && response.data.length > 0) {
                    newEmailsState[senseId] = response.data[0].email;
                    this.loadUptime(senseId, response.data[0].email);
                }
                else {
                    newEmailsState[senseId] = ""
                }
                this.setState({emails: newEmailsState});
                if (i < this.state.groupStatus.length-1 && !single) {
                    this.loadUptimeQueue(i + 1);
                }
            }.bind(this)
        });
    },
    render: function() {
        return <div>
            <Row>
                <Col xs={3}>
                    <select className="form-control" ref="group" onChange={this.loadFirmwareGroupStatus}>
                        <option value="">Select a Group</option>
                        {this.state.groups.map(function(g){return <option value={g.name}>{g.name}</option>;})}
                    </select>
                </Col>
                <Col xs={1}><Button onClick={this.massDiagnose}>Mass <Glyphicon glyph="search"/></Button></Col>
            </Row>
            <Table>
                <thead>
                    <th className="alert-success"></th>
                    <th className="alert-success">Mid FW</th>
                    <th className="alert-success">Sense ID</th>
                    <th className="alert-success">Updated At</th>
                    <th className="alert-success">Account Email</th>
                    <th className="alert-success">Uptime Proportion</th>
                    <th className="alert-success">Uptime History</th>
                </thead>
                <tbody>{
                    this.state.groupStatus.map(function(gs){
                        return <tr>
                            <td className="center-wrapper"><Button onClick={this.individualDiagnose.bind(this, gs.device_id)}><Glyphicon glyph="search"/></Button></td>
                            <td className="center-wrapper">{gs.middle_version}</td>
                            <td className="center-wrapper">{gs.device_id}</td>
                            <td className="center-wrapper">{new Date(gs.timestamp).toString()}</td>
                            <td className="center-wrapper">{this.state.emails[gs.device_id]}</td>
                            <td className="center-wrapper">{this.state.uptimeProportion[gs.device_id]}</td>
                            <td className="center-wrapper"><SparkLine xAttr="ts" yAttr="count" yUpperBound={58} yLowerBound={0} data={this.state.uptimeHistory[gs.device_id]} /></td>
                        </tr>
                    }.bind(this))
                }</tbody>
            </Table>
        </div>;
    }
});

React.render(<SenseUptimeMaster/>, document.getElementById("sense-uptime"));

function compareString(gs1, gs2) {
    switch (gs1.device_id < gs2.device_id) {
        case true: return -1; break;
        case false: return 1; break;
        default: return 0;
    }
}