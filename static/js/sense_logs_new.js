var SenseLogsNew = React.createClass({
    getInitialState: function() {
        return {response: {}, alert: null, resultsSize: 0, loading: null}
    },

    componentDidMount: function() {
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

    loadSenseLogs: function() {
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
                end: end ? new Date(end + " GMT").getTime() : null
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
                this.setState({response: response, alert: errorAlert, resultsSize: resultsSize, loading: null});
            }.bind(this)
        });
        return false;
    },
	render: function(){
        var response = this.state.response;
        var keyword = $("#keyword").val();
        var resultsTable = !$.isEmptyObject(response) && response.results && response.results.length > 0 ?
            <Table striped>
                <thead><tr>
                    <th className="alert-success">{this.state.resultsSize} documents</th>
                </tr></thead>
                <tbody>
                    {response.results.map(function(r){
                        return <tr><td>
                            <div className="center-wrapper">
                                <Button disabled>
                                    <span className="span-upload-ts">{new Date(r.variable_0 * 1000).toUTCString()}</span>
                                </Button>
                                - Sense ID: <a target="_blank" href={"/account_profile/?type=sense_id&input=" + r.device_id}>{r.device_id}</a>
                            </div><br/>
                            <div dangerouslySetInnerHTML={{__html: formatLogText(r.text, keyword)}}/>
                        </td></tr>;
                    })}
                </tbody>
            </Table>
            : null;

		return(<div>
            <form onSubmit={this.loadSenseLogs}>
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
                    <Col xs={1}><Button type="submit">&nbsp;<Glyphicon glyph="search"/>&nbsp;</Button></Col>
                    <Col xs={1}>{this.state.loading}</Col>
                </Row>
            </form>
            {this.state.alert}
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

