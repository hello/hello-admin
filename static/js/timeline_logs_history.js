var TimelineLogHistoryChart = React.createClass({
    getDefaultProps: function() {
        return {
            id: "chart",
            xTickFormat: "long",
            chartType: "bar",
            stackable: true
        }
    },
    render: function() {
        if(this.props.data && this.props.data.length > 0) {
            var categories = Object.keys(this.props.data[0]).filter(function(d){return d !== "date" && d !== "timestamp"});
            var stackingGroups = this.props.stackable === true ? [categories] : [];
            var that = this;
            c3.generate({
                bindto: '#'.concat(that.props.id),
                data: {
                    type: that.props.chartType,
                    json: that.props.data,
                    keys: {
                        x: 'timestamp',
                        value: categories
                    },
                    groups: stackingGroups
                },
                axis: {
                    x: {
                        tick: {
                            format: function (x) {
                                return d3.time.format('%b %d')(new Date(x));
                            }
                        },
                        label: {
                            position: 'outer-center'
                        }
                    },
                    y: {
                        label: {
                            text: "Count or Share",
                            position: 'outer-middle'
                        }
                    },
                },
                bar: {
                    width: {
                        ratio: 0.4
                    }
                },
                grid: {
                  y: {
                      show: true
                  }
                },
                legend: {
                    position: "right"
                }
            });
        }
        var chartTitle = this.props.data && this.props.data.length > 0 ?
            <div className="center-wrapper"><h5>{this.props.id}</h5></div> : null;
        return <div>
            <br/>
            {chartTitle}
            <div id={this.props.id} className="c3-chart"></div>
        </div>
    }
});

var TimelineLogsHistoryMaster = React.createClass({
    getInitialState: function() {
        return {data: [], error: "", breakdownByAlgorithm: [], breakdownByError: [], breakdownByAlgorithmError: [], stackable: true, normalize: false}
    },

    pushHistory: function(startDate, endDate) {
        history.pushState({}, '', '/timeline_logs_history/?start_date=' + startDate + "&end_date=" + endDate);
    },

    componentDidMount: function() {
        this.submitWithInputsfromURL();
        $("#stack").prop('checked', true);
    },

    submitWithInputsfromURL: function() {
        var startDateInputFromURL = getParameterByName('start_date');
        if (startDateInputFromURL.isWhiteString()) {
            var lastNight = new Date();
            lastNight.setDate(lastNight.getDate() -7);
            startDateInputFromURL = d3.time.format("%m-%d-%Y")(lastNight);
        }

        var endDateInputFromURL = getParameterByName('end_date');
        if (endDateInputFromURL.isWhiteString()) {
            var lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 1);
            endDateInputFromURL = d3.time.format("%m-%d-%Y")(lastWeek);
        }

        $('#start-date').val(startDateInputFromURL);
        $('#end-date').val(endDateInputFromURL);

        this.handleSubmit();
    },

    handleSubmit: function() {
        var startDate = $("#start-date").val();
        var endDate = $("#end-date").val();
        this.pushHistory(startDate, endDate);
        $.ajax({
            url: '/api/timeline_logs_history',
            dataType: 'json',
            data: {start_date: reformatDate(startDate), end_date: reformatDate(endDate)},
            type: "GET",
            success: function(response) {
                if (response.error.isWhiteString) {
                    var aggregateData = getAggregateData(response.data);
                    this.setState(aggregateData);
                }
                else {
                    this.setState({error: response.error});
                }

            }.bind(this)
        });
        return false;
    },

    toggleStack: function() {
        this.setState({stackable: $('#stack').is(':checked')});
    },

    toggleNormalize: function() {
        this.setState({normalize: $('#normalize').is(':checked')});
    },

    render: function() {
        var alert = this.state.error ? <Alert>{this.state.error}</Alert> : null;
        var results = [
            <TimelineLogHistoryChart id="Breakdown-By-Algorithm" data={this.state.normalize ? this.state.normalizedBreakdownByAlgorithm : this.state.breakdownByAlgorithm} stackable={this.state.stackable}/>,
            <TimelineLogHistoryChart id="Breakdown-By-Error" data={this.state.normalize ? this.state.normalizedBreakdownByError : this.state.breakdownByError} stackable={this.state.stackable} />,
            <TimelineLogHistoryChart id="Breakdown-By-Algorithm-Error" data={this.state.normalize ? this.state.normalizedBreakdownByAlgorithmError : this.state.breakdownByAlgorithmError} stackable={this.state.stackable} />
        ];

        return (<div>
            <form onSubmit={this.handleSubmit}>
                <LongDatetimePicker size={3} glyphicon="clock" placeHolder="pick a date, default = last week" id="start-date" pickTime={false} format="MM-DD-YYYY" />
                <LongDatetimePicker size={3} glyphicon="clock" placeHolder="pick a date, default = last night" id="end-date" pickTime={false} format="MM-DD-YYYY" />
                <Col xs={1}><Button type="submit">Go</Button></Col>
                <Col xs={4}>
                    Stack <input id="stack" type="checkbox" onChange={this.toggleStack} />&nbsp;&nbsp;&nbsp;
                    Normalize <input id="normalize" type="checkbox" onChange={this.toggleNormalize} />
                </Col>
            </form><br/>
            {alert}<br/>
            {results}
        </div>);
    }
});


React.render(<TimelineLogsHistoryMaster dateId="date-input" />, document.getElementById("timeline-logs-history"));

function getAggregateData(responseData) {
    var dateList = _.uniq(responseData.map(function(item){return item.date}));
    var algorithmList = _.uniq(responseData.map(function(item){return item.algorithm}));
    var errorList = _.uniq(responseData.map(function(item){return item.error}));

    var countByAlgoritmByDate = _.object(dateList, dateList.map(function(d){return {}}));
    var countByErrorByDate = _.object(dateList, dateList.map(function(d){return {}}));
    var countByDate = _.object(dateList, dateList.map(function(d){return 0}));


    responseData.forEach(function(item){
        dateList.forEach(function(d) {
            if (item.date == d) {
                countByDate[d] = (countByDate[d] || 0) + item.count;
                algorithmList.forEach(function(a) {
                    if (item.algorithm === a) {
                        countByAlgoritmByDate[d][a] = (countByAlgoritmByDate[d][a] || 0) + item.count;
                    }
                });
                errorList.forEach(function(e) {
                    if (item.error === e) {
                        countByErrorByDate[d][e] = (countByErrorByDate[d][e] || 0) + item.count;
                    }
                });
            }
        });
    });


    var breakdown = {
        breakdownByAlgorithm: [], breakdownByError: [], breakdownByAlgorithmError: [],
        normalizedBreakdownByAlgorithm: [], normalizedBreakdownByError: [], normalizedBreakdownByAlgorithmError: []
    };
    dateList.forEach(function(d) {
        var algorithmCount = {timestamp: new Date(Date.parse(d)).getTime(), date: d};
        var errorCount = {timestamp: new Date(Date.parse(d)).getTime(), date: d};
        var algorithmErrorCount = {timestamp: new Date(Date.parse(d)).getTime(), date: d};

        responseData.filter(function(item){return item.date == d}).forEach(function(r){
            algorithmCount[r.algorithm] = (algorithmCount[r.algorithm] || 0) + r.count;
            errorCount[r.error] = (errorCount[r.error] || 0) + r.count;
            algorithmErrorCount[r.algorithm + "-" + r.error] = (algorithmErrorCount[r.algorithm + "-" + r.error] || 0) + r.count;
        });

        breakdown.breakdownByAlgorithm.push(algorithmCount);
        breakdown.breakdownByError.push(errorCount);
        breakdown.breakdownByAlgorithmError.push(algorithmErrorCount);

        var algorithmShare =  $.extend({}, algorithmCount);
        var errorShare =  $.extend({}, errorCount);
        var algorithmErrorShare =  $.extend({}, algorithmErrorCount);

        Object.keys(algorithmCount).forEach(function(k) {
            if (k !== "date" && k !== "timestamp") {
                algorithmShare[k] = (algorithmCount[k] * 100 / countByDate[d]).toFixed(2);
            }
        });
        Object.keys(errorCount).forEach(function(k) {
            if (k !== "date" && k !== "timestamp") {
                errorShare[k] = (errorCount[k] * 100 / countByDate[d]).toFixed(2);
            }
        });
        Object.keys(algorithmErrorCount).forEach(function(k) {
            if (k !== "date" && k !== "timestamp") {
                algorithmErrorShare[k] = (algorithmErrorCount[k] * 100 / countByDate[d]).toFixed(2);
            }
        });

        breakdown.normalizedBreakdownByAlgorithm.push(algorithmShare);
        breakdown.normalizedBreakdownByError.push(errorShare);
        breakdown.normalizedBreakdownByAlgorithmError.push(algorithmErrorShare);
    });
    return breakdown;
}

function reformatDate(dateString) {
    var dateComponents = dateString.split("-");
    var year = dateComponents[2];
    var month = dateComponents[0];
    var date = dateComponents[1];
    return [year, month, date].join("-");
}

