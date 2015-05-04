/** @jsx React.DOM */

var ForcePasswordUpdateMaestro = React.createClass({
    getInitialState: function() {
        return {alert: ""}
    },
    handleSubmit: function() {
        var that = this;
        var passwordInput = $("#force-password-input-1").val().trim();
        if (passwordInput !== $("#force-password-input-2").val().trim()) {
            that.setState({alert: "Mismatched password inputs"});
            return false;
        }
        var requestData = {
            email: $("#force-email-input").val().trim(),
            password: passwordInput
        };
        console.log(requestData);
        if (isValidRequest(requestData)) {
            $.ajax({
                url: "/api/force_password_update",
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
                        that.setState({alert: "Successfully updated"});
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

        return (<Col xs={8} sm={8} md={8} xsOffset={2} smOffset={2} mdOffset={2}><form onSubmit={this.handleSubmit}>
            <h3>Force Password Update</h3>
            <hr className="fancy-line" /><br/>
            <Input id="force-email-input" type="text" placeholder="Enter account email"/>
            <Input id="force-password-input-1" type="password" placeholder="Enter new password"/>
            <Input id="force-password-input-2" type="password" placeholder="Enter new password"/>
            <Button bsStyle="info" bsSize="large" className="btn-circle" type="submit"><Glyphicon glyph="send"/></Button>
            {alert}
        </form></Col>)
    }
});
$(function(){
    var viewer = $('#viewer').val();
    if (viewer == 'tim@sayhello.com' || viewer == 'marina@sayhello.com') {
        React.renderComponent(<ForcePasswordUpdateMaestro />, document.getElementById('force-password-update'));
    }
});


function isValidRequest(r) {
    return Object.keys(r).every(function(k){return r[k] && !r[k].isWhiteString()})
}
