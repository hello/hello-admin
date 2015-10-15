var TimelineLogsHistoryMaster = React.createClass({
    getInitialState: function() {
        return {data: [], error: ""}
    },

    pushHistory: function(startDate, endDate) {
        history.pushState({}, '', '/timeline_logs_history/?start_date=' + startDate + "&end_date=" + endDate);
    },

    componentDidMount: function() {
        this.submitWithInputsfromURL();
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
                response.aggregateData = getAggregateData(response.data);
                this.setState(response);
                console.log(response.aggregateData);
            }.bind(this)
        });
        return false;
    },
    render: function() {
        var alert = this.state.error ? <Alert>{this.state.error}</Alert> : null;
        var results = this.state.data.length === 0 ? null :
           "to be decided";

        return (<div>
            <form onSubmit={this.handleSubmit}>
                <LongDatetimePicker size={3} glyphicon="clock" placeHolder="pick a date, default = last week" id="start-date" pickTime={false} format="MM-DD-YYYY" size="4" />
                <LongDatetimePicker size={3} glyphicon="clock" placeHolder="pick a date, default = last night" id="end-date" pickTime={false} format="MM-DD-YYYY" size="4" />
                <Col xs={2}><Button type="submit">Go</Button></Col>
            </form>
            {alert}
            {results}
        </div>);
    }
});


React.render(<TimelineLogsHistoryMaster dateId="date-input" />, document.getElementById("timeline-logs-history"));

function getAggregateData(responseData) {
    var aggegrateData = responseData.slice(0);

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
    aggegrateData.map(function(item){
        item.algorithmShare = 100 * item.count / countByAlgoritmByDate[item.date][item.algorithm];
        item.errorShare = 100 * item.count / countByErrorByDate[item.date][item.error];
        item.totalShare = 100 * item.count /countByDate[item.date];
        return item;
    });
    return aggegrateData;
}

function reformatDate(dateString) {
    var dateComponents = dateString.split("-");
    var year = dateComponents[2];
    var month = dateComponents[0];
    var date = dateComponents[1];
    return [year, month, date].join("-");
}

