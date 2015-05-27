var Alert = ReactBootstrap.Alert;
var Button = ReactBootstrap.Button;
var ButtonGroup = ReactBootstrap.ButtonGroup;
var Carousel = ReactBootstrap.Carousel;
var CarouselItem = ReactBootstrap.CarouselItem;
var Col = ReactBootstrap.Col;
var DropdownButton = ReactBootstrap.DropdownButton;
var Glyphicon = ReactBootstrap.Glyphicon;
var Grid = ReactBootstrap.Grid;
var Input = ReactBootstrap.Input;
var Label = ReactBootstrap.Label;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var MenuItem = ReactBootstrap.MenuItem;
var Modal = ReactBootstrap.Modal;
var ModalTrigger = ReactBootstrap.ModalTrigger;
var Pager = ReactBootstrap.Pager;
var PageItem = ReactBootstrap.PageItem;
var Row = ReactBootstrap.Row;
var TabbedArea = ReactBootstrap.TabbedArea;
var Table = ReactBootstrap.Table;
var TabPane = ReactBootstrap.TabPane;
var Panel = ReactBootstrap.Panel;
var Well = ReactBootstrap.Well;
var Badge = ReactBootstrap.Badge;
var Popover = ReactBootstrap.Popover;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1]);
}

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.isWhiteString = function() {
    return (this.trim().length === 0);
};

function millisecondsToHumanReadableString(milliseconds){
  var seconds = milliseconds/1000;
  var numyears = Math.floor(seconds / 31536000);
  var numdays = Math.floor((seconds % 31536000) / 86400);
  var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
  var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
  var numseconds = ((((seconds % 31536000) % 86400) % 3600) % 60).toFixed(2);
  var year = numyears > 0 ? numyears + (numyears === 1 ? " year": " years"): "";
  var day = numdays > 0 ? numdays + (numdays === 1 ? " day": " days"): "";
  var hour = numhours > 0 ? numhours + (numhours === 1 ? " hour": " hours"): "";
  var minute = numminutes > 0 ? numminutes + (numminutes === 1 ? " minute": " minutes"): "";
  var second = numseconds > 0 ? numseconds + (numseconds === 1 ? " second": " seconds"): "";
  return [year, day, hour, minute, second].join(" ");
}

function getUTCEpochFromLocalTime(t, needOffset) {
  var d = new Date(t);
  if (needOffset === true){
    return d.getTime()/1000 + d.getTimezoneOffset() * 60;
  }
  else {
    return d.getTime()/1000;
  }
}

function getLocalDateFromUTCEpoch(utcSeconds, needOffset, offsetMilliseconds) {
  var d;
  if (needOffset === true){
    if (offsetMilliseconds) {
      d = new Date(utcSeconds * 1000 + offsetMilliseconds);
    }
    else {
      d = new Date(utcSeconds * 1000 - new Date().getTimezoneOffset() * 60000);
    }
  }
  else {
    d = new Date(utcSeconds*1000);
  }
  return d.toLocaleString() || "";
}

function getFullDateTimeStringFromUTC(utcSeconds) {
    return new Date(utcSeconds*1000).toString();
}

function getCustomDate(dayOffset) {
    var lastNdays = new Date();
    lastNdays.setDate(lastNdays.getDate() + dayOffset);
    var datepickerFormat = d3.time.format("%m/%d/%Y %I:%M:%S %p");
    return datepickerFormat(lastNdays);
}

function isValidRequest(r) {
    return Object.keys(r).every(function(k){return r[k] && !r[k].isWhiteString()})
}

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
}

var $preloader = $('.preloader');

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function luminate(hex, lum) {
	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;
	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}
	return rgb;
}

var SideBar = React.createClass({
   render: function() {
       return (<ListGroup>
           <ListGroupItem bsStyle="info" className="sidebar-group">Home</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/account_profile">&#x029D0; Account Profile</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/recent_accounts">&#x029D0; Recent Accounts</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/users_inspection">&#x029D0; Users Inspection</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/password_reset">&#x029D0; Password Reset</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/troubleshoot">&#x029D0; Inactive Devices</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/active_devices_history">&#x029D0; Devices Count</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/pch_serial_number_check">&#x029D0; Serial Check</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/users">&#x029D0; Users(Deperecated)</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Data</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/timeline">&#x029D0; Timeline</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/room_conditions">&#x029D0; Room Conditions</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/battery">&#x029D0; Pill Status</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/motion">&#x029D0; Motion</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/sense_events">&#x029D0; Sense Events</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/dust_stats">&#x029D0; Dust Statistics</ListGroupItem>

           <ListGroupItem bsStyle="info" className="sidebar-group">Logs</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/sense_logs">&#x029D0; Sense</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/sense_logs_new">&#x029D0; Sense (NEW)</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/onboarding_logs">&#x029D0; Onboarding</ListGroupItem>
           <ListGroupItem bsStyle="default" href="/log_facets">&#x029D0; Facets Breakdown</ListGroupItem>

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
React.render(<SideBar />, document.getElementById('sidebar'));

var Header = React.createClass({
    render: function() {
        var cx = React.addons.classSet;
        var envProd, envDev, localSwitcher=null, prodSwitcher=null, devSwitcher=null;
        var documentURL = document.URL || window.location.href;
        if (documentURL.startsWith("http://localhost")) {
            var envLocal = cx({
                activeEnv: true,
                env: true
            });
            localSwitcher =  <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1">
                <a className={envLocal} href={documentURL}> Local-Env </a>
            </div>;
        }
        else {
            if (!documentURL.startsWith("https://dev")) {
                envProd = cx({
                    activeEnv: true,
                    env: true
                });
                envDev = cx({
                    activeEnv: false,
                    env: true
                });
            }
            else {
                envProd = cx({
                    activeEnv: false,
                    env: true
                });
                envDev = cx({
                    activeEnv: true,
                    env: true
                });
            }
            prodSwitcher = <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1">
                <a className={envProd} href="https://hello-admin.appspot.com/"> Prod-Env </a>
            </div>;
            devSwitcher =  <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1">
                <a className={envDev} href="https://dev-dot-hello-admin.appspot.com/"> Dev-Env </a>
            </div>;
        }
        return (<div>
            {localSwitcher}
            {prodSwitcher}
            {devSwitcher}
        </div>)
    }
});
React.render(<Header/>, document.getElementById("env-switcher"));
