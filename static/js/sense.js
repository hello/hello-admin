/** @jsx React.DOM */

var today = new Date();
var lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() -7);

var datepickerFormat = d3.time.format("%m/%d/%Y %I:%M:%S %p");
var todayInDatepickerFormat = datepickerFormat(today);
var lastWeekInDatepickerFormat = datepickerFormat(lastWeek);

var sensorList = ['temperature', 'humidity', 'particulates', 'light', 'sound'];
var resolutionList = ['week', 'day'];
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
                    .showLegend(true)
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
                        return d;
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
                    .showLegend(true)
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
                        return d;
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
                    .showLegend(true)
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
                        return d;
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
                    .showLegend(true)
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
                        return d;
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
                    .showLegend(true)
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
                        return d;
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
        if (that.props.username !== "" && that.props.isUserKnown === false) {
          graphs.push(<div><p/><Alert bsStyle="danger">{"Unauthorized to see this user data!"}</Alert></div>);
        }
        else {
          sensorList.forEach(function (s) {
            if (that.props[s].length > 0 && ((that.props[s][0] && that.props[s][0].values.length) || (that.props[s][1] && that.props[s][1].values.length > 0))) {
                graphs.push(<h4 className="chart-title">{s.capitalize()}</h4>);
                graphs.push(<svg id={s} />);
            }
            else if (that.props.username !== "" && that.props.isUserKnown === true) {
                graphs.push(<div>
                    <p/>
                    <Alert bsStyle="warning">{"No " + s + " data available!"}</Alert>
            </div>);
            }
          });
        }
        return (<div>{graphs}</div>)
    }
});


var UserTokenDialog = React.createClass({
  getInitialState: function() {
    return {
        token: "",
        error: ""
    }
  },
  handleClick: function() {
    var that = this;
    var postData = {
      username: that.props.parent.state.username,
      password: $('#password').val(),
      app: "admin-data-viewer"
    };
    console.log('sending', postData);
    $.ajax({
      url: "/api/tokens",
      dataType: 'json',
      type: 'PUT',
      data: JSON.stringify(postData),
      success: function(response) {
        console.log(response)
        that.setState({token: response.data.token, error: ""});
        that.props.parent.getCurrentImpersonatees(true);
        that.props.onRequestHide();
      }.bind(that),
      error: function(e) {
        that.setState({token: "", error: "Failed to generate token. Check credentials"})
      }.bind(that)
    });
  },
  render: function() {
    var display_token = this.state.token === "" ? null :
        <div>Generated token: <span id="display_token">{this.state.token}</span></div>;
    var display_error = this.state.error === "" ? null :
        <div>Error: <span id="display_error">{this.state.error}</span></div>;
    return this.transferPropsTo(
      <Modal pra title={"Enter password for " + this.props.username}>
        <div className="modal-body">
          <Input id="password" type="password"/>
        </div>
        <div className="modal-footer">
          <Button onClick={this.handleClick}>Get Token</Button>
          <Button onClick={this.props.onRequestHide}>Close</Button>
          <p/>
          {display_token}
          {display_error}
        </div>
      </Modal>
    );
  }
});

var vizForm = React.createClass({
    getInitialState: function() {
        return {
            temperature: [],
            humidity: [],
            particulates: [],
            light: [],
            sound: [],
            impersonatees: [],
            username: "",
            isUserKnown: false
        }
    },
    getCurrentImpersonatees: function(willUpdateCharts) {
        var that = this;
        $.ajax({
          url: 'api/tokens',
          dataType: 'json',
          type: 'GET',
          data: {app: "admin-data-viewer"},
          success: function(response) {
            that.setState({impersonatees: response.data});
            console.log(response.data);
            if (willUpdateCharts === true) {
              that.handleSubmit();
            }
          }.bind(that),
          error: function(xhr, status, err) {
            console.error(that.props.url, status, err);
          }.bind(that)
        });
    },

    componentDidMount: function() {
        this.getCurrentImpersonatees(false);
    },

    handleSubmit: function() {
        var that = this;
        var currentInput = $('#username-input').val();
        this.setState({username: currentInput});
        var currentImpersonatees = _.map(that.state.impersonatees, function(x) {return x.username});
        if (currentInput.trim() === "") {
            return false;
        }
        console.log(currentImpersonatees, currentInput);
        if (currentImpersonatees.indexOf(currentInput) === -1) {
          $('#modal-trigger').click();
          this.setState({isUserKnown: false});
//          that.handleSubmit();
          return false;
        }
        else {
          this.setState({isUserKnown: true});
        }
        console.log('impersonatees', that.state.impersonatees);
        console.log(that.state.impersonatees.length);
        var tokenForCurrentInput = "";
        that.state.impersonatees.forEach(function(impersonatee) {
          if (impersonatee.username === currentInput) {
            tokenForCurrentInput = impersonatee.token;
          }
        });
        console.log(tokenForCurrentInput);

        var timezoneOffsetInMs = new Date().getTimezoneOffset()*1000*60;
        sensorList.forEach(function(sensor){
          resolutionList.forEach(function(resolution){
            var request_params = {
              impersonatee_token: tokenForCurrentInput,
              sensor: sensor,
              resolution: resolution,
              timezone_offset: timezoneOffsetInMs
            };
            console.log('sending', request_params);
            $.ajax({
              url: 'api/presleep',
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
                  d[sensor].push(manipulateData(response.data, sensor, resolution, $('#start-date').val(), $('#end-date').val()));
                  this.setState(d);
              }.bind(that),
              error: function(xhr, status, err) {
                console.error(that.props.url, status, err);
              }.bind(that)
            });
          });
        });
        return false
    },

    render: function() {
        return (<div>
            <form onSubmit={this.handleSubmit} className="row">
                <div className="col-xs-3 col-sm-3 col-md-3 col-lg-3">
                  <p className="icon-addon addon-xs">
                    <input id="username-input" className="form-control" placeholder="username"/>
                    <label className="glyphicon glyphicon-user"></label>
                  </p>
                </div>
                <LongDatetimePicker placeHolder="start date" id="start-date" defaultDate={lastWeekInDatepickerFormat} maxDate={todayInDatepickerFormat}  />
                <LongDatetimePicker placeHolder="end date" id="end-date" defaultDate={todayInDatepickerFormat} maxDate={todayInDatepickerFormat} />
                <Button type="submit" bsStyle="success"><Glyphicon glyph="share-alt"/></Button>
            </form>
            <ModalTrigger style="display: none;" modal={<UserTokenDialog parent={this} username={this.state.username} />}>
              <Button id="modal-trigger" bsStyle="primary" bsSize="large">Launch UserTokenDialog</Button>
            </ModalTrigger>
            <vizCanvas
               username={this.state.username}
               isUserKnown={this.state.isUserKnown}
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

React.renderComponent(<vizBox />, document.getElementById('sense'));


function manipulateData(rawData, sensor, resolution, startDate, endDate) {
    var points = [];
    rawData.forEach(function(point) {
      if (point.datetime >= new Date(startDate).getTime() && point.datetime <= new Date(endDate).getTime()) {
        points.push({
            x: point.datetime,
            y: point.value
        });
      }
    });
    return {
        values: points,
        key: legends[resolution],
        color: colorChoice[sensor][resolution]
    }
}

