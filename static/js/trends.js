var TrendsChart = React.createClass({
    getDefaultProps: function() {
        return {
            id: "trends-chart",
            xTickFormat: "long",
            chartType: "bar",
            color: '#0000ff',
            yRatio: 1
        }
    },
    render: function() {
        var that = this;

        var points = that.props.data ? that.props.data.data_points : [];
        c3.generate({
            bindto: '#'.concat(that.props.id),
            data: {
                columns: [
                    [that.props.id.split("-").join(" ").toUpperCase()]
                        .concat(points.map(function(p){
                            return p.y_value / that.props.yRatio;
                        }))
                ],
                type: that.props.chartType,
                color: function (color, d) {
                    return that.props.color;
                }
            },
            axis: {
                x: {
                    tick: {
                        format: function (i) {
                            var xCategories = points.map(function(p){return p.x_value;});
                            return xCategories[i];
                        }
                    },
                    label: {
                        text: "Week days",
                        position: 'outer-center'
                    }
                },
                y: {
                    label: {
                        text: that.props.yAxisLabel,
                        position: 'outer-middle'
                    }
                }
            },
            tooltip: {
                format: {
                    title: function (d) { return 'Data ' + d; },
                    value: function (value, ratio, id) {
                        var format = id === 'data1' ? d3.format(',') : d3.format('');
                        return format(value.toFixed(2));
                    }
                }
            },
            bar: {
                width: {
                    ratio: 0.5 // this makes bar width 50% of length between ticks
                }
            }
        });
        var chartTitle = this.props.data && this.props.data.data_points > 0 ?
            <div className="center-wrapper"><h5>{this.props.id}</h5></div> : null;
        return <div>
            <br/>
            {chartTitle}
            <div id={this.props.id} className="c3-chart"></div>
        </div>
    }
});

var TrendsMaster = React.createClass({
    getInitialState: function() {
        return {trends: [], error: "", ready: false};
    },

    componentDidMount: function() {
        var emailInputFromURL = getParameterByName("email");
        console.log(emailInputFromURL);
        if (emailInputFromURL) {
            this.refs.emailInput.getDOMNode().value = emailInputFromURL;
            this.getTrends(emailInputFromURL);
        }
    },

    getTrends: function() {
        this.setState(this.getInitialState());
        history.pushState({}, '', '/trends/?email=' + this.refs.emailInput.getDOMNode().value.trim());
        $.ajax({
            url: "/api/trends",
            data: {email: this.refs.emailInput.getDOMNode().value.trim()},
            dataType: 'json',
            type: "GET",
            success: function (response) {
                console.log("response", response);
                this.setState({trends: response.data, error: response.error, ready: true});
            }.bind(this)
        });
        return false;
    },

    render: function() {
        var alert = this.state.error ? <Alert>{this.state.error}</Alert> : null;
        var that = this;
        return <div>
            <Col xs={12} md={10} mdOffset={1} md={8} mdOffset={2} lg={6} lgOffset={3} xl={4} xlOffset={4}><form onSubmit={this.getTrends}>
                <Col xs={12}>
                    <div className="icon-addon addon-md">
                        <input className="form-control" type="text" placeholder="enter email" id="email-input" ref="emailInput"/>
                        <Glyphicon className="cursor-hand" id="submit" glyph="search" type="submit" onClick={this.getTrends} />
                        <span className="input-pre"><Glyphicon glyph="envelope" /></span>
                    </div>
                </Col>
            </form></Col>
            <Col xs={12} md={10} mdOffset={1} md={8} mdOffset={2} lg={6} lgOffset={3} xl={4} xlOffset={4}>
                {alert}
            </Col>
            <Col xs={12}>
                <TrendsChart id="average-sleep-score" data={that.state.trends[0]} yAxisLabel="avgSleepScore" chartType="area-step" color="#009BFF"/>
            </Col>
            <Col xs={12}>
                <TrendsChart id="sleep-duration" data={that.state.trends[1]} yRatio={60} yAxisLabel="sleepDurationInHours" chartType="area-step" color="#41D7AB"/>
            </Col>
            <Col xs={12}>
                <TrendsChart id="sleep-score-over-time" data={that.state.trends[2]} yAxisLabel="sleepScoreOverTime" chartType="area-spline" color="#FF794C"/>
            </Col>
        </div>;
    }
});

React.render(<TrendsMaster />, document.getElementById("trends"));