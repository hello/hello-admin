var LogsLevelMaster = React.createClass({
    getInitialState: function() {
        return {availableLevels: [], alert: null};
    },

    getAvailableLevels: function(){
        $.ajax({
            url: "/api/logs_level",
            dataType: "json",
            type: "GET",
            success: function(response) {
                if (response.error.isWhiteString()){
                    this.setState({availableLevels: response.data});
                }
                else {
                    this.setState({alert: <Alert bsStyle="danger">{response.error}</Alert>});
                }
            }.bind(this)
        })
    },

    setLogsLevel: function(){
        this.setState({alert: null});
        $.ajax({
            url: "/api/logs_level",
            type: "PUT",
            dataType: 'json',
            data: JSON.stringify({
                device_id: this.refs.senseId.getDOMNode().value,
                fw_version: this.refs.fwVersion.getDOMNode().value,
                log_level: this.refs.logsLevel.getDOMNode().value
            }),
            success: function(response) {
                if (response.error.isWhiteString()){
                    this.setState({alert: <Alert bsStyle="success">Success</Alert>});
                }
                else {
                    this.setState({alert: <Alert bsStyle="danger">{response.error}</Alert>});
                }
            }.bind(this)
        });
        return false;
    },


    componentDidMount: function() {
        this.getAvailableLevels();
    },

    render: function() {
        return <div>
            <form onSubmit={this.setLogsLevel}>
                <Col xs={3}>
                    <input className="form-control" placeholder="Sense External ID" ref="senseId" type="text" />
                </Col>
                <Col xs={3}>
                    <input className="form-control" placeholder="Firmware Version (Decimal)" ref="fwVersion" type="text" />
                </Col>
                <Col xs={3}>
                    <select className="form-control" ref="logsLevel">{
                        this.state.availableLevels.map(function(l){
                            return <option value={l}>{l}</option>;
                        })
                    }</select>
                </Col>
                <Col xs={2}>
                    <Button type="submit">Set Logs Level</Button>
                </Col>
            </form>
            <br/><br/><br/>
            {this.state.alert}
        </div>;
    }
});

React.render(<LogsLevelMaster />, document.getElementById("logs-level"));