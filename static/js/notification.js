/** @jsx React.DOM */

var NotificationMaestro = React.createClass({
    getInitialState: function() {
        return {alert: ""}
    },
    handleSubmit: function() {
        var that = this;
        var requestData = {
            receiver: $("#receiver-input").val().trim(),
            target: $("#target-input").val().trim(),
            details: $("#details-input").val(),
            body: $("#body-input").val()
        };
        console.log(requestData);
        $.ajax({
            url: "/api/notification",
            type: "POST",
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(requestData),
            success: function (response) {
                if (response.error.isWhiteString()) {
                    that.setState({alert: "Message sent to " + requestData.receiver + "! Check it out in a bit. Make sure push notification is enabled on receiver's phone)"});
                }
                else {
                    that.setState({alert: response.error});
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
            <Input id="receiver-input" type="text" placeholder="Enter receiver email"/>
            <Input id="target-input" type="text" placeholder="Enter target (category)"/>
            <Input id="details-input" type="text" placeholder="Enter details"/>
            <Input id="body-input" type="textarea" placeholder="Enter body (content)"/>
            <Button bsStyle="info" bsSize="large" className="btn-circle" type="submit"><Glyphicon glyph="send"/></Button>
            {alert}
        </form></Col>)
    }
});
React.renderComponent(<NotificationMaestro />, document.getElementById('notification'));

function isValidRequest(r) {
    return Object.keys(r).every(function(k){return r[k] && !r[k].isWhiteString()})
}
