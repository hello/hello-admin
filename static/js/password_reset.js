/** @jsx React.DOM */

var PasswordResetMaestro = React.createClass({
    getInitialState: function() {
        return {alert: ""}
    },
    handleSubmit: function() {
        var that = this;
        var requestData = {
            email: $("#email-input").val(),
        };
        console.log(requestData);
        if (isValidRequest(requestData)) {
            $.ajax({
                url: "/api/password_reset",
                type: "POST",
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(requestData),
                success: function (response) {
                    console.log(response);
                    if (!response.error.isWhiteString()){
                        that.setState({alert: response.error});
                    }
                    else {
                        that.setState({alert: "Password reset link sent to " + requestData.email});
                    }
                }.bind(that),
                error: function (e) {
                    that.setState({alert: e.toString});
                }.bind(that)
            });
            return false;
        }
    },
    render: function() {
        var alert = (this.state.alert === "") ? null:
            <Alert bsStyle="info">{this.state.alert}</Alert>;

        return (<Col xs={4} sm={4} md={4} xsOffset={4} smOffset={4} mdOffset={4}><form onSubmit={this.handleSubmit}>
            <h3>Password Reset</h3>
            <hr className="fancy-line" /><br/>
            <Input id="email-input" type="text" placeholder="Enter receiver email"/>
            <Button bsStyle="info" bsSize="large" className="btn-circle" type="submit"><Glyphicon glyph="send"/></Button>
            {alert}
        </form></Col>)
    }
});
React.renderComponent(<PasswordResetMaestro />, document.getElementById('password-reset'));

function isValidRequest(r) {
    return Object.keys(r).every(function(k){return r[k] && !r[k].isWhiteString()})
}
