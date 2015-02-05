/** @jsx React.DOM */
// The above declaration must remain intact at the top of the script.

var UserSearchTableRow = React.createClass({
    render: function() {
        var rowValClasses = React.addons.classSet({
            'col-xs-3': true,
            'col-md-3': true,
            'col-lg-3': true,
            'sid': this.props.rowAttr === 'id'
        });
        return (
            <tr>
              <td className="col-xs-1 col-md-1 col-lg-1">{this.props.rowAttr}</td>
              <td className={rowValClasses}>{this.props.rowVal}</td>
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
            var row = (value) ? <UserSearchTableRow rowAttr={attribute} rowVal={value}/> : null;

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

        if (this.props.devices.length > 0) {
          this.props.devices.forEach(function(device){
            var debugLogLink = device.type === "PILL" ? <Label bsStyle= {device.state === "NORMAL" ? "success": "danger"}>{device.device_id}</Label>:
                <a href={"/debug_log/?devices=" + device.device_id} target="_blank" title="Go to debug log">
                  <Label bsStyle= {device.state === "NORMAL" ? "success": "danger"}>{device.device_id}</Label>
                </a>;
            var deviceLabel = [
                <span>{device.type}</span>, <br/>,
                debugLogLink, <br/>,
                <a href={"/key_store/?device=" + device.device_id + "&type=" + device.type.toLowerCase()} target="_blank">view KeyStore</a>
            ];
            var deviceDetail = [
                <span>last seen: {new Date(device.last_updated).toLocaleString()}</span>, <br/>,
                <span>state: {device.state}</span>, <br/>,
                <span>firmware version: {device.firmware_version}</span>, <br/>
            ];
            tableRows.push(<UserSearchTableRow rowAttr={deviceLabel} rowVal={deviceDetail} />);
          })
        }

        if(this.props.zenTickets.length > 0 ) {
            var numberOfZenTickets = this.props.zenTickets.length;
            var lastTicket = this.props.zenTickets.last();
            var lastTicketCreated = lastTicket.created_at;
            var lastTicketSubject = lastTicket.subject;
            var lastTicketURL = "https://helloinc.zendesk.com/agent/tickets/" + lastTicket.id;
            var lastTicketLink = <a target="_blank" href={lastTicketURL}>{lastTicketURL}</a>
            tableRows.push(<UserSearchTableRow rowAttr="# Zen tickets" rowVal={numberOfZenTickets} />);
            tableRows.push(<UserSearchTableRow rowAttr="last ticket created" rowVal={lastTicketCreated} />);
            tableRows.push(<UserSearchTableRow rowAttr="last ticket subject" rowVal={lastTicketSubject} />);
            tableRows.push(<UserSearchTableRow rowAttr="last ticket url" rowVal={lastTicketLink} />);
        }

        var tableClasses = "table table-condensed table-responsive " + this.props.stage;
        var tableHeaders = <tr>
                             <th className="col-xs-1 col-md-1 col-lg-1">Attribute</th>
                             <th className="col-xs-3 col-md-3 col-lg-3">Value</th>
                           </tr>;
        var userSearchResult = this.props.users != [] && !$.isEmptyObject(this.props.users) ?
                               <table className={tableClasses}>
                                  <thead>{tableHeaders}</thead>
                                  <tbody>{tableRows}</tbody>
                               </table>
                               : <div>{this.props.searchAlert}</div>;
        return (userSearchResult);
    }
});


var UserSearchCanvas = React.createClass({
    getInitialState: function() {
        return {
            users: {},
            searchAlert: "\u2603",
            zenTickets: [],
            devices: []
        }
    },
    handleSubmit: function(e) {
        console.log('submitted');
        if (e) {
            e.preventDefault();
        }
        var email = this.refs.email.getDOMNode().value.trim().toLowerCase();
        if (!email) {
          return;
        }
        history.pushState({}, '', '/users/?email=' + email);
         $.ajax({
          url: "/api/devices",
          dataType: 'json',
          type: 'GET',
          data: {email: email},
          success: function(response) {
            if (response.error) {
                this.setState({
                    devices: []
                });
            }
            else {
                this.setState({devices: response.data});
            }
          }.bind(this),
          error: function(xhr, status, err) {
            this.setState({
                devices: []
            });
            console.error(this.props.url, status, err);
          }.bind(this)
        });

        $.ajax({
          url: "/api/user",
          dataType: 'json',
          type: 'GET',
          data: {email: email},
          success: function(response) {
            if (response.error) {
                this.setState({
                    users: {},
                    searchAlert: "☹ " + response.error
                });
            }
            else {
                this.setState({users: response.data});
            }
          }.bind(this),
          error: function(xhr, status, err) {
            this.setState({
                users: {},
                searchAlert: "☹ Query failed"
            });
            console.error(this.props.url, status, err);
          }.bind(this)
        });

        $.ajax({
          url: "/api/zendesk",
          dataType: 'json',
          type: 'GET',
          data: {email: email},
          success: function(response) {
            if (response.error) {
                this.setState({
                    zenTickets: []
                });
            }
            else {
                this.setState({zenTickets: response.data});
            }
          }.bind(this),
          error: function(xhr, status, err) {
            this.setState({
                zenTickets: []
            });
            console.error(this.props.url, status, err);
          }.bind(this)
        });

        return false;
    },

    componentDidMount: function(e) {
        var email_from_url = getParameterByName('email');
        if (email_from_url) {
            this.refs.email.getDOMNode().value = email_from_url;
            this.handleSubmit(e);
        }
    },

    render: function() {
        return (<div className="fancy-box">
          <form onSubmit={this.handleSubmit}>
            <div className="input-group input-group-md">
              <span className="input-group-addon"><i className="glyphicon glyphicon-tasks"></i></span>
              <div className="icon-addon addon-md">
                <input
                    id="email-search"
                    ref="email"
                    className="form-control"
                    type="text"
                    placeholder="query by EXACT email or click on a recent user"
                />
                <label for="email-search" className="glyphicon glyphicon-envelope"></label>
              </div>
              <span className="input-group-btn">
                <button id="email-search-submit" className="btn btn-default form-control" type="submit">
                    <span className="glyphicon glyphicon-search"/>
                </button>
              </span>
            </div>
          </form>
          <UserSearchTable users={this.state.users} zenTickets={this.state.zenTickets} devices={this.state.devices} searchAlert={this.state.searchAlert} />
        </div>);
    }
});

React.renderComponent(<UserSearchCanvas />, document.getElementById('user-search'));
