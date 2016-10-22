/** @jsx React.DOM */

var KeysMaestro = React.createClass({
    getInitialState: function() {
        return {alert: ""}
    },
    handleSubmit: function() {
        var that = this;
        
        var requestData = {
            blob: $("#sense-blob-input").val(),
            serial_number: $("#sense-sn").val()
        };
        if (isValidRequest(requestData)) {
            $.ajax({
                url: "/api/sense_key_provision",
                type: "POST",
                data: requestData,
                success: function (response) {
                    console.log(response);
                    var msg = (response.error != "") ? response.error : response.data;
                    that.setState({alert: msg})
                }.bind(that),
                error: function (e) {
                    that.setState({alert: e.toString});
                }.bind(that)
            });
        }
        else {
            that.setState({alert: "Invalid request"});
        }
        return false;
    },
    render: function() {
        var alert = (this.state.alert === "") ? null:
            <Alert bsStyle="info">{this.state.alert}</Alert>;

        return (<Col xs={4} sm={4} md={4} lg={4} xl={4}>
            <h3>Sense Key Provision</h3><hr className="fancy-line"/><br/>
            <form onSubmit={this.handleSubmit}>
                <Input id="sense-blob-input" type="textarea" placeholder="Enter blob" name="sense-blob"/>
                <Input id="sense-sn" type="text" placeholder="Serial Number (required)" name="sense-sn"/>
                <Button bsStyle="info" bsSize="large" className="btn-circle" type="submit"><Glyphicon glyph="send"/></Button>
                {alert}
            </form>
        </Col>)
    }
});
React.renderComponent(<KeysMaestro />, document.getElementById('sense-key-provision'));

function prepareMetadata(viewer, remark) {
    var metadata = {
        provisioned_by: viewer,
        provisioned_at: new Date().toLocaleString(),
        remark: remark
    };
    console.log(metadata);
    return JSON.stringify(metadata);
}