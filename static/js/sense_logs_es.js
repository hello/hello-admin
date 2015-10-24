var SenseLogsESResultsTable = React.createClass({
    render: function() {
        console.log(this.props.documents);
        return  <Table striped>
            <thead>
            <tr>
                <th className="alert-success">
                    <Col xs={2}>
                        <Button onClick={this.loadOlderLogs} className="previous-time-window">Prev</Button>
                    </Col>
                    <Col xs={4}>7 documents</Col>
                    <Col xs={2}>
                        <Button bsSize="xs">
                            <FileExporter fileContent={"zzz"} fileName="sense_logs"/>
                        </Button>
                    </Col>
                    <Col xs={2}>
                        <Button bsSize="xs">
                            <FileExporter fileContent={"zzz"} fileName="DUSTY" dataType="data:text/csv," buttonName="DUSTY" needStringify={false} />
                        </Button>
                    </Col>
                    <Col xs={2}>
                        <Button onClick={this.loadNewerLogs} className="next-time-window">Next</Button>
                    </Col>
                </th>
            </tr>
            </thead>
            <tbody>
            {this.props.documents.map(function (r) {
                return <tr>
                    <td>
                        <div className="center-wrapper">
                            <Button className="borderless" disabled>
                                <span className="span-upload-ts">{new Date(r._source.epoch_millis).toUTCString()}</span>
                            </Button>
                            - Sense:
                            <a target="_blank" href={"/account_profile/?type=sense_id&input=" + r._source.sense_id}>{r._source.sense_id}</a>
                            &nbsp;
                            - Top FW: {r._source.top_firmware_version}&nbsp;
                            - Middle FW:
                            <a target="_blank" href={"/firmware/?firmware_version=" + parseInt(r._source.middle_firmware_version, 16)}>{r._source.middle_firmware_version}</a>
                            &nbsp;&nbsp;
                        </div>
                        <br/>
                        <div>{r._source.text}</div>
                    </td>
                </tr>;
            })}
            </tbody>
        </Table>;
    }
});

var SenseLogsESMaster = React.createClass({
    getInitialState: function() {
        return {mode: "basic", documents: [], error: "", total: 0};
    },
    componentDidMount: function() {
    },

    query: function(lucenePhrase) {
        $.ajax({
            url: "/api/sense_logs_es",
            data: {lucene_phrase: lucenePhrase},
            type: "GET",
            success: function(response) {
                if (response.error) {
                    this.setState({error: response.error});
                }
                else if(response.data.hits) {
                    this.setState({documents: response.data.hits.hits, total: response.data.hits.total})
                }
                console.log(this.state);
            }.bind(this)
        });
    },

    handleBasicSearch: function() {
        this.query(
            "sense_id:" + (this.refs.senseInput.getDOMNode().value.trim() || "*") +
            " AND text:" + (this.refs.textInput.getDOMNode().value.trim() || "*") +
            " AND top_firmware_version:" + (this.refs.topFirmwareInput.getDOMNode().value.trim() || "*") +
            " AND middle_firmware_version:" + (this.refs.middleFirmwareInput.getDOMNode().value.trim() || "*")
        );
        return false;
    },

    handleAdvanceSearch: function() {
        this.query(this.refs.advanceInput.getDOMNode().value.trim()  || "*");
        return false;
    },

    switchToAdvanceMode: function() {
        this.setState({mode: "advance"});
    },

    switchToBasicMode: function() {
        this.setState({mode: "basic"});
    },

    render: function() {
        var searchForm = {
            basic: <Row id="row-basic-search">
                <form id="basic-search" onSubmit={this.handleBasicSearch}>
                    <Col xs={3}>
                        <input className="form-control" ref="senseInput" type="text" placeholder="sense external id"/>
                    </Col>
                    <Col xs={3}>
                        <input className="form-control" ref="topFirmwareInput" type="text"
                               placeholder="top FW version"/>
                    </Col>
                    <LongDatetimePicker size={3} glyphicon="clock" placeHolder="start, default = 24hrs ago"
                                        id="start-time"/>
                    <Col xs={2}>
                        <Button bsStyle="info" type="submit"><Glyphicon glyph="search"/></Button>
                    </Col>
                    <Col xs={3}>
                        <input className="form-control" ref="textInput" type="text" placeholder="text phrase"/>
                    </Col>
                    <Col xs={3}>
                        <input className="form-control" ref="middleFirmwareInput" type="text"
                               placeholder="middle FW version"/>
                    </Col>
                    <LongDatetimePicker size={3} glyphicon="clock" placeHolder="end, default = now" id="end-time"/>
                    <Col xs={2} className="mode-wrapper">
                        <span>or switch to <span className="mode" onClick={this.switchToAdvanceMode}>advance mode</span></span>
                    </Col>
                </form>
                <br/>
            </Row>,
            advance: <Row id="row-advance-search">
                <form id="advance-search" onSubmit={this.handleAdvanceSearch}>
                    <Col xs={7}>
                        <input className="form-control" ref="advanceInput" type="text" placeholder="query in lucene syntax"/>
                    </Col>

                    <Col xs={1}>
                        <Button type="submit" bsStyle="info"><Glyphicon glyph="search"/></Button>
                    </Col>
                    <Col xs={2} className="mode-wrapper">
                        <span>or switch to <span className="mode" onClick={this.switchToBasicMode}>basic mode</span></span>
                    </Col>
                </form><br/>
            </Row>
        };

        return <div>
            {searchForm[this.state.mode]}
            <SenseLogsESResultsTable documents={this.state.documents}/>
        </div>
    }
});

React.render(<SenseLogsESMaster/>, document.getElementById("sense-logs-es"));