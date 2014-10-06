/** @jsx React.DOM */
// The above declaration must remain intact at the top of the script.

var ApplicationList = React.createClass({
  handleChange: function () {
        var client_id = this.refs.apps.getDOMNode().value;
        this.setState({client_id: client_id});
    },
  render: function() {
    var appOptions = this.props.data.map(function (application) {
      return (
        <Application client_id={application.client_id} name={application.name} />
      );
    });
    return (
      <select ref="apps" onChange={this.handleChange}>
        {appOptions}
        </select>
    );
  }
});

var ApplicationForm = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: [{name:'Loading...',value:''}], username: ''};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var username = this.refs.username.getDOMNode().value.trim();
    var password = this.refs.password.getDOMNode().value.trim();
    var client_id = this.refs.apps.refs.apps.getDOMNode().value.trim();
    console.log(client_id)
    if (!username || !password) {
      return;
    }
    var stuff = {username: username, password: password, client_id:client_id}
    this.setState(stuff)
    this.props.onCommentSubmit(stuff);
    this.refs.username.getDOMNode().value = '';
    this.refs.password.getDOMNode().value = '';
    return;
  },


  render: function() {
    return (
      <div>
      <form className="tokenForm" onSubmit={this.handleSubmit}>
        <ApplicationList data={this.state.data} ref="apps" />
        <input type="text" placeholder="username@email.com" ref="username" />
        <input type="text" placeholder="your password" ref="password"/>
        <input type="submit" value="Post" />
      </form>
      <p>{this.props.token} {this.state.username}</p>
      </div>
    );
  }
});

var Application = React.createClass({
  render: function() {
    return (
       <option value={this.props.client_id}>{this.props.name}</option>
    );
  }
});


var ApplicationBox = React.createClass({
  getInitialState : function() {
    return {token : 'Token will appear here'}
  },
  handleCommentSubmit: function(comment) {

    // var comments = this.state.data;
    // var newComments = comments.concat([comment]);
    // this.setState({data: newComments});

    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({token: data});
        this.props.token = this.state.token
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({token: 'error generating token. check the credentials'})
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
      <div className="tokenBox">
        <h2>Token</h2>
        <ApplicationForm onCommentSubmit={this.handleCommentSubmit} url={this.props.url} token={this.state.token}/>
      </div>
    );
  }
});


React.renderComponent(
  <ApplicationBox  url="/access_token"/>,
  document.getElementById('token')
);