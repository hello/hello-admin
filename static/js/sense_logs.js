var SenseLogsNew = React.createClass({
    getInitialState: function() {
        return {response: {}, alert: null, resultsSize: 0, loading: null, blackList: []}
    },

    componentDidMount: function() {
        this.retrieveBlackList();
        var fieldFromURL = getParameterByName("field"),
            keywordFromURL = getParameterByName("keyword"),
            categoryFromURL = getParameterByName("category"),
            categoryInputFromURL = getParameterByName("category_input"),
            limitFromURL = getParameterByName("limit"),
            startFromURL = getParameterByName("start"),
            endFromURL = getParameterByName("end");

        if (fieldFromURL) {
            $("#field").val(fieldFromURL);
        }
        if (categoryFromURL) {
            $("#category").val(categoryFromURL);
        }
        if (categoryInputFromURL) {
            $("#category-input").val(categoryInputFromURL);
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
            category = $("#category").val(),
            categoryInput = $("#category-input").val().trim(),
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

        history.pushState({}, '', '/sense_logs/?field=' + field + '&keyword=' + keyword + '&category=' + category + '&category_input=' + categoryInput + '&limit=' + limit + "&start=" + start + "&end=" + end);
        var categories = null;

        if (categoryInput) {
            var o = {};
            o[category] = categoryInput.split(",").map(function(s){return s.trim();});
            categories = JSON.stringify(o);
        }

        var sendingData = {
                query: field + ":" + keyword,
                categories: categories,
                limit: limit ? limit : 20,
                start: start ? new Date(start + " GMT").getTime() : null,
                end: end ? new Date(end + " GMT").getTime() : null,
                order: order
            };
        console.log("sending", sendingData);
        $.ajax({
            url: "/api/sense_logs",
            dataType: 'json',
            type: 'GET',
            data: sendingData,
            success: function (response) {
                console.log("getting", response);
//                var errorAlert = responseResults && responseResults.length === 0 ?
//                    <Alert>No matches found!</Alert> : null;
                if (!$.isEmptyObject(response.error)) {
                    console.log("error", response.error);
                }

                var responseResults = response.results.sort(function(r1, r2){return r1.variable_1 - r2.variable_1;});

                var resultsSize = responseResults ? responseResults.length : 0;
                var newState = {
                    response: response,
                    resultsSize: resultsSize,
                    loading: null
                };
                if (resultsSize > 0) {
                    newState.oldestTimestamp = responseResults[0].variable_1;
                    newState.newestTimestamp = responseResults[resultsSize-1].variable_1;
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
        $("#category-input").val("");
        $("#start").val(d3.time.format.utc("%Y-%m-%d %H:%M:%S")(new Date(ts - 5*60*1000)));
        $("#end").val(d3.time.format.utc("%Y-%m-%d %H:%M:%S")(new Date(ts + 5*60*1000)));
        this.refs.submit.getDOMNode().focus();
        this.loadSenseLogs();
    },
	render: function(){
        var response = this.state.response;
        var keyword = $("#keyword").val();
        var resultsTable = !$.isEmptyObject(response) && response.results ?
            <Table striped>
                <thead><tr><th className="alert-success">
                    <Col xs={2}><Button onClick={this.loadOlderLogs} className="previous-time-window">Prev</Button></Col>
                    <Col xs={8}>{this.state.resultsSize} documents</Col>
                    <Col xs={2}><Button onClick={this.loadNewerLogs} className="next-time-window">Next</Button></Col>
                </th></tr></thead>
                <tbody>
                    {response.results.sort(function(r1, r2){return r1.variable_1 - r2.variable_1;}).map(function(r){
                        return <tr><td>
                            <div className="center-wrapper">
                                <Button className="borderless" disabled>
                                    <span className="span-upload-ts">{new Date(r.variable_1).toUTCString()}</span>
                                </Button>
                                - Sense: <a target="_blank" href={"/account_profile/?type=sense_id&input=" + r.device_id}>{r.device_id}</a>&nbsp;
                                - <a target="_blank" href={"/firmware/?firmware_version=" + parseInt(r.middle_fw_version, 16)}>{r.middle_fw_version}</a>&nbsp;
                                <Button onClick={this.focusWindow.bind(this, r.device_id, r.variable_1)}>Logs around this time</Button>
                            </div><br/>
                            <div dangerouslySetInnerHTML={{__html: formatLogText(r.text, keyword)}}/>
                        </td></tr>;
                    }.bind(this))}
                </tbody>
                {response.results.length === 0 ? null :  <thead><tr><th className="alert-success">
                    <Col xs={2}><Button onClick={this.loadOlderLogs} className="previous-time-window">Prev</Button></Col>
                    <Col xs={8}>{this.state.resultsSize} documents</Col>
                    <Col xs={2}><Button onClick={this.loadNewerLogs} className="next-time-window">Next</Button></Col>
                </th></tr></thead>}
            </Table>
            : null;

		return(<div>
            <form onSubmit={this.loadSenseLogs.bind(this, 0)}>
                <Row>
                    <Col xs={3} className="zero-padding-right"><Input id="field" type="select" addonBefore="Search By">
                        <option value="text">Text</option>
                        <option value="device_id">Sense ID</option>
                        <option value="date">Date</option>
                        <option value="top_fw_version">Top Firmware Version</option>
                        <option value="middle_fw_version">Middle Firmware Version</option>
                    </Input></Col>
                    <Col xs={3} className="zero-padding-left"><Input id="keyword" type="text" placeholder="search phrase <optional>"/></Col>
                    <Col xs={1}><Button className="time-window" disabled>From</Button></Col>
                    <LongDatetimePicker glyphicon="time" placeHolder="start (GMT) <optional>" id="start" size="3" />
                    <Col xs={2}><Input id="limit" type="number" placeholder="20" addonBefore="Limit"/></Col>
                </Row>
                <Row>
                    <Col xs={3} className="zero-padding-right"><Input id="category" type="select" addonBefore="Filter By">
                        <option value="device_id">Sense ID</option>
                        <option value="top_fw_version">Top Firmware Version</option>
                        <option value="middle_fw_version">Middle Firmware Version</option>
                    </Input></Col>
                    <Col xs={3} className="zero-padding-left"><Input id="category-input" type="text" placeholder="filter value <optional>"/></Col>
                    <Col xs={1}><Button className="time-window" disabled>To</Button></Col>
                    <LongDatetimePicker glyphicon="time" placeHolder="end (GMT) <optional>" id="end" size="3" />
                    <Col xs={1}><Button bsStyle="success" ref="submit" type="submit">&nbsp;<Glyphicon glyph="search"/>&nbsp;</Button></Col>
                    <Col xs={1}>{this.state.loading}</Col>
                </Row>
            </form>
            <Row>
                <Col xs={10}><a href="/black_list" target="_blank">Sense Black List:</a> {
                    this.state.blackList.map(function(s){return <span><Button bsSize="xsmall" disabled>{s}</Button>&nbsp;</span>})
                }</Col>
            </Row><br/>
            {this.state.alert}
            {resultsTable}
        </div>)
	}
});

React.render(<SenseLogsNew/>, document.getElementById("sense-logs"));

function formatLogText(text, keyword){
    if (keyword.isWhiteString()) {
        return text.replace(/\n/g, "<br>");
    }
    return text.replace(/\n/g, "<br>")
        .replace(new RegExp(keyword, "gi"), function(m){return '<span class="highlight">' + m + '</span>';});
}

function formatUTCDateFromEpoch(ts) {
    return d3.time.format.utc("%m/%d/%Y %H:%M:%S")(new Date(ts));
}
