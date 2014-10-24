/** @jsx React.DOM */
// The above declaration must remain intact at the top of the script.

var UserProfileRow = React.createClass({
    render: function() {
        return (
            <tr>
              <td>{this.props.rowAttr}</td>
              <td>{this.props.rowVal}</td>    
            </tr>
        );
    }
});

var UserProfileTable = React.createClass({
    render: function() {
        var tableRows = [];
        $.each(this.props.profileData, function(attribute, value){
            if (attribute === 'dob' || attribute === 'last_modified') {
                value = new Date(value).toLocaleString();
            }
            var row = <UserProfileRow rowAttr={attribute} rowVal={value} />;

            // Table rows start with email, name, id
            if (attribute==='id')
                tableRows.unshift(row); 
            else if (attribute==='name')
                tableRows.unshift(row); 
            else if (attribute==='email')
                tableRows.unshift(row); 
            else
                tableRows.push(row);
        });
        
        var tableClasses = "table table-striped table-condensed " + this.props.stage;
        var tableHeaders = $.isEmptyObject(this.props.profileData) ? 
            null: <tr><th>Attribute</th><th>Value</th></tr>;
        return (
            <table className={tableClasses}>
              <thead>{tableHeaders}</thead>
              <tbody>{tableRows}</tbody>
            </table>
        );
    }
});

var UserSearchForm = React.createClass({
    getInitialState: function() {
        return {
            success : false, 
            failure: false, 
            result : {},
            alert: ''
        }
    },
    fade : function() {
        this.setState({failure : false, success: false});
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var email = this.refs.email.getDOMNode().value.trim().toLowerCase();
        if (!email) {
          return;
        }
        
        $.ajax({
          url: this.props.url,
          dataType: 'json',
          type: 'GET',
          data: {email: email},
          success: function(response) {
            if (response.error) {
                this.setState({alert: response.error, failure: true});
            }
            else {
                this.setState({result: response.user_profile, success : true});
            }
            setTimeout(this.fade, 2000);
          }.bind(this),
          error: function(xhr, status, err) {
            this.setState({
                alert: 'failed, check credentials', 
                failure: true,
                result: {}
            })
            setTimeout(this.fade, 2000);
            console.error(this.props.url, status, err);
          }.bind(this)
        });
        return;
    },

    render: function() {

        var cx = React.addons.classSet;
        var stages = cx({
          'success': this.state.success,
          'failure' : this.state.failure,
          'normal' : !this.state.success && !this.state.failure
        });
        var userSearchAlert = !this.state.success && this.state.alert ? 
            <div className="alert alert-danger">{this.state.alert}</div>: null;
        var userProfileTable = !this.state.success && userSearchAlert ?
            null: <UserProfileTable stage={stages} profileData={this.state.result}/>;
        return (<div>
            <form className="lookup form-inline" onSubmit={this.handleSubmit}>
                <input id="user-input" type="text" placeholder="Email" ref="email" className="form-control"/>
                <button type="submit" className="btn btn-default form-control"><span className="glyphicon glyphicon-search query"></span></button>
              {userProfileTable}
            </form>
            {userSearchAlert}
        </div>);
    }
});

var UserDashboardContainer = React.createClass({
  render: function() {
    return (
        <UserSearchForm url={this.props.url} />
    );
  }
});


React.renderComponent(
  <UserDashboardContainer url="/api/fetch_user" />,
  document.getElementById('container')
);
