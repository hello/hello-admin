/** @jsx React.DOM */

var KeysMaestro = React.createClass({
    getInitialState: function() {
        return {alert: ""}
    },
    handleSubmit: function() {
        var that = this;
        var requestData = {
            blob: $("#blob-input").val()
        };
        console.log(requestData);

            console.log(" good request");
            $.ajax({
                url: "/api/keys",
                type: "GET",
                dataType: 'json',
                data: requestData,
                success: function (response) {
                    console.log(response);
                    if (response.error === "") {
                        that.setState({alert: "Device ID: " + response.data.device_id});
                    }
                    else {
                        that.setState({alert: "Error: " + response.error});
                    }
                }.bind(that),
                error: function (e) {
                    that.setState({alert: e.toString});
                }.bind(that)
            });

        return false;
    },
    render: function() {
        var alert = (this.state.alert === "") ? null:
            <Alert bsStyle="info">{this.state.alert}</Alert>;

        return (<Col xs={4} sm={4} md={4} xsOffset={4} smOffset={4} mdOffset={4}><form onSubmit={this.handleSubmit}>
            <Input id="blob-input" type="textarea" placeholder="Enter blob"/>
            <Button bsStyle="info" bsSize="large" className="btn-circle" type="submit"><Glyphicon glyph="send"/></Button>
            {alert}
        </form></Col>)
    }
});
React.renderComponent(<KeysMaestro />, document.getElementById('keys'));

function isValidRequest(r) {
    return Object.keys(r).every(function(k){return r[k] && !r[k].isWhiteString()})
}
