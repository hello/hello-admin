/** @jsx React.DOM */

var ActiveDevicesHistory = React.createClass({
    getInitialState: function() {
        return {
            data: [],
            filteredData: [],
            stackable: true,
            zoomable: true,
            chartType: "bar",
            alert: "Loading ..."
        }
    },

    filterTicketsByDate: function() {
        var startDate = $("#start-date").val();
        var endDate = $("#end-date").val();
        history.pushState({}, '', '/active_devices_history/?start_date=' + startDate + '&end_date=' + endDate);
        this.setState({
            filteredData: this.state.data.filter(function(d) {
                if (startDate && endDate && !startDate.isWhiteString() && !endDate.isWhiteString()) {
                    return d.created_at*1000 >= new Date(startDate).getTime() && d.created_at*1000 <= new Date(endDate).getTime();
                }
                if (startDate && !startDate.isWhiteString()) {
                    return d.created_at*1000 >= new Date(startDate).getTime();
                }
                if (endDate && !endDate.isWhiteString()) {
                    return d.created_at*1000 <=new Date(endDate).getTime();
                }
                return d;
            })
        });
        return false;
    },

    filterByURLInputs: function() {
        var startDateFromURL = getParameterByName('start_date');
        var endDateFromURL = getParameterByName('end_date');
        if (startDateFromURL.isWhiteString() && endDateFromURL.isWhiteString()) {
            return false;
        }
        $("#start-date").val(startDateFromURL);
        $("#end-date").val(endDateFromURL);
        $('#filter-by-date').click();
        return false;
    },

    componentDidMount: function() {
        $("#stack-check").attr("checked", true);
        $("#zoom-check").attr("checked", true);
        var that = this;
        $.ajax({
            url: "/api/active_devices_history",
            type: "GET",
            dataType: "json",
            success: function(response) {
                console.log(response);
                if (response.error.isWhiteString()){
                    that.setState({data: response.data, filteredData: response.data.slice(0, 480), alert: ""});
                }
                else {
                    that.setState({data: [], filteredData: [], alert: response.error});
                }
            }
        });
    },

    handleStack: function() {
        this.setState({stackable: $('#stack-check').is(':checked')});
    },

    handleZoom: function() {
        this.setState({zoomable: $('#zoom-check').is(':checked')});
    },

    handleClearFilter: function() {
        window.location.replace("/active_devices_history");
    },

    handleChartType: function() {
        this.setState({chartType: $("#chart-type").val()});
    },

    render: function() {
        var chartOptions = ["bar"].map(function(c){
            return <option value={c}>{c.capitalize() + " Chart"}</option>;
        });

        var alert = this.state.alert === "" ? null:<Alert>{this.state.alert}</Alert>;

        return (<div>
            <form className="row">
                <LongDatetimePicker size="2" placeHolder="start date" id="start-date" pickTime={false} format="MM-DD-YYYY"/>
                <LongDatetimePicker size="2" placeHolder="end date" id="end-date" pickTime={false} format="MM-DD-YYYY"/>
                <Col xs={1} sm={1} md={1}>
                    <Button id="filter-by-date" bsSize="large" bsStyle="info" title="Query !" className="btn-circle" type="submit">{<Glyphicon glyph="filter"/>}</Button>
                </Col>
                <Col xs={2} sm={2} md={2}>
                    <Button id="submit" bsSize="large" bsStyle="info" tilte="Clear Filter" className="btn-circle" onClick={this.handleClearFilter}>{<Glyphicon glyph="remove"/>}</Button>
                </Col>
                <Col xs={2} sm={2} md={2}>
                    <Input type="select" id="chart-type" onChange={this.handleChartType}>{chartOptions}</Input>
                </Col>
                <Col xs={1} sm={1} md={1}>
                    <Input type="checkbox" id="zoom-check" label="Zoomable" onChange={this.handleZoom}/>
                </Col>
                <Col xs={1} sm={1} md={1}>
                    <Input type="checkbox" id="stack-check" label="Stacked" onChange={this.handleStack}/>
                </Col>
            </form>
            {alert}
            <Row>
                <Col xs={12} sm={12} md={12}>
                    <c3HistoryChart data={this.state.filteredData} stackable={this.state.stackable} zoomable={this.state.zoomable} chartType={this.state.chartType} xTickFormat="short"/>
                </Col>
            </Row>
            <p className="chart-remark">Notes: <br/>
                &nbsp;&nbsp;- Scroll to zoom, drag to pan<br/>
                &nbsp;&nbsp;- Legends are clickable to toggle visiblity by group<br/>
                &nbsp;&nbsp;- Zooming/Dragging may be laggy in certain browsers<br/>
                &nbsp;&nbsp;- Showing latest 720 data points<br/>
            </p>
        </div>)
    }
});
React.renderComponent(<ActiveDevicesHistory />, document.getElementById('active-devices-history'));