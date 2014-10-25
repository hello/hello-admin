/** @jsx React.DOM */

var LinkToUserDashboard = React.createClass({
    render: function() {
        var userDashboardLink = "/user_dashboard/?email=" + this.props.email
        return <a href={userDashboardLink} target="_blank"> {this.props.email}</a>
    }
});
var UserRow = React.createClass({
    render: function() {
        return (
            <tr>
                <td><LinkToUserDashboard email={this.props.user.email} /></td>
                <td>{new Date(this.props.user.last_modified).toLocaleString()}</td>
            </tr>
        );
    }
});

var UserTable = React.createClass({
    render: function() {
        console.log(this.props);
        var rows = [];
        var lastPlatform = null;
        console.log(this.props.users);
        this.props.users.forEach(function(user) {
            var email_filter = user.email.toLowerCase().indexOf(this.props.filterText.toLowerCase()) === -1; 
            if (email_filter) {
                return;
            }http://localhost:9123/www.google.com
            rows.push(<UserRow user={user} key={user.email} />);
        }.bind(this));
        return (
            <table id="recent-users-table" className="table table-condensed">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Last Modified</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        );
    }
});

var SearchBar = React.createClass({
    handleChange: function() {
        this.props.onUserInput(
            this.refs.filterTextInput.getDOMNode().value
        );
    },
    render: function() {
        return (
            <form>
            	<div className="col-md-4">
                <input
                	className="form-control"
                    type="text"
                    placeholder="Filter by email"
                    value={this.props.filterText}
                    ref="filterTextInput"
                    onChange={this.handleChange}
                />
                </div>
            </form>
        );
    }
});

var FilterableUserTable = React.createClass({
    getInitialState: function() {
        return {
            filterText: '',
            internalOnly: false
        };
    },
    
    handleUserInput: function(filterText, internalOnly) {
        this.setState({
            filterText: filterText,
            internalOnly: internalOnly
        });
    },
    
    render: function() {
        return (
            <div className="searchForm">
                <SearchBar
                    filterText={this.state.filterText}
                    internalOnly={this.state.internalOnly}
                    onUserInput={this.handleUserInput}
                />
                <UserTable
                    users={this.props.users}
                    filterText={this.state.filterText}
                    internalOnly={this.state.internalOnly}
                />
            </div>
        );
    }
});


var SearchBox = React.createClass({
    getInitialState: function() {
        return {
            users: []
        };
    },
    componentDidMount: function(e){
        console.log('how');
        $.ajax({
          url: 'api/fetch_recent_users',
          dataType: 'json',
          type: 'GET',
          success: function(response) {
            this.setState({users: response.data});
          }.bind(this),
          error: function(xhr, status, err) {
            this.setState({
               users: []
            })
            console.error(this.props.url, status, err);
          }.bind(this)
        });
    },
    render: function() {
        console.log('POSTLOG');
        console.log(this.state.users);
        return (
          <div className="searchBox">
            <h2>Recent users</h2>
             <FilterableUserTable users={this.state.users} />
          </div>
        );
    }
});

React.renderComponent(<SearchBox  url="/search"/>, document.getElementById('search'));