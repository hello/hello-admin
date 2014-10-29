/** @jsx React.DOM */
// The above declaration must remain intact at the top of the script.

var UserSearchTableRow = React.createClass({
    render: function() {
        return (
            <tr>
              <td>{this.props.rowAttr}</td>
              <td>{this.props.rowVal}</td>
            </tr>
        );

    }
});


var UserSearchTable = React.createClass({
    render: function() {
        var tableRows = [];
        $.each(this.props.users, function(attribute, value){
            if (attribute === 'dob' || attribute === 'last_modified') {
                value = new Date(value).toLocaleString();
            }
            var row = <UserSearchTableRow rowAttr={attribute} rowVal={value} />;

            // Table rows start with email, name, id
            if (attribute === 'id') {
                tableRows.unshift(row);
            }
            else if (attribute === 'name') {
                tableRows.unshift(row);
            }
            else if (attribute === 'email') {
                tableRows.unshift(row);
            }
            else {
                tableRows.push(row);
            }
        });
        var tableClasses = "table table-condensed table-responsive " + this.props.stage;
        var tableHeaders = $.isEmptyObject(this.props.users) ?
                           null: <tr><th>Attribute</th><th>Value</th></tr>;
        return (
          <table className={tableClasses}>
              <thead>{tableHeaders}</thead>
              <tbody>{tableRows}</tbody>
          </table>
        );
    }
});


var UserSearchCanvas = React.createClass({
    getInitialState: function() {
        return {
            users: []
        }
    },
    handleSubmit: function(e) {
        console.log('submitted');
        e.preventDefault();
        var email = this.refs.email.getDOMNode().value.trim().toLowerCase();
        if (!email) {
          return;
        }

        $.ajax({
          url: "/api/user",
          dataType: 'json',
          type: 'GET',
          data: {email: email},
          success: function(response) {
            if (response.error) {
                console.log('search failed');
            }
            else {
                this.setState({users: response.data});
            }
          }.bind(this),
          error: function(xhr, status, err) {
            this.setState({users: []});
            console.error(this.props.url, status, err);
          }.bind(this)
        });
        return false;
    },

    render: function() {
        return (<div>
             <form onSubmit={this.handleSubmit}>
            <div className="input-group input-group-md">
              <span className="input-group-addon"><i className="glyphicon glyphicon-search"></i></span>
              <div className="icon-addon addon-md">
                <input
                    id="email-search"
                    ref="email"
                    className="form-control col-md-5"
                    type="text"
                    placeholder="query by email"
                />
                <label for="email-search" className="glyphicon glyphicon-envelope"></label>
              </div>
              <span className="input-group-btn">
                <button className="btn btn-default form-control" type="submit">Go!</button>
              </span>
            </div>
          </form>
            <UserSearchTable users = {this.state.users} />
        </div>);
    }
});

React.renderComponent(<UserSearchCanvas />, document.getElementById('user-search'));