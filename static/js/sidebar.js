/** @jsx React.DOM */

var SideBar = React.createClass({
   render: function() {
       return (<ListGroup>
           <ListGroupItem bsStyle="info" className="sidebar-group">Home</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/users">&#10704; Users</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/password_reset">&#10704; Password Reset</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/troubleshoot">&#10704; Inactive Devices</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/active_devices_history">&#10704; Devices Count</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Data</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/timeline">&#10704; Timeline</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/room_conditions">&#10704; Room Conditions</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/battery">&#10704; Pill Status</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/motion">&#10704; Motion</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Logs</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/sense_logs">&#10704; Sense</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/application_logs">&#10704; Application</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/worker_logs">&#10704; Workers</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Data Science</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/label">&#10704; Label</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Keystore</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/key_store">&#10704; Keystore Hints</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/keys">&#10704; Keystore Provision</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Zendesk</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/zendesk_now">&#10704; Zendesk Now</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/zendesk_history">&#10704; Zendesk History</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Operation</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/teams">&#10704; Teams</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/configuration">&#10704; Configuration</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/firmware">&#10704; Firmware</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/pairing">&#10704; Pairing</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/notification">&#10704; Notification</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/alarms">&#10704; Alarms</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Admin only</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/settings">&#10704; Settings</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/orders">&#10704; Orders</ListGroupItem>
       </ListGroup>)
   }
});

React.renderComponent(<SideBar />, document.getElementById('sidebar'));