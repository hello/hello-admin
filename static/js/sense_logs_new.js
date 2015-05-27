var SenseLogsNew = React.createClass({
    getInitialState: function() {
        return {response: {}, alert: null, resultsSize: 0}
    },

    componentDidMount: function() {
        var fieldFromURL = getParameterByName("field"),
            keywordFromURL = getParameterByName("keyword"),
            senseIdFromURL = getParameterByName("sense_id"),
            limitFromURL = getParameterByName("limit"),
            startFromURL = getParameterByName("start"),
            endFromURL = getParameterByName("end");

        if (keywordFromURL.isWhiteString()) {
            return false;
        }
        else {
            $("#keyword").val(keywordFromURL);
        }
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
        this.loadSenseLogs();
    },

    loadSenseLogs: function() {
        this.setState({alert: <img src="/static/image/loading.gif" />});
        var field = $("#field").val(),
            keyword = $("#keyword").val(),
            senseId = $("#sense-id").val(),
            limit = $("#limit").val(),
            start = $("#start").val(),
            end = $("#end").val();

        if (!keyword) {
            this.setState({alert: <Alert bsStyle="warning">Keyword cannot be empty</Alert>});
            return false;
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
                var errorAlert = !(!$.isEmptyObject(response) && response.results && response.results.length > 0) && response.error ?
                    <Alert bsStyle="danger">{response.error}</Alert> : null;
                var resultsSize = response.results ? response.results.length : 0;
                this.setState({response: response, alert: errorAlert, resultsSize: resultsSize});
            }.bind(this)
        });
        return false;
    },
	render: function(){
        var response = this.state.response;
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
                            <div>{r.text.split("\n").map(function(n){return <div>{n}<br/></div>})}</div>
                        </td></tr>;
                    })}
                </tbody>
            </Table>
            : null;

		return(<div>
            <form onSubmit={this.loadSenseLogs}>
                <Row>
                    <Col xs={3}><Input id="field" type="select" addonBefore="Field">
                        <option value="text">Text</option>
                        <option value="device_id">Sense ID</option>
                        <option value="date">Date</option>
                    </Input></Col>
                    <Col xs={3}><Input id="keyword" type="text" placeholder="Keyword (required)"/></Col>
                    <Col xs={1}><Button className="time-window" disabled>From</Button></Col>
                    <LongDatetimePicker glyphicon="time" placeHolder="start time(GMT)" id="start" size="3" />
                    <Col xs={2}><Input id="limit" type="number" placeholder="Limit" addonBefore="Limit"/></Col>
                </Row>
                <Row>
                    <Col xs={3}><Input id="category" type="select" addonBefore="Category">
                        <option value="device_id">Sense ID</option>
                    </Input></Col>
                    <Col xs={3}> <Input id="sense-id" type="text" placeholder="Filter Value <optional>"/></Col>
                    <Col xs={1}><Button className="time-window" disabled>To</Button></Col>
                    <LongDatetimePicker glyphicon="time" placeHolder="end time(GMT)" id="end" size="3" />
                    <Col xs={1}><Button type="submit">&nbsp;<Glyphicon glyph="search"/>&nbsp;</Button></Col>
                </Row>
            </form>
            {this.state.alert}
            {resultsTable}
        </div>)
	}
});

React.render(<SenseLogsNew/>, document.getElementById("sense-logs"));

