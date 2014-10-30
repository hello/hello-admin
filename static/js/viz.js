/** @jsx React.DOM */
// The above declaration must remain intact at the top of the script.
var sensorList = ['temperature', 'humidity', 'particulates', 'light'];
var resolutionList = ['week', 'day'];
var colorChoice = {
    temperature: {
        day: 'pink',
        week: 'red'
    },
    humidity: {
        day: '#8db600',
        week: 'teal'
    },
    particulates: {
        day: '#00ffff',
        week: 'blue'
    },
    light: {
        day: 'orange',
        week: 'brown'
    }
};
var vizCanvas = React.createClass({
    componentDidMount: function() {
        console.log('sketch me up!')
    },

    render: function() {
//        d3.selectAll("svg > *").remove();
        var that = this;
        var temperatureChart, humidityChart, particulatesChart, lightChart;
        nv.addGraph(function() {
          temperatureChart = nv.models.lineChart()
                        .margin({left: 75, right: 50})
                        .useInteractiveGuideline(true)
                        .transitionDuration(350)
                        .showLegend(true)
                        .showYAxis(true)
                        .showXAxis(true);

          temperatureChart.xAxis
              .axisLabel('Time')
              .tickFormat(function(d) { return d3.time.format('%b %d %H:%M')(new Date(d)); });

          temperatureChart.yAxis
              .axisLabel('Temperature (°C )')
              .tickFormat(function(d) {return d;});


          d3.select('#temperature')
              .datum(that.props.temperature)
              .call(temperatureChart);
          nv.utils.windowResize(function() { temperatureChart.update() });

          return temperatureChart;
        });


        nv.addGraph(function() {
          humidityChart = nv.models.lineChart()
                        .margin({left: 75, right: 50})
                        .useInteractiveGuideline(true)
                        .transitionDuration(350)
                        .showLegend(true)
                        .showYAxis(true)
                        .showXAxis(true);

          humidityChart.xAxis
              .axisLabel('Time')
              .tickFormat(function(d) { return d3.time.format('%b %d %H:%M')(new Date(d)); });

          humidityChart.yAxis
              .axisLabel('Humidity (%)')
              .tickFormat(function(d) {return d;});


          d3.select('#humidity')
              .datum(that.props.humidity)
              .call(humidityChart);
          nv.utils.windowResize(function() { humidityChart.update() });

          return humidityChart;

        });

        nv.addGraph(function() {
          particulatesChart = nv.models.lineChart()
                        .margin({left: 75, right: 50})
                        .useInteractiveGuideline(true)
                        .transitionDuration(350)
                        .showLegend(true)
                        .showYAxis(true)
                        .showXAxis(true);

          particulatesChart.xAxis
              .axisLabel('Time')
              .tickFormat(function(d) { return d3.time.format('%b %d %H:%M')(new Date(d)); });

          particulatesChart.yAxis
              .axisLabel('Particulates (µg/m³)')
              .tickFormat(function(d) {return d;});


          d3.select('#particulates')
              .datum(that.props.particulates)
              .call(particulatesChart);
          nv.utils.windowResize(function() { particulatesChart.update() });

          return particulatesChart;
        });

        nv.addGraph(function() {
          lightChart = nv.models.lineChart()
                        .margin({left: 75, right: 50})
                        .useInteractiveGuideline(true)
                        .transitionDuration(350)
                        .showLegend(true)
                        .showYAxis(true)
                        .showXAxis(true);

          lightChart.xAxis
              .axisLabel('Time')
              .tickFormat(function(d) { return d3.time.format('%b %d %H:%M')(new Date(d)); });

          lightChart.yAxis
              .axisLabel('Light (lm)')
              .tickFormat(function(d) {return d;});


          d3.select('#light')
              .datum(that.props.light)
              .call(lightChart);
          nv.utils.windowResize(function() { lightChart.update() });

          return lightChart;
        });

       return (<div>
         <h4 className="chart-title">Temperature</h4>
         <svg id="temperature" />
         <h4 className="chart-title">Humidity</h4>
         <svg id="humidity" />
         <h4 className="chart-title">Particulates</h4>
         <svg id="particulates" />
         <h4 className="chart-title">Light</h4>
         <svg id="light" />
       </div>)
    }

});

//function prepareDrawData()


var vizForm = React.createClass({
    getInitialState: function() {
        return {
            temperature: [],
            humidity: [],
            particulates: [],
            light: []
        }
    },
    handleChange: function() {
        var iam = this;
        sensorList.forEach(function(sensor){
          resolutionList.forEach(function(resolution){
            var request_params = {
              user_token: $('select').val(),
              sensor: sensor,
              resolution: resolution
            };
//            console.log('sending', request_params);
            $.ajax({
              url: 'api/presleep',
              dataType: 'json',
              data: request_params,
              type: 'GET',
              success: function(response) {
                  var d = {};
                  d[sensor] = this.state[sensor];
                  console.log('SS', d[sensor]);
                  if (d[sensor].length === resolutionList.length) {
                      d[sensor] = [];
                  }
                  d[sensor].push(manipulateData(response.data, sensor, resolution));
                  this.setState(d);
              }.bind(iam),
              error: function(xhr, status, err) {
                console.error(iam.props.url, status, err);
              }.bind(iam)
            });
          });
        });
        return false
    },
    render: function() {
        var options = [];
//        console.log('ability to impersonate', this.props.impersonatees);
        this.props.impersonatees.forEach(function(impersonatee){
            options.push(<option value={impersonatee.access_token}>{impersonatee.username + ' ' + impersonatee.access_token }</option>)
        });
        console.log('h', this.state.humidity);
        return (<div>
            <form className="form-inline">
                <select ref="cascadeur" className="form-control">{options}</select>
                <button type="button" onClick={this.handleChange} className="form-control">GO</button>
            </form>
            <vizCanvas
               temperature={this.state.temperature}
               humidity={this.state.humidity}
               particulates={this.state.particulates}
               light={this.state.light}
            />
        </div>)
    }
});
var vizBox = React.createClass({
    getInitialState: function() {
        return {
            impersonatees: []
        }
    },
    componentDidMount: function() {
        $.ajax({
          url: 'api/recent_tokens',
          dataType: 'json',
          type: 'GET',
          success: function(response) {
            this.setState({
                impersonatees: response.data
            })
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(this.props.url, status, err);
          }.bind(this)
        });
    },
    render: function() {
        return (<div>
            <vizForm impersonatees={this.state.impersonatees} />
        </div>)
    }
});

React.renderComponent(<vizBox />, document.getElementById('viz'));


function manipulateData(rawData, sensor, resolution) {
    var points = [];
    rawData.forEach(function(point){
        points.push({
            x: point.datetime,
            y: point.value
        });
    });
    return {
        values: points,
        key: resolution,
        color: colorChoice[sensor][resolution]
    }
}

