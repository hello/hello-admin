/** @jsx React.DOM */

var helloDateFormat = d3.time.format("%m/%d/%Y");
var zendeskDateFormat = d3.time.format("%Y-%m-%d");
var today = helloDateFormat(new Date());

function reformatDate(d) {
    console.log(d);
    return zendeskDateFormat(helloDateFormat.parse(d));
}

var ZendeskCanvas = React.createClass({
   componentDidMount: function() {
       console.log('sketch me up!')
   },
   render: function() {
       var that = this;
       nv.addGraph(function() {
        var statusChart = nv.models.multiBarChart()
                        .transitionDuration(350)
                          .reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
                          .rotateLabels(0)      //Angle to rotate x-axis labels.
                          .showControls(true)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
                          .groupSpacing(0.1)    //Distance between each group of bars.
                        ;

        //Format x-axis labels with custom function.
        statusChart.xAxis
            .tickFormat(function(d) {
//              return d3.time.format('%x')(new Date(d))
                return d
        });

        statusChart.yAxis
            .tickFormat(d3.format(',.2f'));

        d3.select('#status-breakdown')
          .datum(that.props.status)
          .call(statusChart);

        nv.utils.windowResize(statusChart.update);

        return statusChart;
        });

        nv.addGraph(function() {
        var recipientChart = nv.models.multiBarChart()
                        .transitionDuration(350)
                          .reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
                          .rotateLabels(0)      //Angle to rotate x-axis labels.
                          .showControls(true)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
                          .groupSpacing(0.1)    //Distance between each group of bars.
                        ;

        //Format x-axis labels with custom function.
        recipientChart.xAxis
            .tickFormat(function(d) {
//              return d3.time.format('%x')(new Date(d))
                return d
        });

        recipientChart.yAxis
            .tickFormat(d3.format(',.2f'));

        d3.select('#recipient-breakdown')
          .datum(that.props.recipient)
          .call(recipientChart);

        nv.utils.windowResize(recipientChart.update);

        return recipientChart;
        });
       return (<div>
          <h4>Status Breakdown</h4>
          <svg id="status-breakdown"/>
          <h4>Recipient Breakdown</h4>
          <svg id="recipient-breakdown"/>
       </div>);
   }

});

var ZendeskMaestro = React.createClass({
   getInitialState: function() {
       return {
           status: [],
           recipient: [],
           searchAlert: ""
       }
   },
   componentDidMount: function(){
       $('input.datepicker').datepicker({
           endDate: today,
           autoclose: true,
           clearBtn: true
       });
   },
   handleSubmit: function(){
       var startDate = reformatDate(this.refs.startDate.getDOMNode().value),
           endDate = reformatDate(this.refs.endDate.getDOMNode().value);
       $.ajax({
           url: "/api/zendesk_stats",
           dataType: 'json',
           type: 'GET',
           data: {
               start_date: startDate,
               end_date: endDate
           },
           success: function(response) {
             if (response.error) {
                 this.setState({
                     status: [],
                     recipient: [],
                     searchAlert: "☹ " + response.error
                 });
             }
             else {
                 this.setState({
                    status: response.data.bar_charts.status,
                    recipient: response.data.bar_charts.recipient,
                    searchAlert: "found " + response.data.total + " documents"
                 });
             }
           }.bind(this),
           error: function(xhr, status, err) {
             this.setState({
                status: [],
                recipient: [],
                searchAlert: "☹ Query failed"
             });
             console.error(status, err);
           }.bind(this)
       });
       return false;
   },
   render: function() {
       var zendeskCanvas = this.state.status.length > 0 || this.state.recipient.length > 0 ?
           <ZendeskCanvas className="col-xs-9 col-sm-9 col-md-9 col-lg-9" status={this.state.status} recipient={this.state.recipient}/> : null;
       return (<div>
           <form className="row" onSubmit={this.handleSubmit}>
              <div className="col-xs-3 col-sm-3 col-md-3 col-lg-3">
                 <p className="icon-addon addon-md">
                    <input ref="startDate" className="datepicker form-control" placeholder="Start date"/>
                    <label className="glyphicon glyphicon-calendar"></label>
                 </p>
              </div>
              <div className="col-xs-3 col-sm-3 col-md-3 col-lg-3">
                 <p className="icon-addon addon-md">
                    <input ref="endDate" className="datepicker form-control" placeholder="End date"/>
                    <label className="glyphicon glyphicon-calendar"></label>
                 </p>
              </div>
              <button id="daterange-submit" type="submit" className="btn btn-default">
                  <span className="glyphicon glyphicon-play"/>
              </button>
           </form>
           {zendeskCanvas}
       </div>);
   }
});

React.renderComponent(<ZendeskMaestro />, document.getElementById('zendesk'));