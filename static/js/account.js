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
      alert("Missing info")
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
        this.setState({'failure' : true})
        setTimeout(this.fade, 2000);
      }.bind(this)
    });


    return;
  },


  render: function() {

    var cx = React.addons.classSet;
    var classes = cx({
      'accountForm': true,
      'success': this.state.success,
      'failure' : this.state.failure,
      'normal' : !this.state.success && !this.state.failure
    });
  
    return (

      <form className={classes} onSubmit={this.handleSubmit}>
        <p>
          <input type="text" placeholder="firstname lastname" ref="name"/>
        </p>
        <p>
          <input type="text" placeholder="someone@sayhello.com" ref="email"/>
        </p>
        <p>
          <input type="password" placeholder="super secure"  ref="password"/>
        </p>
        <p>
          <select ref="gender">
              <option value="FEMALE">female</option>
              <option value="MALE">male</option>
              <option value="OTHER">other</option>
          </select>
        </p>
    
        <input type="hidden" value="0" ref="height"/>
        <input type="hidden" value="0" ref="weight"/>
    
        <p>
          <select ref="tz">
            <option value="-252000">America/Los_Angeles</option>
          </select>
        </p>
    
        <p>
          <input type="submit" value="Create account" /> {this.state.success}
        </p>
        
      </form>
    );
  }
});

var AccountBox = React.createClass({
  render: function() {
    return (
      <div className="accountBox">
        <h2>Create account</h2>
        <AccountForm onCommentSubmit={this.handleCommentSubmit} url={this.props.url} />
      </div>
    );
  }
});


React.renderComponent(
  <AccountBox  url="/create_account"/>,
  document.getElementById('account')
);