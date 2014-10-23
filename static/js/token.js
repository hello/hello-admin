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
    return {data: [{name:'Loading...',value:''}], username: '', success : false, failure: false, token :'Token will appear here'};
  },
  fade : function() {
    this.setState({'failure' : false, 'success': false})
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
    
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: stuff,
      success: function(data) {
        this.setState({token: data, success : true});
        setTimeout(this.fade, 2000);
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({token: 'error generating token. check the credentials for', failure: true})
        setTimeout(this.fade, 2000);
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
    this.refs.username.getDOMNode().value = '';
    this.refs.password.getDOMNode().value = '';
    return;
  },


  render: function() {


    var cx = React.addons.classSet;
    var classes = cx({
      'tokenForm': true,
      'success': this.state.success,
      'failure' : this.state.failure,
      'normal' : !this.state.success && !this.state.failure
    });

    return (
      <form className={classes} onSubmit={this.handleSubmit}>
        <ApplicationList data={this.state.data} ref="apps" />
        <input type="text" placeholder="username@email.com" ref="username" className="input-box form-control"/>
        <input type="text" placeholder="your password" ref="password" className="input-box form-control"/>
        <input type="submit" value="Post" className="btn btn-default"/>
        <p>{this.state.token} {this.state.username}</p>
      </form>
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
  
  render: function() {
    return (
      <div className="tokenBox">
        <h2>Token</h2>
        <ApplicationForm url={this.props.url} />
      </div>
    );
  }
});


React.renderComponent(
  <ApplicationBox  url="/access_token"/>,
  document.getElementById('token')
);