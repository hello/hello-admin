/** @jsx React.DOM */

var KeysMaestro = React.createClass({
    getInitialState: function() {
        return {alert: ""}
    },
    handleSubmit: function() {
        var that = this;
        var remark = $("#sense-remark-input").val();
        var getRequestData = {
            stage: $("#sense-stage-input").val(),
            blob: $("#sense-blob-input").val()
        };
        console.log(getRequestData);
        if (isValidRequest(getRequestData)) {
            $.ajax({
                url: "/api/sense_key_provision",
                type: "GET",
                dataType: 'json',
                data: getRequestData,
                success: function (response) {
                    console.log(response);
                    if (response.error === "") {
                        that.setState({alert: "Successfully decoded key for sense " + response.data.device_id});
                        var postRequestData = {
                            device_id: response.data.device_id,
                            public_key: response.data.public_key,
                            metadata: prepareMetadata(response.viewer, remark)
                        };
                        var thisDevice = response.data.device_id ;
                        $.ajax({
                            url: "api/sense_key_provision",
                            type: "POST",
                            dataType: 'json',
                            data: postRequestData,
                            success: function(response) {
                                console.log(response);
                                if (response.error === "") {
                                    that.setState({alert: "Successfully stored key for sense " + thisDevice});
                                }
                                else {
                                        that.setState({alert: "Error: " + response.error});
                                }
                            }
                        });
                    }
                    else {
                        that.setState({alert: "Error: " + response.error});
                    }

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

        return (<Col xs={4} sm={4} md={4} xsOffset={1} smOffset={1} mdOffset={1}>
            <h3>Sense Key Provision</h3><hr className="fancy-line"/><br/>
            <form onSubmit={this.handleSubmit}>
                <Input id="sense-stage-input" type="select">
                    <option value="">Select product stage</option>
                    <option value="dvt">Design Validation Test</option>
                    <option value="pvt">Production Validation Test</option>
                    <option value="mp">Mass Production</option>
                </Input>
                <Input id="sense-blob-input" type="textarea" placeholder="Enter blob"/>
                <Input id="sense-remark-input" type="textarea" placeholder="Leave a remark (optional)"/>
                <Button bsStyle="info" bsSize="large" className="btn-circle" type="submit"><Glyphicon glyph="send"/></Button>
                {alert}
            </form>
        </Col>)
    }
});
React.renderComponent(<KeysMaestro />, document.getElementById('sense-key-provision'));

function prepareMetadata(viewer, remark) {
    var metadata = {
        viewer: viewer,
        remark: remark,
        extraInfo: {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            viewedAt: new Date().toLocaleString()
        }
    };
    console.log(metadata);
    return JSON.stringify(metadata);
}