/** @jsx React.DOM */

var SideBar = React.createClass({
   render: function() {
       return (

       <ListGroup>
           <ListGroupItem href="/users">Users</ListGroupItem>
           <ListGroupItem href="/zendesk_now">Zendesk Now</ListGroupItem>
           <ListGroupItem href="/zendesk_history">Zendesk History</ListGroupItem>
           <ListGroupItem href="/troubleshoot">Inactive Devices</ListGroupItem>
           <ListGroupItem href="/key_store">Keystore Hints</ListGroupItem>
           <ListGroupItem href="/keys">Keystore Provision</ListGroupItem>
           <ListGroupItem href="/timeline">Timeline</ListGroupItem>
           <ListGroupItem href="/sense">Room Data</ListGroupItem>
           <ListGroupItem href="/battery">Pill Status</ListGroupItem>
           <ListGroupItem href="/motion">Motion Data</ListGroupItem>
           <ListGroupItem href="/alarms">Alarms Admin</ListGroupItem>
           <ListGroupItem href="/debug_log">Sense Logs</ListGroupItem>
           <ListGroupItem href="/application_logs">Application Logs</ListGroupItem>
           <ListGroupItem href="/teams">Teams</ListGroupItem>
           <ListGroupItem href="/configuration">Configuration</ListGroupItem>
           <ListGroupItem href="/firmware">Firmware</ListGroupItem>
           <ListGroupItem href="/pairing">Pairing</ListGroupItem>
           <ListGroupItem href="/notification">Notification</ListGroupItem>
           <ListGroupItem href="/label">Label</ListGroupItem>
       </ListGroup>
       )
   }
});

React.renderComponent(<SideBar />, document.getElementById('sidebar'));