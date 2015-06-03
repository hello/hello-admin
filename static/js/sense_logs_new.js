var SenseLogsNew = React.createClass({
    getInitialState: function() {
        return {response: {}, alert: null, resultsSize: 0, loading: null, blackList: []}
    },

    componentDidMount: function() {
        this.retrieveBlackList();
        var fieldFromURL = getParameterByName("field"),
            keywordFromURL = getParameterByName("keyword"),
            senseIdFromURL = getParameterByName("sense_id"),
            limitFromURL = getParameterByName("limit"),
            startFromURL = getParameterByName("start"),
            endFromURL = getParameterByName("end");

        if (fieldFromURL) {
            $("#field").val(fieldFromURL);
        }
        if (senseIdFromURL) {
            $("#sense-id").val(senseIdFromURL);
        }
        if (limitFromURL) {
            $("#limit").val(limitFromURL);
        }
        if (startFromURL) {
            $("#start").val(startFromURL);
        }
        if (endFromURL) {
            $("#end").val(endFromURL);
        }

        if (keywordFromURL.isWhiteString()) {
            return false;
        }
        else {
            $("#keyword").val(keywordFromURL);
        }

        this.loadSenseLogs();
    },

    retrieveBlackList: function() {
        $.ajax({
            url: '/api/sense_black_list',
            dataType: 'json',
            type: 'GET',
            success: function (response) {
                this.setState({blackList: response.data});
            }.bind(this)
        });
    },

    loadSenseLogs: function(order) {
        this.setState({alert: null, loading: <img src="/static/image/loading.gif" />, resultsSize: 0, response: {}});
        var field = $("#field").val().trim(),
            keyword = $("#keyword").val().trim(),
            senseId = $("#sense-id").val().trim(),
            limit = $("#limit").val().trim(),
            start = $("#start").val().trim(),
            end = $("#end").val().trim();

        if (Number(limit) > 5000) {
            this.setState({alert: <Alert bsStyle="danger">
                Invalid request because ceiling limit is 5000
            </Alert>, loading: null});
            return false;
        }

        if (start && end && new Date(start).getTime() > new Date(end).getTime()) {
            this.setState({alert: <Alert bsStyle="danger">
                Invalid request because start time cannot be less than end time
            </Alert>, loading: null});
            return false;
        }

        if (!keyword) {
            this.setState({alert: <Alert bsStyle="warning">
                Looking up ALL documents because no field keyword is entered. <br/>
                This is very inefficient and not to be abused. Failure happens when index size reaches critical number.
            </Alert>, loading: <img src="/static/image/loading.gif" />});
        }

        history.pushState({}, '', '/sense_logs_new/?field=' + field + '&keyword=' + keyword + '&sense_id=' + senseId + '&limit=' + limit + "&start=" + start + "&end=" + end);
        var sendingData = {
                query: field + ":" + keyword,
                categories: senseId ? JSON.stringify({device_id: [senseId]}) : null,
                limit: limit ? limit : 20,
                start: start ? new Date(start + " GMT").getTime() : null,
                end: end ? new Date(end + " GMT").getTime() : null,
                order: order
            };
        console.log("sending", sendingData);
        $.ajax({
            url: "/api/sense_logs_new",
            dataType: 'json',
            type: 'GET',
            data: sendingData,
            success: function (response) {
                console.log("getting", response);
                var errorAlert = !(!$.isEmptyObject(response) && response.results && response.results.length > 0) && !$.isEmptyObject(response.error) ?
                    <Alert>No matches found!</Alert> : null;
                var resultsSize = response.results ? response.results.length : 0;
                var newState = {
                    response: response,
                    alert: errorAlert,
                    resultsSize: resultsSize,
                    loading: null
                };
                if (resultsSize > 0) {
                    newState.oldestTimestamp = response.results[0].variable_1;
                    newState.newestTimestamp = response.results[resultsSize-1].variable_1;
                }
                this.setState(newState);
            }.bind(this)
        });
        return false;
    },
    loadOlderLogs: function() {
        $("#start").val("");
        $("#end").val(formatUTCDateFromEpoch(this.state.oldestTimestamp));
        this.loadSenseLogs(0);  // grab latest till time
    },
    loadNewerLogs: function() {
        $("#start").val(formatUTCDateFromEpoch(this.state.newestTimestamp));
        $("#end").val("");
        this.loadSenseLogs(1);  // grab earliest after time
    },
    focusWindow: function(senseId, ts) {
        $("#field").val("device_id");
        $("#keyword").val(senseId);
        $("#sense-id").val("");
        $("#start").val(d3.time.format.utc("%Y-%m-%d %H:%M:%S")(new Date(ts - 5*60*1000)));
        $("#end").val(d3.time.format.utc("%Y-%m-%d %H:%M:%S")(new Date(ts + 5*60*1000)));
        this.refs.submit.getDOMNode().focus();
        this.loadSenseLogs();
    },
	render: function(){
        var response = this.state.response;
        var keyword = $("#keyword").val();
        var resultsTable = !$.isEmptyObject(response) && response.results && response.results.length > 0 ?
            <div>
                <Table striped>
                    <thead><tr>
                        <th className="alert-success">{this.state.resultsSize} documents</th>
                    </tr></thead>
                    <tbody>
                        {response.results.map(function(r){
                            return <tr><td>
                                <div className="center-wrapper">
                                    <Button className="borderless" disabled>
                                        <span className="span-upload-ts">{new Date(r.variable_1).toUTCString()}</span>
                                    </Button>
                                    - Sense ID: <a target="_blank" href={"/account_profile/?type=sense_id&input=" + r.device_id}>{r.device_id}</a>
                                    &nbsp;<Button onClick={this.focusWindow.bind(this, r.device_id, r.variable_1)}>See all logs of this sense around this time</Button>
                                </div><br/>
                                <div dangerouslySetInnerHTML={{__html: formatLogText(r.text, keyword)}}/>
                            </td></tr>;
                        }.bind(this))}
                    </tbody>
                </Table>
                <br/><Row>
                    <Col xs={2} xsOffset={10}><ButtonGroup>
                        <Button onClick={this.loadOlderLogs} className="previous-time-window">Prev</Button>
                            <Button onClick={this.loadNewerLogs} className="next-time-window">Next</Button>
                    </ButtonGroup></Col>
                </Row>
            </div>
            : null;

		return(<div>
            <form onSubmit={this.loadSenseLogs.bind(this, 0)}>
                <Row>
                    <Col xs={3} className="zero-padding-right"><Input id="field" type="select" addonBefore="Field">
                        <option value="text">Text</option>
                        <option value="device_id">Sense ID</option>
                        <option value="date">Date</option>
                    </Input></Col>
                    <Col xs={3} className="zero-padding-left"><Input id="keyword" type="text" placeholder="Keyword <optional>"/></Col>
                    <Col xs={1}><Button className="time-window" disabled>From</Button></Col>
                    <LongDatetimePicker glyphicon="time" placeHolder="start (GMT) <optional>" id="start" size="3" />
                    <Col xs={2}><Input id="limit" type="number" placeholder="20" addonBefore="Limit"/></Col>
                </Row>
                <Row>
                    <Col xs={3} className="zero-padding-right"><Input id="category" type="select" addonBefore="Category">
                        <option value="device_id">Sense ID</option>
                    </Input></Col>
                    <Col xs={3} className="zero-padding-left"><Input id="sense-id" type="text" placeholder="Filter Value <optional>"/></Col>
                    <Col xs={1}><Button className="time-window" disabled>To</Button></Col>
                    <LongDatetimePicker glyphicon="time" placeHolder="end (GMT) <optional>" id="end" size="3" />
                    <Col xs={1}><Button ref="submit" type="submit">&nbsp;<Glyphicon glyph="search"/>&nbsp;</Button></Col>
                    <Col xs={1}>{this.state.loading}</Col>
                </Row>
            </form>
            {this.state.alert}

            <Row>
                <Col xs={10}><a href="/black_list" target="_blank">Sense Black List:</a> {
                    this.state.blackList.map(function(s){return <span><Button bsSize="xsmall" disabled>{s}</Button>&nbsp;</span>})
                }</Col>
                <Col xs={2}><ButtonGroup>
                    <Button onClick={this.loadOlderLogs} className="previous-time-window">Prev</Button>
                    <Button onClick={this.loadNewerLogs} className="next-time-window">Next</Button>
                </ButtonGroup></Col>
            </Row><br/>
            {resultsTable}
        </div>)
	}
});

React.render(<SenseLogsNew/>, document.getElementById("sense-logs"));

function formatLogText(text, keyword){
    console.log(keyword);
    if (keyword.isWhiteString()) {
        return text.replace(/\n/g, "<br>");
    }
    return text.replace(/\n/g, "<br>")
        .replace(new RegExp(keyword, "gi"), function(m){return '<span class="highlight">' + m + '</span>';});
}

function formatUTCDateFromEpoch(ts) {
    var dt = new Date(ts);
    var convertedMonth = (dt.getUTCMonth() + 1).toString().length > 1 ? (dt.getUTCMonth() + 1) : "0" + (dt.getUTCMonth() + 1);
    var convertedDate = dt.getUTCDate().toString().length > 1 ? dt.getUTCDate() : "0" + dt.getUTCDate();
    var convertedHours = dt.getUTCHours().toString().length > 1 ? dt.getUTCHours() : "0" + dt.getUTCHours();
    var convertedMinutes = dt.getUTCMinutes().toString().length > 1 ? dt.getUTCMinutes() : "0" + dt.getUTCMinutes();
    var convertedSeconds = dt.getUTCSeconds().toString().length > 1 ? dt.getUTCSeconds() : "0" + dt.getUTCSeconds();
    return convertedMonth +
        "/" + convertedDate +
        "/" + dt.getUTCFullYear() +
        " " + convertedHours +
        ":" + convertedMinutes +
        ":" + convertedSeconds;
}
