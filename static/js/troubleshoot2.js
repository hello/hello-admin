/** @jsx React.DOM */

var today = new Date();
var lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() -7);

var datepickerFormat = d3.time.format("%m/%d/%Y %I:%M:%S %p");
function convertEpochToDate(epoch) {
    return datepickerFormat(new Date(Number(epoch)));
}



var TroubleshootTableHeaders = React.createClass({
    render: function() {
        var headers = [];
        if (this.props.data && this.props.data.length > 0) {
          Object.keys(this.props.data[0]).sort().forEach(function(header){
            if (header === "last_seen_timestamp") {
              header = "inactive_period";
            }
            headers.push(<th className="alert-success">{header}</th>)
          });
        }

        return (<thead><tr>
            {headers}
        </tr></thead>)
    }
});

var TroubleshootTableBody = React.createClass({
    render: function() {
        var rows = [], that = this;
        if (that.props.data && that.props.data.length > 0) {
          that.props.data.forEach(function(device) {
            var cells = [];
            Object.keys(device).sort().forEach(function(k){
              var cell = null;
              if (k === "last_seen_timestamp") {
                cell = millisecondsToHumanReadableString(that.props.parent.state.end - device[k]);
              }
              else if (k == "device_id") {
                cell = <a target="_blank" href={"/users/?device_id=" + device[k]}>{device[k]}</a>;
              }
              cells.push(<td>{cell}</td>);
            });
            rows.push(<tr>{cells}</tr>);
          });
        }
        return (<tbody>
            {rows}
        </tbody>)
    }
});

var Pagination = React.createClass({
    componentDidMount: function() {
        var that = this;
//        $('.prevPage').click(function(){
////          $('#start-time').val(convertEpochToDate(that.props.parent.state.prev));
//          history.go(-2);
//          that.props.parent.handleSubmit();
//        });
        $('.nextPage').click(function(){
          $('#start-time').val(convertEpochToDate(that.props.parent.state.next));
          that.props.parent.handleSubmit();
        });
    },
    render: function() {
        return (
            <Pager>
              <PageItem className="nextPage" next>Next  &rarr;</PageItem>
            </Pager>
        )
    }
});

var TroubleshootMaestro = React.createClass({
    getInitialState: function() {
        return {
            data: [],
            sliderValue: 24,
            end: 0
        }
    },

    handleSubmit: function() {
        var that = this;
        var start = new Date($('#start-time').val()).getTime() || 0;
        var end = new Date($('#end-time').val()).getTime() || 0;
        var thresholdInMilliseconds = Number(that.state.sliderValue) * 3600 * 1000 || "";
        var before = end !== 0 ? end - thresholdInMilliseconds : 0;
        var deviceType = $('#device-type').val() || "";
        var requestData = {after: start, before: before, device_type: deviceType};
        history.pushState({}, '', '/troubleshoot/?start=' + start + '&end=' + end + '&threshold=' + thresholdInMilliseconds + '&type=' + deviceType);
        console.log(requestData);
        $.ajax({
          url: '/api/devices/inactive',
          dataType: 'json',
          contentType: 'application/json',
          type: 'GET',
          data: requestData,
          success: function(response) {
            console.log(response);
            this.setState({data: response.data.content, end: end, prev: response.data.previous, next: response.data.next});
          }.bind(this),
          error: function(e) {
            console.error(e);
          }.bind(this)
        });
    },

    componentDidMount: function() {
        var that = this, sliderVal;
        var startFromURL = getParameterByName('start') || "";
        var endFromURL = getParameterByName('end') || "";
        var typeFromURL = getParameterByName('type') || "";
        var thresholdFromURL = getParameterByName('threshold') || "";
        console.log(startFromURL, endFromURL, typeFromURL, thresholdFromURL);

        if (!startFromURL.isWhiteString()) {
          $('#start-time').val(convertEpochToDate(startFromURL));
        }
        else {
          $('#start-time').val(datepickerFormat(lastWeek));
        }

        if (!endFromURL.isWhiteString()) {
          $('#end-time').val(convertEpochToDate(endFromURL));
        }
        else {
          $('#end-time').val(datepickerFormat(today));
        }

        if (!typeFromURL.isWhiteString()) {
          $('#device-type').val(typeFromURL);
        }

        if (!thresholdFromURL.isWhiteString()) {
          var sliderValuFromURL = Math.round(Number(thresholdFromURL)/3600000);
          that.setState({sliderValue: Number(sliderValuFromURL)});
        }

        $('.slider').slider({value: that.state.sliderValue}).on('slide', function(slideEvt){
          that.setState({sliderValue: slideEvt.value});
        });

        that.handleSubmit();
    },

    render: function() {
        return (<code className="nonscript"><table className="table table-bordered tablesorter">
            <Row className="show-grid">
              <Col xs={3} md={3}><h4>&nbsp;Start Time</h4></Col>
              <Col xs={3} md={3}><h4>&nbsp;End Time</h4></Col>
              <Col xs={3} md={3}><h4>&nbsp;Device Type</h4></Col>
              <Col xs={3} md={3}><h4>Inactive Hours: <span>{this.state.sliderValue}</span></h4></Col>
            </Row>
            0 <input type="text" className="span2 slider" value="" data-slider-min="0" data-slider-max="720" data-slider-step="1" data-slider-id="RC" id="R" data-slider-tooltip="show" data-slider-handle="square"/> 720
            <LongDatetimePicker placeHolder="start time" id="start-time" />
            <LongDatetimePicker placeHolder="end time" id="end-time" />
            <Col xs={3} md={3}>
            <Input type="select" id="device-type">
              <option selected value="sense">Sense</option>
              <option value="pill">Pill</option>
            </Input></Col>
            &nbsp;&nbsp;&nbsp;<Button onClick={this.handleSubmit}><Glyphicon glyph="search"/></Button>
            <Pagination parent={this} />
            <em>You are looking at <strong>{$('#device-type').val()}</strong> devices which were last seen after <strong>{$('#start-time').val()}</strong> and have been inactive for at least <strong>{this.state.sliderValue} hours</strong> by <strong>{$('#end-time').val()}</strong></em><p/>
            <TroubleshootTableHeaders data={this.state.data}/>
            <TroubleshootTableBody parent={this} data={this.state.data}/>
        </table></code>)
    }
});

React.renderComponent(<TroubleshootMaestro />, document.getElementById('troubleshoot'));