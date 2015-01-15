/** @jsx React.DOM */

var KeyStoreMaestro = React.createClass({
    getInitialState: function() {
        return {alert: ""}
    },

    submitWithInputsfromURL: function() {
        var deviceInputFromURL = getParameterByName('device');
        if (deviceInputFromURL.isWhiteString()) {
            return false;
        }
        $('#device-input').val(deviceInputFromURL);
        this.handleSubmit();
    },

    componentDidMount: function() {
        this.submitWithInputsfromURL();
    },

    pushHistory: function(device) {
        history.pushState({}, '', '/key_store/?device=' + device);
    },

    handleSubmit: function() {
        var that = this;
        var deviceInput = $("#device-input").val();
        var requestData = {
            device_id: deviceInput
        };
        console.log(requestData);
        if (isValidRequest(requestData) === true) {
            console.log(" good request");
            $.ajax({
                url: "/api/devices/key_store",
                type: "GET",
                dataType: 'json',
                data: requestData,
                success: function (response) {
                    console.log(response);
                    that.pushHistory(deviceInput);
                    that.setState({alert: "Key store: " + capitalizeVisiblePart(response.data.hint)});
                }.bind(that),
                error: function (e) {
                    that.setState({alert: ""});
                }.bind(that)
            });
        }
        return false;
    },
    render: function() {
        var alert = (this.state.alert === "") ? null:
            <Alert bsStyle="info">{this.state.alert}</Alert>;

        return (<Col xs={4} sm={4} md={4} xsOffset={4} smOffset={4} mdOffset={4}><form onSubmit={this.handleSubmit}>
            <Input id="device-input" type="text" placeholder="Enter device ID"/>
            <Button bsStyle="info" bsSize="large" className="btn-circle" type="submit"><Glyphicon glyph="send"/></Button>
            {alert}
        </form></Col>)
    }
});
React.renderComponent(<KeyStoreMaestro />, document.getElementById('key-store'));

function capitalizeVisiblePart(s) {
    return s.slice(0, 4).toUpperCase() + s.slice(4, -4) + s.slice(-4).toUpperCase();
}
