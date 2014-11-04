/** @jsx React.DOM */
// The above declaration must remain intact at the top of the script.


var AccountForm = React.createClass({
  getInitialState : function() {
    return {'success' : false, 'failure' : false}
  },
  
  fade : function() {
    this.setState({'failure' : false, 'success': false})
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var name = this.refs.name.getDOMNode().value.trim();
    var email = this.refs.email.getDOMNode().value.trim();
    var password = this.refs.password.getDOMNode().value.trim();
    var gender = this.refs.gender.getDOMNode().value.trim();
    var height = this.refs.height.getDOMNode().value.trim();
    var weight = this.refs.weight.getDOMNode().value.trim();
    var tz = this.refs.tz.getDOMNode().value.trim();
    
    
    if (!name || !email || !password) {
      alert("Missing info");
      return;
    }

    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: {name:name,email:email,password:password,gender:gender,height:height,weight:weight,tz:tz},
      success: function(data) {
        this.refs.name.getDOMNode().value = '';
        this.refs.email.getDOMNode().value = '';
        this.refs.password.getDOMNode().value = '';
        this.setState({'success' : true})
        setTimeout(this.fade, 2000);

      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
        this.setState({'failure' : true});
        setTimeout(this.fade, 2000);
      }.bind(this)
    });

    return;
  },


  render: function() {

    var cx = React.addons.classSet;
    var classes = cx({
      'fancy-box': true,
      'success': this.state.success,
      'failure' : this.state.failure,
      'normal' : !this.state.success && !this.state.failure
    });
  
    return (

      <form className={classes} onSubmit={this.handleSubmit}>
        <p className="icon-addon addon-md">
          <input id="account-name" type="text" placeholder="firstname lastname" ref="name" className="form-control"/>
          <label for="account-name" className="glyphicon glyphicon-user"></label>
        </p>
        <p className="icon-addon addon-md">
          <input id="account-email" type="text" placeholder="someone@sayhello.com" ref="email" className="form-control"/>
          <label for="account-email" className="glyphicon glyphicon-envelope"></label>
        </p>
        <p className="icon-addon addon-md">
          <input id="account-pw" type="password" placeholder="super secure"  ref="password" className="form-control"/>
          <label for="account-pw" className="glyphicon glyphicon-lock"></label>
        </p>
        <p className="icon-addon addon-md">
          <select id="account-gender" className="form-control" ref="gender">
              <option value="FEMALE">&nbsp; &nbsp; &nbsp; female</option>
              <option value="MALE">&nbsp; &nbsp; &nbsp; male</option>
              <option value="OTHER">&nbsp; &nbsp; &nbsp; other</option>
          </select>
          <label for="account-gender" className="glyphicon glyphicon-cog"></label>
        </p>
    
        <input type="hidden" value="0" ref="height"/>
        <input type="hidden" value="0" ref="weight"/>
    
        <p className="icon-addon addon-md">
          <select id="account-tz" className="form-control" ref="tz">
            <option value="-252000">&nbsp; &nbsp; &nbsp; America/Los_Angeles</option>
          </select>
          <label for="account-tz" className="glyphicon glyphicon-globe"></label>
        </p>
    
        <p>
          <div><button type="submit" className="btn btn-info btn-circle"><span className="glyphicon glyphicon-plus"></span></button></div>
          <div>{this.state.success}</div>
        </p>
        
      </form>
    );
  }
});

var AccountBox = React.createClass({
  render: function() {
    return (
      <div>
        <AccountForm onCommentSubmit={this.handleCommentSubmit} url={this.props.url} />
      </div>
    );
  }
});


React.renderComponent(
  <AccountBox  url="/create_account"/>,
  document.getElementById('account')
);