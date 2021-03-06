/** @jsx React.DOM */

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


var ErrorModal = React.createClass({
    render: function() {
        return <Modal animation={true}>
            <div className='modal-body'>
                <div className="modal-title">{this.props.err}</div>
            </div>
            <div className='modal-footer'>
                <Button className="btn-round btn-fade" onClick={this.props.onRequestHide}>X</Button>
            </div>
        </Modal>;
    }
});


var Err = React.createClass({
    getInitialState: function() {
        return {err: ""}
    },
    componentDidMount() {
        $.ajaxSetup({
            global: true,
            dataType: 'json',
            beforeSend: function(jqXHR) {
                var activeNamespaceHeader = $(".namespace-active");
                if (getNamespace() !== activeNamespaceHeader.html()) {
                    activeNamespaceHeader.removeClass("namespace-active");
                    $('.header-namespace>span').filter(function () { return $(this).html() == getNamespace(); }).addClass("namespace-active");
                }
            }.bind(this),
            complete: function(jqXHR) {
                this.setState({err: jqXHR.getResponseHeader("err")});
            }.bind(this)
        });
    },
    render: function() {
        return this.state.err ? <ModalTrigger modal={<ErrorModal err={this.state.err}/>}>
            <span className="cursor-hand">View Error</span>
        </ModalTrigger> : null;
    }
});

if (React.render) {
    React.render(<Err/>, document.getElementById("err"));
}
else {
    React.renderComponent(<Err/>, document.getElementById("err"));
}




if (typeof String.prototype.startsWith != 'function') {
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

function millisecondsToHumanReadableString(milliseconds, withoutSeconds){
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
  if (withoutSeconds) {
    return [year, day, hour, minute].join(" ");
  }
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

function getNamespace() {
    return document.cookie.split(';')
        .map(function(x){return x.trim().split('=');})
        .reduce(function(a,b){a[b[0]]=b[1];return a;},{})
        .namespace;
}