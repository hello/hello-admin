/** @jsx React.DOM */

var SideBar = React.createClass({
   render: function() {
       return (<ListGroup>
           <ListGroupItem bsStyle="default" href="/users">Users</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/timeline">Timeline</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/sense">Room Data</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/battery">Pill Status</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/motion">Motion Data</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/debug_log">Sense Logs</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/application_logs">Application Logs</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/label">Label Data</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/alarms">Alarms Admin</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/troubleshoot">Inactive Devices</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/key_store">Keystore Hints</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/keys">Keystore Provision</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/zendesk_now">Zendesk Now</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/zendesk_history">Zendesk History</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/teams">Teams</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/configuration">Configuration</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/firmware">Firmware</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/pairing">Pairing</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/notification">Notification</ListGroupItem>
       </ListGroup>)
   }
});

React.renderComponent(<SideBar />, document.getElementById('sidebar'));