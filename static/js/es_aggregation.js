var AVAILABLE_FIELDS = ["has_alarm", "has_dust", "has_firmware_crash", "has_wifi_info",
                        "middle_firmware_version", "top_firmware_version", "sense_id"];

var specialCharactersAllowed = ["�"];

var ESAggregationMaster = React.createClass({
    getInitialState: function() {
        return {availableIndexes: [], alert: null, aggregations: []};
    },
    handleAggregate: function() {
        var textInput = this.refs.textInput.getDOMNode().value;
        if (specialCharactersAllowed.indexOf(textInput) > -1){
            textInput = encodeURIComponent(textInput);
        }

        var fieldsInput = $("#fields-input").val();
        var indexesInput = $("#indexes-input").val();
        var sizeInput = this.refs.sizeInput.getDOMNode().value || 3;

        console.log(textInput, fieldsInput, indexesInput);

        this.setState({alert: <Alert>Loading</Alert>, aggregations: []});

        if (!textInput || !fieldsInput || !indexesInput) {
            this.setState({alert: <Alert>Invalid input</Alert>});
            return false;
        }

        if (Number(sizeInput) < 0 || Number(sizeInput) > 10) {
            this.setState({alert: <Alert>
                Top agg. size should be from 0 to 10.
                If agg. size is N, at most N categories will be showns for each field and the rest goes under "others"
            </Alert>});
            return false;
        }

        $.ajax({
            url: "/api/es_aggregation",
            data: {
                lucene_phrase: "text:" + textInput,
                size: sizeInput,
                fields: fieldsInput.join(","),
                index: indexesInput.join(",")
            },
            type: "GET",
            success: function(response) {
                console.log("response", response);
                if (response.error) {
                    this.setState({alert: <Alert>{response.error}</Alert>});
                }

                else {
                    this.setState({aggregations: response.data.aggregations, alert: null});
                }

            }.bind(this)
        });
        return false;
    },
    getAvailableIndexes: function() {
        $.ajax({
            url: "/api/es_status",
            type: "GET",
            success: function(response) {
                if (response.error.isWhiteString()){
                    this.setState({availableIndexes: Object.keys(response.data.indices)});
                }
            }.bind(this)
        });
        return false;
    },
    componentDidMount: function() {
        this.getAvailableIndexes();
    },
    render: function() {
        var results = Object.keys(this.state.aggregations).map(function(field){
            return <Col xs={3}><Table>
                <thead>
                    <tr><th>{field}</th><th></th></tr>
                </thead>
                <tbody>{
                    this.state.aggregations[field].buckets.map(function(bucket){
                        return <tr><td>{bucket.key}</td><td>{bucket.doc_count}</td></tr>;
                    }).concat(
                        <tr><td>Others</td><td>{this.state.aggregations[field].sum_other_doc_count}</td></tr>
                    )
                }</tbody>
            </Table></Col>;
        }.bind(this));
        return <div>
            <form onSubmit={this.handleAggregate}>
                <Col xs={3}>
                    <textarea id="text-input" className="form-control" ref="textInput" placeholder="text"/>
                </Col>
                <Col xs={3}>
                    <select id="fields-input" className="form-control" ref="fieldsInput" multiple>{
                        [<option value="">Select field(s)</option>].concat(
                        AVAILABLE_FIELDS.map(function(field){
                            return <option value={field}>{field}</option>
                        }))
                    }</select>
                </Col>
                <Col xs={3}>
                    <select id="indexes-input" className="form-control" ref="indexesInput" multiple>{
                        [<option value="">Select index(es)</option>].concat(
                        this.state.availableIndexes.map(function(field){
                            return <option value={field}>{field}</option>
                        }))
                    }</select>
                </Col>
                <Col xs={2}>
                    <input id="size-input" type="number" className="form-control" ref="sizeInput" placeholder="size (optional)"/>
                </Col>
                <Col xs={1}>
                    <Button id="submit" bsStyle="info" type="submit"><Glyphicon glyph="search"/></Button>
                </Col>
            </form><br/><br/>
            <Row className="results">{results}</Row>
            {this.state.alert}
        </div>
    }
});

React.render(<ESAggregationMaster/>, document.getElementById("es-aggregation"));