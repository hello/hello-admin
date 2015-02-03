/** @jsx React.DOM */

var chartOptions = ["area", "bar", "line", "step", "spline", "area-spline", "area-step"].map(function(c){
    return <option value={c}>{c.capitalize() + " Chart"}</option>;
});

var d = new Date();
d.setDate(d.getDate() - 1);
var yesterday = d3.time.format("%m-%d-%Y")(d);

var RoomConditionsMaestro = React.createClass({
    getInitialState: function() {
        return {
            sound: [],
            light: [],
            motion: [],
            currentLabels: [],
            chartType: "area",
            chartCategory: "motion"
        }
    },

    componentDidMount: function() {
        this.submitWithInputsfromURL();
    },

    submitWithInputsfromURL: function() {
        var emailInputFromURL = getParameterByName('email');
        if (emailInputFromURL.isWhiteString()) {
            return false;
        }
        $('#email-input').val(emailInputFromURL);
        this.downloadData();
    },

    pushHistory: function(email) {
        history.pushState({}, '', '/label/?email=' + email);
    },

    downloadData: function() {
        var emailInput = $('#email-input').val().trim();
        var dateInput = $('#date-input').val();
        var that = this;

        var motionRequest = {email: emailInput, date: reformatDate(dateInput)};
        $.ajax({
            url: "/api/motion",
            type: 'GET',
            data: motionRequest,
            dataType: 'json',
            success: function(response) {
                console.log(response);
                that.setState({motion: response.data});
                if (response.data.length === 0) {
                    that.setState({alert: "No data"});
                }
                else {
                    that.setState({alert: ""});
                }
                that.pushHistory(emailInput, dateInput);
            }
        });

        ['sound', 'light'].forEach(function(sensor){
            var roomRequest = {email: emailInput, sensor: sensor, resolution: "day", ts: prepareFromTsCursor(dateInput)};
            console.log(roomRequest);
            $.ajax({
                url: "/api/room_conditions",
                type: "GET",
                data: roomRequest,
                dataType: "json",
                success: function(response) {
                    console.log(response);
                    that.pushHistory(emailInput);
                    var sensorData = {};
                    sensorData[sensor] = response.data;
                    that.setState(sensorData);
                }
            });
        });

        var currentLabelsRequest = {email: emailInput, night: reformatDate(dateInput)};
        $.ajax({
            url: "/api/label_data",
            type: 'GET',
            data: currentLabelsRequest,
            dataType: 'json',
            success: function(response) {
                console.log(response);
                that.setState({currentLabels: response.data});
            }
        });
        return false;
    },

    handleChartType: function() {
        this.setState({chartType: $("#chart-type").val()});
    },

    handleChartCategory: function() {
        this.setState({chartCategory: $('#chart-category').val()})
    },

    render: function() {
        var chartWithLabel = null;
        if (this.state.chartCategory === 'motion') {
            chartWithLabel = <MotionChartWithLabel data={this.state.motion} chartType={this.state.chartType} />;
        }
        else if (this.state.chartCategory === 'sound') {
            chartWithLabel = <SoundChartWithLabel data={this.state.sound} chartType={this.state.chartType} />;
        }
        else if (this.state.chartCategory === 'light') {
            chartWithLabel = <LightChartWithLabel data={this.state.light} chartType={this.state.chartType} />;
        }

        var currentLabels = this.state.currentLabels.length === 0 ? null: prettify_json(this.state.currentLabels, 'label');
        return (<div>
            <form className="row" onSubmit={this.downloadData}>
                <Col xs={3} sm={3} md={3} lg={3} xl={3}>
                    <Input placeholder="email" id="email-input" type="text" />
                </Col>
                <LongDatetimePicker size="2" placeHolder="date" id="date-input" pickTime={false} format="MM-DD-YYYY" defaultDate={yesterday} />
                <Col xs={2} sm={2} md={2} lg={2} xl={2}>
                    <Input id="chart-category" type="select" onChange={this.handleChartCategory}>
                        <option value="motion">Motion</option>
                        <option value="sound">Sound</option>
                        <option value="light">Light</option>
                    </Input>
                </Col>

                <Col xs={3} sm={3} md={3} lg={3} xl={3}>
                    <Button type="submit"><Glyphicon glyph="search" /></Button>
                </Col>
                <Col xs={2} sm={2} md={2}>
                    <Input type="select" id="chart-type" onChange={this.handleChartType}>{chartOptions}</Input>
                </Col>
            </form>
            <Row>
                <Col xs={9} sm={9} md={9} lg={9} xl={9}>
                    {chartWithLabel}
                </Col>
                <Col xs={3} sm={3} md={3} lg={3} xl={3}>
                    <span>Current Labels</span>
                    {currentLabels}
                </Col>
            </Row>
        </div>)
    }
});

React.renderComponent(<RoomConditionsMaestro />, document.getElementById('label'));


function reformatDate(dateString) {
    var dateComponents = dateString.split("-");
    var year = dateComponents[2];
    var month = dateComponents[0];
    var date = dateComponents[1];
    return [year, month, date].join("-");
}

function prettify_json(objects, title_field) {
  var divs = [];
  $.each(objects, function(index, dict){
    divs.push(<div>
      <Label bsStyle="success">{dict[title_field]}</Label>
      <pre className="alert-default">{JSON.stringify(dict || 'Sorry, no match|', null, 3)}</pre>
    </div>);
  });
  return divs
}

function prepareFromTsCursor(dt) {
    // From a night date, "from" cursor is defined by getting next day's 11am
    var dateInput = new Date(dt);
    dateInput.setDate(dateInput.getDate() + 1);
    dateInput.setHours(11);
    return dateInput.getTime();
}