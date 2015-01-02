/** @jsx React.DOM */

var today = new Date();
var lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() -7);

var datepickerFormat = d3.time.format("%m/%d/%Y %I:%M:%S %p");
var todayInDatepickerFormat = datepickerFormat(today);
var lastWeekInDatepickerFormat = datepickerFormat(lastWeek);

var TroubleshootTableHeaders = React.createClass({
    render: function() {
        var headers = [];
        if (this.props.data.length > 0) {
          Object.keys(this.props.data[0]).sort().forEach(function(header){
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
        var rows = [];
        if (this.props.data.length > 0) {
          this.props.data.forEach(function(device) {
            var cells = [];
            Object.keys(device).sort().forEach(function(k){
              var cell = null;
              if (k == "inactive_period") {
                cell = millisecondsToHumanReadableString(device[k]);
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
    updatePage: function(newPage) {
        this.props.parent.setState({currentPage: newPage});
        this.props.parent.handleSubmit();
    },
    componentDidMount: function() {
        var that = this;
        $('.nextPage').click(function(){
          if (that.props.totalPages >= that.props.currentPage + 1) {
            that.updatePage(that.props.currentPage + 1);
          }
        });
        $('.prevPage').click(function(){
          if (that.props.currentPage > 1) {
            that.updatePage(that.props.currentPage - 1);
          }
        });
    },
    render: function() {
        var menuItems = [];
        for (var j = 1; j<=this.props.totalPages; j++){
          menuItems.push(<MenuItem className="changePage" eventKey={j}>{j}</MenuItem>);
        }
        return (
            <Pager>
              <PageItem className="prevPage" previous>&larr; Previous Page</PageItem>
              <DropdownButton title={"Page " + this.props.currentPage + "/" + this.props.totalPages}>
                {menuItems}
              </DropdownButton>
              <PageItem className="nextPage" next>Next Page &rarr;</PageItem>
            </Pager>
        )
    }
});

var TroubleshootMaestro = React.createClass({
    getInitialState: function() {
        return {
            data: [],
            totalPages: 1,
            currentPage: Number(getParameterByName('page')) || 1,
            sliderValue: 24
        }
    },

    handleSubmit: function() {
        var that = this;
        var start = new Date($('#start-time').val()).getTime();
        var since = new Date($('#since-time').val()).getTime();
        var thresholdInMilliseconds = Number(that.state.sliderValue) * 3600 * 1000;
        var page = that.state.currentPage;
        var requestData = {start: start, since: since, threshold: thresholdInMilliseconds, page: page};
        $.ajax({
          url: '/api/troubleshoot',
          dataType: 'json',
          contentType: 'application/json',
          type: 'GET',
          data: requestData,
          success: function(response) {
            this.setState({data: response.data.content, totalPages: response.data.total_pages});
            $('.changePage').click(function(){
              that.setState({currentPage: Number($(this).children('a').text())});
              that.handleSubmit();
            });
          }.bind(this),
          error: function(e) {
            console.error(e);
          }.bind(this)
        });
    },

    componentDidMount: function() {
        var that = this;
        $('.slider').slider({value: that.state.sliderValue}).on('slide', function(slideEvt){
          that.setState({sliderValue: slideEvt.value});
        });
        that.handleSubmit();
//        $('.tablesorter').tablesorter();
//            sortList: [[2, 1]] // by default sort the 2nd column (days since last seen) DESC
//        });
    },

    render: function() {
        history.pushState({}, '', '/troubleshoot/?page=' + this.state.currentPage);
        return (<code className="nonscript"><table className="table table-bordered tablesorter">
            <Row className="show-grid">
              <Col xs={3} md={3}><h4>&nbsp;Start Time</h4></Col>
              <Col xs={3} md={3}><h4>&nbsp;End Time</h4></Col>
              <Col xs={3} md={3}><h4>Inactive Hours: <span>{this.state.sliderValue}</span></h4></Col>
            </Row>
            0 <input type="text" className="span2 slider" value="" data-slider-min="0" data-slider-max="720" data-slider-step="1" data-slider-id="RC" id="R" data-slider-tooltip="show" data-slider-handle="square"/> 720
            <LongDatetimePicker placeHolder="start time" id="start-time" defaultDate={lastWeekInDatepickerFormat}/>
            <LongDatetimePicker placeHolder="since time" id="since-time" defaultDate={todayInDatepickerFormat}/>
            &nbsp;&nbsp;&nbsp;<Button onClick={this.handleSubmit}><Glyphicon glyph="search"/></Button>
            <Pagination parent={this} currentPage={this.state.currentPage} totalPages={this.state.totalPages}/>
            <em><strong>You are looking at devices which were last seen after {$('#start-time').val()} and have been inactive for at least {this.state.sliderValue} hours by {$('#since-time').val()}</strong></em><p/>
            <TroubleshootTableHeaders data={this.state.data}/>
            <TroubleshootTableBody data={this.state.data}/>
        </table></code>)
    }
});

React.renderComponent(<TroubleshootMaestro />, document.getElementById('troubleshoot'));