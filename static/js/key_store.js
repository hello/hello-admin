/** @jsx React.DOM */

var KeyStoreMaestro = React.createClass({
    getInitialState: function() {
        return {alert: ""}
    },

    submitWithInputsfromURL: function() {
        var deviceInputFromURL = getParameterByName('device');
        var typeInputFromURL = getParameterByName('type');
        if (deviceInputFromURL.isWhiteString()) {
            return false;
        }
        if (typeInputFromURL.isWhiteString()) {
            return false;
        }
        $('#device-input').val(deviceInputFromURL);
        $('#type-input').val(typeInputFromURL);
        this.handleSubmit();
    },

    componentDidMount: function() {
        this.submitWithInputsfromURL();
    },

    pushHistory: function(device, type) {
        history.pushState({}, '', '/key_store/?device=' + device + '&type=' + type);
    },

    handleSubmit: function() {
        var that = this;
        var deviceInput = $("#device-input").val();
        var typeInput = $("#type-input").val();
        var requestData = {
            device_id: deviceInput.toUpperCase(),
            device_type: typeInput
        };
        console.log(requestData);
        if (isValidRequest(requestData) === true) {
            $.ajax({
                url: "/api/devices/key_store",
                type: "GET",
                dataType: 'json',
                data: requestData,
                success: function (response) {
                    that.pushHistory(deviceInput, typeInput);
                    console.log(response);
                    if (response.error === "") {
                        that.setState({alert: "AES Key: " + capitalizeVisiblePart(response.data.key) + "\n\r Metadata: " + response.data.metadata});
                    }
                    else {
                        that.setState({alert: response.error});
                    }
                }.bind(that),
                error: function (e) {
                    that.setState({alert: ""});
                }.bind(that)
            });
        }
        else {
            that.setState({alert: "Inavlid request!"});
        }
        return false;
    },
    render: function() {
        var alert = (this.state.alert === "") ? null:
            <Alert bsStyle="info">{this.state.alert}</Alert>;

        return (<Col xs={4} sm={4} md={4} xsOffset={4} smOffset={4} mdOffset={4}><form onSubmit={this.handleSubmit}>
            <Input id="type-input" type="select">
                <option value="">Select Device Type</option>
                <option value="sense">Sense</option>
                <option value="pill">Pill</option>
            </Input>
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
