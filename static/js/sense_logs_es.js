var DEFAULT_PAGE_LIMIT = 200;

var SenseLogsESResultsTable = React.createClass({
    render: function() {
        return  <Table striped>
            {this.props.tableHeaders}
            <tbody>
            {this.props.documents.map(function (r) {
                return <tr>
                    <td>
                        <div className="logs-meta">
                            <Glyphicon glyph="time"/><span>  {new Date(r._source.epoch_millis).toUTCString()} </span>
                            | Sense:
                            <a target="_blank" href={"/account_profile/?type=sense_id&input=" + r._source.sense_id}> {r._source.sense_id}</a>
                            &nbsp;
                            | Top FW: {r._source.top_firmware_version}&nbsp;
                            | Middle FW:
                            <a target="_blank" href={"/firmware/?firmware_version=" + parseInt(r._source.middle_firmware_version, 16)}> {r._source.middle_firmware_version}</a>
                            &nbsp;&nbsp;
                        </div><hr className="splitter"/>
                        <br/>
                        <div className="logs-content" dangerouslySetInnerHTML={{__html: formatLogText(r._source.text, $("#text-input").val())}}/>
                    </td>
                </tr>;
            }.bind(this))}
            </tbody>
            {this.props.tableHeaders}
        </Table>;
    }
});

var SenseLogsESMaster = React.createClass({
    getInitialState: function() {
        return {mode: "basic", documents: [], error: "", total: 0, loading: false, oldestTimestamp: null, newestTimestamp: null};
    },

    submitWithInputsFromURL: function() {
        var limitFromURL = getParameterByName("limit");
        var isAscFromURL = getParameterByName("asc");
        var advanceInputFromURL = getParameterByName("advance_input");
        if(advanceInputFromURL) {
            this.refs.advanceInput.getDOMNode().value = advanceInputFromURL;
            this.refs.sizeInputAdvance.getDOMNode().value = limitFromURL;
            $("#is-asc-advance").prop('checked', isAscFromURL);
            this.setState({mode: "advance"});
            this.handleAdvanceSearch();
            return false;
        }
        this.setState({mode: "basic"});
        var senseIdFromURL = getParameterByName("sense_id");
        var textFromURL = getParameterByName("text");
        var topFWFromURL = getParameterByName("top_fw");
        var middleFWFromURL = getParameterByName("middle_fw");
        var startFromURL = getParameterByName("start");
        var endFromURL = getParameterByName("end");


        this.refs.senseInput.getDOMNode().value = senseIdFromURL;
        this.refs.textInput.getDOMNode().value = textFromURL;
        this.refs.topFirmwareInput.getDOMNode().value = topFWFromURL;
        this.refs.middleFirmwareInput.getDOMNode().value = middleFWFromURL;
        $("#start").val(startFromURL);
        $("#end").val(endFromURL);
        this.refs.sizeInput.getDOMNode().value = limitFromURL;
        $("#is-asc").prop('checked', isAscFromURL);
        this.handleBasicSearch();
    },

    componentDidMount: function() {
        this.submitWithInputsFromURL();
    },

    query: function(lucenePhrase, size, sort) {
        this.setState({documents: [], error: "", total: 0, loading: true});
        $.ajax({
            url: "/api/sense_logs_es",
            data: {lucene_phrase: lucenePhrase, size: size, sort: sort},
            type: "GET",
            success: function(response) {
                if (response.error) {
                    this.setState({error: response.error, loading: false});
                }
                else if(response.data.hits) {
                    this.setState({documents: response.data.hits.hits.sort(compareTimestamp), total: response.data.hits.total, loading: false});
                    if (this.state.documents.length > 0) {
                        this.setState({
                            oldestTimestamp: this.state.documents[0]._source.epoch_millis,
                            newestTimestamp: this.state.documents[this.state.documents.length-1]._source.epoch_millis
                        });
                    }
                }
            }.bind(this)
        });
    },

    handleBasicSearch: function() {
        var startDateTimeString = $("#start").val().trim();
        var endDateTimeString = $("#end").val().trim();
        var isOrderAsc = $('#is-asc').is(':checked');
        history.pushState({}, '', '/sense_logs_es/?text=' + this.refs.textInput.getDOMNode().value.trim() +
                              '&sense_id=' + this.refs.senseInput.getDOMNode().value.trim() +
                              '&top_fw=' + this.refs.topFirmwareInput.getDOMNode().value.trim() +
                              '&middle_fw=' + this.refs.middleFirmwareInput.getDOMNode().value.trim() +
                              '&start=' + startDateTimeString +
                              '&end=' + endDateTimeString +
                              '&limit=' + this.refs.sizeInput.getDOMNode().value.trim() +
                              '&asc=' + isOrderAsc
        );
        var startEpochMillis = new Date(startDateTimeString + " GMT").getTime();
        var endEpochMillis = new Date(endDateTimeString + " GMT").getTime();
        this.query(
            "sense_id:" + (this.refs.senseInput.getDOMNode().value.trim() || "*") +
            " AND text:" + (this.refs.textInput.getDOMNode().value.trim() || "*") +
            " AND top_firmware_version:" + (this.refs.topFirmwareInput.getDOMNode().value.trim() || "*") +
            " AND middle_firmware_version:" + (this.refs.middleFirmwareInput.getDOMNode().value.trim() || "*") +
            " AND epoch_millis:[" + (startEpochMillis || "*") + " TO " + (endEpochMillis || "*") + "]",
            this.refs.sizeInput.getDOMNode().value.trim() || DEFAULT_PAGE_LIMIT,
            isOrderAsc ? "epoch_millis:asc" : "epoch_millis:desc"
        );
        return false;
    },

    handleAdvanceSearch: function() {
        var isOrderAscAdvance = $('#is-asc-advance').is(':checked');
        history.pushState({}, '', '/sense_logs_es/?advance_input=' + this.refs.advanceInput.getDOMNode().value.trim() +
                              '&limit=' + this.refs.sizeInputAdvance.getDOMNode().value.trim() +
                              '&asc=' + isOrderAscAdvance
        );
        this.query(
            this.refs.advanceInput.getDOMNode().value.trim()  || "*",
            this.refs.sizeInputAdvance.getDOMNode().value.trim() || DEFAULT_PAGE_LIMIT,
            isOrderAscAdvance ? "epoch_millis:asc" : "epoch_millis:desc"
        );
        return false;
    },

    switchToAdvanceMode: function() {
        this.setState({mode: "advance", documents: [], error: "", total: 0});
    },

    switchToBasicMode: function() {
        this.setState({mode: "basic", documents: [], error: "", total: 0});
    },

    loadOlderLogs: function() {
        $("#start").val("");
        $("#end").val(formatUTCDateFromEpoch(this.state.oldestTimestamp));
        this.handleBasicSearch();
    },
    loadNewerLogs: function() {
        $("#start").val(formatUTCDateFromEpoch(this.state.newestTimestamp));
        $("#end").val("");
        this.handleBasicSearch();
    },

    render: function() {
        var basicSearchForm = <Row id="row-basic-search" className={this.state.mode === "basic" ? "row-visible" : "row-invisible"}>
            <form id="basic-search" onSubmit={this.handleBasicSearch}>
                <Col xs={3}>
                    <input className="form-control" ref="senseInput" type="text" placeholder="sense external id"/>
                </Col>
                <Col xs={3}>
                    <input className="form-control" ref="topFirmwareInput" type="text"
                           placeholder="top FW version"/>
                </Col>
                <LongDatetimePicker size={3} glyphicon="clock" placeHolder="start datetime"
                                    id="start"/>
                <Col xs={1}>
                    <input className="size-input form-control" ref="sizeInput" type="number" placeholder="limit"/>
                </Col>
                <Col xs={1}>
                    <Button bsStyle="info" type="submit">{this.state.loading ? "..." : <Glyphicon glyph="search"/>}</Button>
                </Col>
                <Col xs={3}>
                    <input id="text-input" className="form-control" ref="textInput" type="text" placeholder="text phrase"/>
                </Col>
                <Col xs={3}>
                    <input className="form-control" ref="middleFirmwareInput" type="text"
                           placeholder="middle FW version"/>
                </Col>
                <LongDatetimePicker size={3} glyphicon="clock" placeHolder="end datetime" id="end"/>
                <Col xs={2} className="mode-wrapper">
                    <span>or switch to <span className="mode" onClick={this.switchToAdvanceMode}>advanced mode</span></span>
                </Col>
                <span className="sort-wrapper">oldest first</span> <input id="is-asc" type="checkbox"/>
            </form>
            <br/>
        </Row>;
        var advanceSearchForm = <Row id="row-advance-search" className={this.state.mode === "advance" ? "row-visible" : "row-invisible"}>
            <form id="advance-search" onSubmit={this.handleAdvanceSearch}>
                <Col xs={7}>
                    <input className="form-control" ref="advanceInput" type="text" placeholder="query in lucene syntax"/>
                </Col>
                <Col xs={1}>
                    <input className="size-input form-control" ref="sizeInputAdvance" type="number" placeholder="limit"/>
                </Col>
                <Col xs={1}>
                    <Button bsStyle="info" type="submit">{this.state.loading ? "..." : <Glyphicon glyph="search"/>}</Button>
                </Col>
                <Col xs={2} className="mode-wrapper">
                    <span>or switch to <span className="mode" onClick={this.switchToBasicMode}>basic mode</span></span>
                </Col>
                <span className="sort-wrapper">oldest first</span> <input id="is-asc-advance" type="checkbox"/>
            </form><br/>
        </Row>;

        var tableHeaders = this.state.documents.length > 0 && this.state.mode === "basic" ? <thead>
            <tr>
                <th>
                    <Pager>
                        <PageItem previous onClick={this.loadOlderLogs}>&larr; Older</PageItem>
                        <PageItem next onClick={this.loadNewerLogs}>Newer &rarr;</PageItem>
                    </Pager>
                </th>
            </tr>
            </thead> : null;
        return <div>
            {basicSearchForm}
            {advanceSearchForm}
            <div className="es-summary">hits: {this.state.total}</div>
            <SenseLogsESResultsTable documents={this.state.documents} tableHeaders={tableHeaders}/>
        </div>;
    }
});

React.render(<SenseLogsESMaster/>, document.getElementById("sense-logs-es"));

function formatLogText(text, keyword){
    if (!keyword || keyword.isWhiteString()) {
        return text.replace(/\n/g, "<br>");
    }
    return text.replace(/\n/g, "<br>")
        .replace(new RegExp(keyword, "gi"), function(m){return '<span class="highlight">' + m + '</span>';});
}

function formatUTCDateFromEpoch(ts) {
    return d3.time.format.utc("%m/%d/%Y %H:%M:%S")(new Date(ts));
}

function compareTimestamp(d1, d2) {
    return d1._source.epoch_millis - d2._source.epoch_millis;
}