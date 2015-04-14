/** @jsx React.DOM */

var today = new Date();

var datepickerFormat = d3.time.format("%m/%d/%Y %I:%M:%S %p");
var todayInDatepickerFormat = datepickerFormat(today);

var sensorList = ['temperature', 'humidity', 'particulates', 'light', 'sound'];
var resolutionList = ['day'];
var colorChoice = {
    temperature: {
        day: '#E30B5C',
        week: 'violet'
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
    },
    sound: {
        day: 'teal',
        week: 'indigo'
    }
};
var legends = {
    day: 'every 5 minutes',
    week: 'every hour'
};
var vizCanvas = React.createClass({
    componentDidMount: function() {
        console.log('sketch me up!')
    },

    render: function() {
//        d3.selectAll("svg > *").remove();
        var that = this;
        var temperatureChart, humidityChart, particulatesChart, lightChart, soundChart;
        if (that.props.temperature.length > 0) {
            nv.addGraph(function () {
                temperatureChart = nv.models.lineChart()
                    .margin({left: 75, right: 50})
                    .useInteractiveGuideline(true)
                    .transitionDuration(350)
                    .showLegend(false)
                    .showYAxis(true)
                    .showXAxis(true);

                temperatureChart.xAxis
                    .axisLabel('Time')
                    .tickFormat(function (d) {
                        return d3.time.format('%b %d %H:%M')(new Date(d));
                    });

                temperatureChart.yAxis
                    .axisLabel('Temperature (°C )')
                    .tickFormat(function (d) {
                        return d.toFixed(2);
                    });


                d3.select('#temperature')
                    .datum(that.props.temperature)
                    .call(temperatureChart);


                nv.utils.windowResize(function () {
                    temperatureChart.update()
                });
                return temperatureChart;
            });
        }

        if (that.props.humidity.length > 0) {
            nv.addGraph(function () {
                humidityChart = nv.models.lineChart()
                    .margin({left: 75, right: 50})
                    .useInteractiveGuideline(true)
                    .transitionDuration(350)
                    .showLegend(false)
                    .showYAxis(true)
                    .showXAxis(true);

                humidityChart.xAxis
                    .axisLabel('Time')
                    .tickFormat(function (d) {
                        return d3.time.format('%b %d %H:%M')(new Date(d));
                    });

                humidityChart.yAxis
                    .axisLabel('Humidity (%)')
                    .tickFormat(function (d) {
                        return d.toFixed(2);
                    });


                d3.select('#humidity')
                    .datum(that.props.humidity)
                    .call(humidityChart);
                nv.utils.windowResize(function () {
                    humidityChart.update()
                });

                return humidityChart;
            });
        }

        if (that.props.particulates.length > 0) {
            nv.addGraph(function () {
                particulatesChart = nv.models.lineChart()
                    .margin({left: 75, right: 50})
                    .useInteractiveGuideline(true)
                    .transitionDuration(350)
                    .showLegend(false)
                    .showYAxis(true)
                    .showXAxis(true);

                particulatesChart.xAxis
                    .axisLabel('Time')
                    .tickFormat(function (d) {
                        return d3.time.format('%b %d %H:%M')(new Date(d));
                    });

                particulatesChart.yAxis
                    .axisLabel('Particulates (µg/m³)')
                    .tickFormat(function (d) {
                        return d.toFixed(2);
                    });


                d3.select('#particulates')
                    .datum(that.props.particulates)
                    .call(particulatesChart);
                nv.utils.windowResize(function () {
                    particulatesChart.update()
                });

                return particulatesChart;
            });
        }

        if (that.props.light.length > 0) {
            nv.addGraph(function () {
                lightChart = nv.models.lineChart()
                    .margin({left: 75, right: 50})
                    .useInteractiveGuideline(true)
                    .transitionDuration(350)
                    .showLegend(false)
                    .showYAxis(true)
                    .showXAxis(true);

                lightChart.xAxis
                    .axisLabel('Time')
                    .tickFormat(function (d) {
                        return d3.time.format('%b %d %H:%M')(new Date(d));
                    });

                lightChart.yAxis
                    .axisLabel('Light (lm)')
                    .tickFormat(function (d) {
                        return d.toFixed(2);
                    });


                d3.select('#light')
                    .datum(that.props.light)
                    .call(lightChart);
                nv.utils.windowResize(function () {
                    lightChart.update()
                });

                return lightChart;
            });
        }

        if (that.props.sound.length > 0) {
            nv.addGraph(function () {
                soundChart = nv.models.lineChart()
                    .margin({left: 75, right: 50})
                    .useInteractiveGuideline(true)
                    .transitionDuration(350)
                    .showLegend(false)
                    .showYAxis(true)
                    .showXAxis(true);

                soundChart.xAxis
                    .axisLabel('Time')
                    .tickFormat(function (d) {
                        return d3.time.format('%b %d %H:%M')(new Date(d));
                    });

                soundChart.yAxis
                    .axisLabel('Sound (dB)')
                    .tickFormat(function (d) {
                        return d.toFixed(2);
                    });


                d3.select('#sound')
                    .datum(that.props.sound)
                    .call(soundChart);
                nv.utils.windowResize(function () {
                    soundChart.update()
                });
                return soundChart;
            });
        }

        var graphs = [];


          sensorList.forEach(function (s) {
            if (that.props[s].length > 0 && ((that.props[s][0] && that.props[s][0].values.length) || (that.props[s][1] && that.props[s][1].values.length > 0))) {
                graphs.push(<h4 className="chart-title">{s.capitalize()}</h4>);
                graphs.push(<svg id={s} />);
            }
          });
        return (<div>{graphs}</div>)
    }
});

var vizForm = React.createClass({
    getInitialState: function() {
        return {
            temperature: [],
            humidity: [],
            particulates: [],
            light: [],
            sound: []
        }
    },
    
     componentDidMount: function() {
        this.submitWithInputsfromURL();
    },

    submitWithInputsfromURL: function() {
        var emailInputFromURL = getParameterByName('email');
        var until = getParameterByName('until');
        if (emailInputFromURL.isWhiteString()) {
            return false;
        }
        $('#email-input').val(emailInputFromURL);
        $('#end-time').val(until);
        this.handleSubmit();
    },

    pushHistory: function(email, until) {
        history.pushState({}, '', '/room_conditions/?email=' + email + '&until=' + until);
    },


    handleSubmit: function() {
        $preloader.fadeIn('fast');
        var that = this;
        var email = $('#email-input').val().trim();
        var until = $('#end-time').val().trim();
        sensorList.forEach(function(sensor){
          resolutionList.forEach(function(resolution){
            var request_params = {
              email: email,
              sensor: sensor,
              resolution: resolution,
              ts: new Date(until).getTime()
            };
            console.log('sending', request_params);
            that.pushHistory(email, until);
            $.ajax({
              url: '/api/room_conditions',
              dataType: 'json',
              data: request_params,
              type: 'GET',
              success: function(response) {
                  console.log(response);
                  var d = {};
                  d[sensor] = this.state[sensor];
                  if (d[sensor].length === resolutionList.length) {
                      d[sensor] = [];
                  }
                  d[sensor].push(manipulateData(response.data, sensor, resolution));
                  this.setState(d);
              }.bind(that),
              error: function(xhr, status, err) {
                console.error(that.props.url, status, err);
              }.bind(that)
            });
          });
        });
        $preloader.fadeOut('fast');
        return false;
    },
    
    

    render: function() {
        return (<div>
            <form onSubmit={this.handleSubmit} className="row">
                <div className="col-xs-3 col-sm-3 col-md-3 col-lg-3">
                  <p className="icon-addon addon-xs">
                    <input id="email-input" className="form-control" placeholder="email"/>
                    <label className="glyphicon glyphicon-user"></label>
                  </p>
                </div>
                <LongDatetimePicker placeHolder="end time" id="end-time" defaultDate={todayInDatepickerFormat} glyphicon="time" />
                <Button type="submit" bsStyle="success"><Glyphicon glyph="share-alt"/></Button>
            </form>
            <vizCanvas
               temperature={this.state.temperature}
               humidity={this.state.humidity}
               particulates={this.state.particulates}
               sound={this.state.sound}
               light={this.state.light}
            />
        </div>)
    }
});
var vizBox = React.createClass({
    render: function() {
        return (<code className="nonscript">
            <vizForm />
        </code>)
    }
});

React.renderComponent(<vizBox />, document.getElementById('room-conditions'));


function manipulateData(rawData, sensor, resolution) {
    return {
        values: rawData.filter(function(point){return point.value !== -1}).map(function(point){return {x: point.datetime, y: point.value};}),
        key: legends[resolution],
        color: colorChoice[sensor][resolution]
    }
}

