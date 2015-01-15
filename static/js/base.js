/** @jsx React.DOM */

var Alert = ReactBootstrap.Alert;
var Button = ReactBootstrap.Button;
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
};
