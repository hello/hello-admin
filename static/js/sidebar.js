/** @jsx React.DOM */

var SideBar = React.createClass({
   render: function() {
       return (<ListGroup>
           <ListGroupItem bsStyle="info" className="sidebar-group">Home</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/users">&#x029D0; Users</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/password_reset">&#x029D0; Password Reset</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/troubleshoot">&#x029D0; Inactive Devices</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/active_devices_history">&#x029D0; Devices Count</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Data</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/timeline">&#x029D0; Timeline</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/room_conditions">&#x029D0; Room Conditions</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/battery">&#x029D0; Pill Status</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/motion">&#x029D0; Motion</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/sense_events">&#x029D0; Sense Events</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/dust_stats">&#x029D0; Dust Statistics</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Logs</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/sense_logs">&#x029D0; Sense</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/application_logs">&#x029D0; Application</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/worker_logs">&#x029D0; Workers</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Data Science</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/label">&#x029D0; Label</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Keystore</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/key_store">&#x029D0; Keystore Hints</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/keys">&#x029D0; Keystore Provision</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Zendesk</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/zendesk_now">&#x029D0; Zendesk Now</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/zendesk_history">&#x029D0; Zendesk History</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Operation</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/teams">&#x029D0; Teams</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/configuration">&#x029D0; Configuration</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/firmware">&#x029D0; Firmware</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/pairing">&#x029D0; Pairing</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/notification">&#x029D0; Notification</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/alarms">&#x029D0; Alarms</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Admin only</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/settings">&#x029D0; Settings</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/orders">&#x029D0; Orders</ListGroupItem>
       </ListGroup>)
   }
});

React.renderComponent(<SideBar />, document.getElementById('sidebar'));