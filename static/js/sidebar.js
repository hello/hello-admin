/** @jsx React.DOM */

var SideBar = React.createClass({
   render: function() {
       return (<ListGroup>
           <ListGroupItem bsStyle="info" className="sidebar-group">Home</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/users">&#10149; Users</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/password_reset">&#10149; Password Reset</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/troubleshoot">&#10149; Inactive Devices</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Data</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/timeline">&#10149; Timeline</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/room_conditions">&#10149; Room Conditions</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/battery">&#10149; Pill Status</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/motion">&#10149; Motion</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Logs</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/sense_logs">&#10149; Sense</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/application_logs">&#10149; Application</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/worker_logs">&#10149; Worker</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Data Science</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/label">&#10149; Label</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Keystore</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/key_store">&#10149; Keystore Hints</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/keys">&#10149; Keystore Provision</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Zendesk</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/zendesk_now">&#10149; Zendesk Now</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/zendesk_history">&#10149; Zendesk History</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Operation</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/teams">&#10149; Teams</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/configuration">&#10149; Configuration</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/firmware">&#10149; Firmware</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/pairing">&#10149; Pairing</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/notification">&#10149; Notification</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/alarms">&#10149; Alarms</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Admin only</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/settings">&#10149; Settings</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/orders">&#10149; Orders</ListGroupItem>
       </ListGroup>)
   }
});

React.renderComponent(<SideBar />, document.getElementById('sidebar'));