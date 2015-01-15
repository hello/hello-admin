/** @jsx React.DOM */

var UserTokenDialog = React.createClass({
  getInitialState: function() {
    return {
        token: "",
        password: ""
    }
  },
  handleClick: function() {
    var that = this;
    var postData = {
      username: that.props.username,
      password: $('#user-token-password').val(),
      app: that.props.app
    };
    console.log('sending', postData);
    $.ajax({
      url: "/api/tokens",
      dataType: 'json',
      type: 'POST',
      data: JSON.stringify(postData),
      success: function(response) {
        console.log(response);
        that.setState({token: response.data.token});
        that.props.onRequestHide();
      }.bind(that),
      error: function(e) {
        that.setState({token: "Failed to generate token. Check credentials"})
      }.bind(that)
    });
  },
  render: function() {
    var token = this.state.token === "" ?
        <div>{this.state.error}</div>:
        <div>{this.state.token}</div>;

    return this.transferPropsTo(
      <Modal title={"Enter password for " + this.props.username}>
        <div className="modal-body">
          <Input id="password" type="password"/>
        </div>
        <div className="modal-footer">
          <Button onClick={this.handleClick}>Get Token</Button>
          <Button onClick={this.props.onRequestHide}>Close</Button>
          <p/>
          {token}
        </div>
      </Modal>
    );
  }
});