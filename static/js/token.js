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
      <select className="form-control" ref="apps" onChange={this.handleChange}>
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
        <p className="icon-addon addon-md">
          <ApplicationList id="token-app" data={this.state.data} ref="apps" />
          <label for="token-app" className="glyphicon glyphicon-cloud"></label>
        </p>
        <p className="icon-addon addon-md">
          <input id="token-email" type="text" placeholder="username@email.com" ref="username" className="input-box form-control"/>
          <label for="token-email" className="glyphicon glyphicon-envelope"></label>
        </p>
        <p className="icon-addon addon-md">
          <input id="token-pw" type="text" placeholder="your password" ref="password" className="input-box form-control"/>
          <label for="token-pw" className="glyphicon glyphicon-lock"></label>
        </p>
        <div><button type="submit" className="btn btn-info btn-circle"><span className="glyphicon glyphicon-send"></span></button></div>
        <div id="token-display">{this.state.token} {this.state.username}</div>
      </form>
    );
  }
});

var Application = React.createClass({
  render: function() {
    var app_choice = "----" + this.props.name;
    return (
       <option value={this.props.client_id}>{app_choice}</option>
    );
  }
});


var ApplicationBox = React.createClass({
  
  render: function() {
    return (
      <div className="tokenBox">
        <h3>Generate Token</h3>
        <hr className="fancy-line"></hr>
        <ApplicationForm url={this.props.url} />
      </div>
    );
  }
});


React.renderComponent(
  <ApplicationBox  url="/access_token"/>,
  document.getElementById('token')
);