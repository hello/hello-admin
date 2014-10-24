/** @jsx React.DOM */

var UserPlatformRow = React.createClass({
    render: function() {
        return (<tr><th>{this.props.platform}</th></tr>);
    }
});

var UserRow = React.createClass({
    render: function() {
        var name = !this.props.user.internal ?
            this.props.user.name :
            <span style={{color: 'orange'}}>
                {this.props.user.name}
            </span>;
        return (
            <tr>
            	<td>{this.props.user.id}</td>
                <td>{name}</td>
                <td>{this.props.user.email}</td>
                <td>{this.props.user.gender}</td>
                <td>{this.props.user.dob}</td>
                <td>{this.props.user.last_modified}</td>
            </tr>
        );
    }
});

var UserTable = React.createClass({
    render: function() {
        console.log(this.props);
        var rows = [];
        var lastPlatform = null;
        this.props.users.forEach(function(user) {
        	// var name_filter = user.name.indexOf(this.props.filterText) === -1 || (!user.internal && this.props.internalOnly);
        	var email_filter = user.email.indexOf(this.props.filterText) === -1 || (!user.internal && this.props.internalOnly); 
            if (email_filter) {
                return;
            }
            if (user.platform !== lastPlatform) {
                rows.push(<UserPlatformRow platform={user.platform} key={user.platform} />);
            }
            rows.push(<UserRow user={user} key={user.email} />);
            lastPlatform = user.platform;
        }.bind(this));
        return (
            <table className="table table-condensed">
                <thead>
                    <tr>
                    	<th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Gender</th>
                        <th>DOB</th>
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
            this.refs.filterTextInput.getDOMNode().value,
            this.refs.internalOnlyInput.getDOMNode().checked
        );
    },
    render: function() {
        return (
            <form>
            	<div className="col-md-4">
                <input
                	className="form-control"
                    type="text"
                    placeholder="Search by name"
                    value={this.props.filterText}
                    ref="filterTextInput"
                    onChange={this.handleChange}
                />
                </div>
                <p>
                    <input
                        type="checkbox"
                        value={this.props.internalOnly}
                        ref="internalOnlyInput"
                        onChange={this.handleChange}
                    />
                    Only show internal users
                </p>
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


var raw_users = [
	{email: "iOS.Tester@sayhello.com", name: "alpha", gender: "male", height:0, weight:0, tz:-252000, last_modified:1413938179687, dob:1413938629486, id:"10674cda456f9a59dbc11fb9e33995db", internal: true, platform: 'iOS'},
	{email: "iOS.Customer@buy.net", name: "alumina", gender: "female", height:0, weight:0, tz:-252000, last_modified:1413938049875, dob:1413938623456, id:"10674cda456f9a59dbc11fb9e33995da", internal: false, platform: 'iOS'},
	{email: "iOS.Customer@buy.net", name: "beta", gender: "male", height:0, weight:0, tz:-252000, last_modified:1413938175345, dob:1413938624234, id:"10674cda456f9a59dbc11fb9e33995dz", internal: false, platform: 'iOS'},
	{email: "Android.Tester@sayhello.com", name: "gamma", gender: "male", height:0, weight:0, tz:-252000, last_modified:14139381796555, dob:141393862444, id:"10674cda456f9a59dbc11fb9e33995df", internal: true, platform: 'Android'},
	{email: "Android.Customer@buy.net", name: "delta", gender: "male", height:0, weight:0, tz:-252000, last_modified:1413938179666, dob:1413938629334, id:"10674cda456f9a59dbc11fb9e33995dc", internal: false, platform: 'Android'}
];

var USERS = _.map(raw_users, function(u){ u.dob = String(new Date(u.dob)); u.last_modified = String(new Date(u.last_modified)); return u; });

var SearchBox = React.createClass({
  render: function() {
    return (
      <div className="searchBox">
        <h2>Search</h2>
         <FilterableUserTable users={USERS} />
      </div>
    );
  }
});

React.renderComponent(<SearchBox  url="/search"/>, document.getElementById('search'));