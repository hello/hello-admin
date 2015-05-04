/** @jsx React.DOM */

var d = new Date();
d.setDate(d.getDate() - 1);
var yesterday = d3.time.format("%m-%d-%Y")(d);

var LineChart = React.createClass({
    getDefaultProps: function() {
        return {id: "line-chart", xlabel: "X", ylabel: "Y"}
    },
    render: function() {
        var that = this;
        var lineChart;
        nv.addGraph(function() {
            lineChart = nv.models.lineChart()
                .margin({left: 100, right: 75})
                .useInteractiveGuideline(true)
                .transitionDuration(350)
                .showLegend(false)
                .showYAxis(true)
                .showXAxis(true);

            lineChart.xAxis
                .axisLabel(that.props.xlabel)
//                .tickFormat(function(d) { return d3.time.format('%b %d %H:%M')(new Date(d)); });
                .tickFormat(function(d) { return d3.time.format('%b %d %H:%M')(new Date(new Date(d).toUTCString().split("GMT")[0])); });

            lineChart.yAxis
                .axisLabel(that.props.ylabel)
                .tickFormat(function(d) {return d;});

            lineChart.isArea(true);
            lineChart.interpolate('step-nefore');

            d3.select("#"+that.props.id)
                .datum(that.props.data)
                .call(lineChart);
            nv.utils.windowResize(function() { lineChart.update() });

            return lineChart;
        });
        return (<div>
            <svg id={that.props.id} />
        </div>)
    }
});

var MotionMaestro = React.createClass({
    getInitialState: function() {
        return {data: [], filteredData: [], alert: "", startTime: "", endTime: ""}
    },

    submitWithInputsfromURL: function() {
        var emailInputFromURL = getParameterByName('email');
        var dateInputFromURL = getParameterByName('date');
        if (emailInputFromURL.isWhiteString() || dateInputFromURL.isWhiteString()) {
            return false;
        }
        $('#email-input').val(emailInputFromURL);
        $('#date-input').val(dateInputFromURL);
        this.getMotionData();
    },

    getMotionData: function() {
        var that = this;
        var emailInput = $("#email-input").val().trim();
        var dateInput = $("#date-input").val();
        var requestData = {
            email: emailInput,
            date: reformatDate(dateInput)
        };
        if (!isValidRequest(requestData)) {
            return false;
        }
        console.log(requestData);
        $.ajax({
            url: "/api/motion",
            type: 'GET',
            data: requestData,
            dataType: 'json',
            success: function(response) {
                console.log(response);
                that.setState({data: response.data, filteredData: response.data});
                if (response.data.length === 0) {
                    that.setState({alert: "No data"});
                }
                else {
                    that.setState({alert: ""});
                }
                that.pushHistory(emailInput, dateInput);
            }.bind(that),
            error: function(e) {
                console.log(e);
            }.bind(that)
        });
        return false;
    },

    componentDidMount: function() {
        this.submitWithInputsfromURL();
    },

    pushHistory: function(email, date) {
        history.pushState({}, '', '/motion/?email=' + email + '&date=' + date);
    },

    handleFilter: function() {
        this.setState({filteredData: this.state.data.filter(filterDataByDate)})
    },

    handleClear: function() {
        $('#start-time').val("");
        $('#end-time').val("");
        this.handleFilter();
    },

    render: function() {
        console.log(this.state.filteredData.length, this.state.data.length);
        var alert = (this.state.alert !== "No data") ? null:
            <Row><Col xs={6} sm={6} md={6}><Alert bsStyle="info">No data !</Alert></Col></Row>;

        var stepwiseChart = (this.state.filteredData.length === 0) ? null :
            <Row><LineChart id="motion-stepwise-chart" data={manipulateStepwiseData(this.state.filteredData, true)} xlabel="Stepwise" ylabel="Acceleration"/></Row>;

        var stairChart = (this.state.filteredData.length === 0) ? null :
            <Row><LineChart id="motion-discrete-chart" data={manipulateStairData(this.state.filteredData)} xlabel="Discrete" ylabel="Acceleration"/></Row>;

        return (<div>
            <form onSubmit={this.getMotionData} className="row">
                <LongDatetimePicker size="2" placeHolder="date" id="date-input" pickTime={false} format="MM-DD-YYYY" defaultDate={yesterday} />
                <Col xs={3} sm={3} md={3}>
                    <Input id="email-input" type="text" addonBefore={<Glyphicon glyph="user"/>} placeholder="user email" />
                </Col>
                <Col xs={1} sm={1} md={1}>
                    <Button bsSize="large" bsStyle="info" title="Query !" className="btn-circle" type="submit">{<Glyphicon glyph="search"/>}</Button>
                </Col>
                <LongDatetimePicker size="2" placeHolder="start time" id="start-time" glyphicon="time" />
                <LongDatetimePicker size="2" placeHolder="end time" id="end-time" glyphicon="time" />
                <Col xs={1} sm={1} md={1}>
                    <Button bsSize="large" bsStyle="info" title="Filter by Time" className="btn-circle" onClick={this.handleFilter}>{<Glyphicon glyph="filter"/>}</Button>
                </Col>
                 <Col xs={1} sm={1} md={1}>
                    <Button bsSize="large" bsStyle="info" tilte="Clear Filter" className="btn-circle" onClick={this.handleClear}>{<Glyphicon glyph="remove"/>}</Button>
                </Col>
            </form>
            <Row>
                <Button bsSize="xsmall">
                    <FileExporter fileContent={this.state.filteredData} fileName="motion"/>
                </Button>
                &nbsp;All times are displayed using user local timezone
            </Row>
            <br />
            {alert}
            {stepwiseChart}
            {stairChart}
        </div>)
    }
});

React.renderComponent(<MotionMaestro />, document.getElementById('motion-canvas'));

function reformatDate(dateString) {
    var dateComponents = dateString.split("-");
    var year = dateComponents[2];
    var month = dateComponents[0];
    var date = dateComponents[1];
    return [year, month, date].join("-");
}

function manipulateStepwiseData(rawData, stepwise) {
    var points = [];
    rawData.forEach(function(point, index) {
        var y = point.value !== -1 ? Math.abs(point.value) : point.value * 1000;
        points.push({
            x: point.timestamp + point.timezone_offset,
            y: y
        });
        if (stepwise === true && index < rawData.length - 1) {
            points.push({
                x: rawData[index + 1].timestamp + point.timezone_offset,
                y: y
            });
        }
    });
    return [{
        values: points,
        key: "a   =",
        color: stepwise === true ? "teal": "indigo"
    }]
}

function manipulateStairData(rawData) {
    var points = [];
    rawData.forEach(function(point) {
        var y = point.value !== -1 ? Math.abs(point.value) : point.value * 1000;
        points.push({
            x: point.timestamp + point.timezone_offset,
            y: 0
        });
        points.push({
            x: point.timestamp + point.timezone_offset,
            y: y
        });
        points.push({
            x: point.timestamp + 30000 + point.timezone_offset,
            y: y
        });
        points.push({
            x: point.timestamp + 30000 + point.timezone_offset,
            y: 0
        });
    });
    return [{
        values: points,
        key: "a   =",
        color: "orangered"
    }]
}

function filterDataByDate(point) {
    var startTime = $('#start-time').val();
    var endTime = $('#end-time').val();
    if (startTime && !startTime.isWhiteString() && endTime && !endTime.isWhiteString()) {
        return new Date(startTime).getTime() <= point.timestamp && new Date(endTime).getTime() >= point.timestamp;
    }
    if (startTime && !startTime.isWhiteString()) {
        return new Date(startTime).getTime() <= point.timestamp;
    }
    if (endTime && !endTime.isWhiteString()) {
        return new Date(endTime).getTime() >= point.timestamp;
    }
    return true;
}
