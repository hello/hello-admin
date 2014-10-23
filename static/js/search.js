/** @jsx React.DOM */
// The above declaration must remain intact at the top of the script.

var UserRow = React.createClass({
    render: function() {
        console.log(this.props.rowAttr, this.props.rowVal);
        return (<tr>
                  <td>{this.props.rowAttr}</td>
                  <td>{this.props.rowVal}</td>    
                </tr>)
    }

});


var UserProfileTable = React.createClass({
    render: function() {
        var rows = [];
        console.log(this.props.profileData)
        $.each(this.props.profileData, function(attribute, value){
            rows.push(<UserRow rowAttr={attribute} rowVal={value} />)
        });
        var attrList = Object.keys(this.props.profileData);
        console.log(attrList);
        return (
            <div className="userProfile">
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {rows} 
              </tbody>
            </table>
            </div>
        );
    }
});

var SearchForm = React.createClass({
    getInitialState: function() {
        return {
            data: [{name: 'Loading...', value: ''}], 
            email: '', 
            success : false, 
            failure: false, 
            result : {}
        }
    },
    fade : function() {
        this.setState({'failure' : false, 'success': false});
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var email = this.refs.email.getDOMNode().value.trim();
        if (!email) {
          return;
        }
        console.log(email);
        var stuff = {email: email}
        this.setState(stuff)
        
        $.ajax({
          url: this.props.url,
          dataType: 'json',
          type: 'GET',
          data: stuff,
          success: function(data) {
            console.log(data);
            this.setState({result: data.user_profile, success : true});
            setTimeout(this.fade, 2000);
          }.bind(this),
          error: function(xhr, status, err) {
            this.setState({
                result: 'failed, check credentials', 
                failure: true
            })
            setTimeout(this.fade, 2000);
            console.error(this.props.url, status, err);
          }.bind(this)
        });
        this.refs.email.getDOMNode().value = '';
        return;
    },

    render: function() {

        var cx = React.addons.classSet;
        var classes = cx({
          'result': true,
          'form-inline': true,
          'success': this.state.success,
          'failure' : this.state.failure,
          'normal' : !this.state.success && !this.state.failure
        });

        return (
          <form className={classes} onSubmit={this.handleSubmit}>
            <input type="text" placeholder="accepting email" ref="email" className="input-box form-control"/>
            <input type="submit" value="Query" className="btn btn-info"/>
            <UserProfileTable profileData={this.state.result}/>
          </form>
        );
    }
});



var SearchBox = React.createClass({
  render: function() {
    return (
      <div className="resultBox">
        <h2>Search</h2>
        <SearchForm url={this.props.url} />
      </div>
    );
  }
});


React.renderComponent(
  <SearchBox url="/api/fetch_user" />,
  document.getElementById('search')
);

