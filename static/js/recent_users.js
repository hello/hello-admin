/** @jsx React.DOM */

var LinkToUserDashboard = React.createClass({
    populateUserSearchEmail: function(){
        $('#email-search').focus().val(this.props.email);
        $("#email-search-submit").click();
    },
    render: function() {
        return <span className="cursor-custom" onClick={this.populateUserSearchEmail}>{this.props.email}</span>
    }
});
var UserRow = React.createClass({
    componentDidMount: function() {
        $('.tablesorter').tablesorter({
           headers: {
             0: {sorter: true},
             1: {sorter: false}
           }
        });
    },

    render: function() {
        var chosenUserAttr = this.props.userAttr, attrVal;
        if (chosenUserAttr === 'last_modified')
            attrVal = new Date(this.props.user[chosenUserAttr]).toLocaleString();
        else
            attrVal = this.props.user[chosenUserAttr];
        var rowValClasses = React.addons.classSet({
            'col-xs-4': true,
            'col-md-4': true,
            'col-lg-4': true,
            'sid': chosenUserAttr === 'id'
        });
        return (
            <tr>
                <td className="col-xs-2 col-md-2 col-lg-2"><LinkToUserDashboard email={this.props.user.email} /></td>
                <td className={rowValClasses}>{attrVal}</td>
            </tr>
        );
    }
});


var UserTable = React.createClass({
    getInitialState: function() {
        return {
            selectedAttr: "last_modified"
        }
    },
    handleChange: function() {
        this.setState({
            selectedAttr: this.refs.attrSelector.getDOMNode().value
        });
    },
    render: function() {
        var rows = [];
        this.props.users.forEach(function(user) {
            var email_filter = user.email.toLowerCase().indexOf(this.props.filterText.toLowerCase()) === -1;
            if (email_filter) {
                return;
            }
            rows.push(<UserRow user={user} userAttr={this.state.selectedAttr} />);
        }.bind(this));

        return (
            <table id="recent-users-table" className="table table-condensed tablesorter" ref="sortableTable">
                <thead>
                    <tr>
                        <th className="col-xs-2 col-md-2 col-lg-2">Email</th>
                        <th className="col-xs-4 col-md-4 col-lg-4">
                           <select id="recent-users-attr" onChange={this.handleChange} className="form-control" ref="attrSelector">
                              <option value="last_modified">Last Modified</option>
                              <option value="gender">Gender</option>
                              <option value="height">Height</option>
                              <option value="weight">Weight</option>
                              <option value="tz">Timezone</option>
                              <option value="dob">Date of Birth</option>
                              <option value="id">User SID</option>
                           </select>
                        </th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        );
    }
});

var FilterBar = React.createClass({
    handleChange: function() {
        this.props.onUserInput(
            this.refs.filterTextInput.getDOMNode().value
        );
    },
    render: function() {
        return (
            <form>
                <div className="input-group input-group-md">
                    <span className="input-group-addon"><i className="glyphicon glyphicon-filter"></i></span>
                    <div className="icon-addon addon-md">
                        <input
                            id="email-filter"
                            className="form-control col-md-4"
                            type="text"
                            placeholder="filter by email"
                            value={this.props.filterText}
                            ref="filterTextInput"
                            onChange={this.handleChange}
                        />
                        <label for="email-filter" className="glyphicon glyphicon-envelope"></label>
                    </div>
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
            <div className={"fancy-box " + this.props.cls}>
                <FilterBar
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


var RecentUsersBox = React.createClass({
    getInitialState: function() {
        return {
            users: [],
            cls: 'normal'
        };
    },
    loadRecentUsersFromServer: function(){
        $.ajax({
          url: '/api/users/recent',
          dataType: 'json',
          type: 'GET',
          success: function(response) {
            console.log(response);
            this.setState({
                users: response.data
            });
          }.bind(this),
          error: function(xhr, status, err) {
            this.setState({
               users: [],
               cls: 'failure'
            });
            console.error(this.props.url, status, err);
          }.bind(this)
        });
    },
    componentDidMount: function() {
        var thisRecentUsersBox = this,
            refresh_period = 3600*1000;
        thisRecentUsersBox.loadRecentUsersFromServer();
        setInterval(function () {thisRecentUsersBox.loadRecentUsersFromServer();}, refresh_period);
    },
    render: function() {
        return (
          <div>
            <FilterableUserTable cls={this.state.cls} users={this.state.users} />
          </div>
        );
    }
});

React.renderComponent(<RecentUsersBox />, document.getElementById('recent-users'));
