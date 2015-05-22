/** @jsx React.DOM */

var NotesModal = React.createClass({
    render: function() {
        return this.transferPropsTo(
            <Modal pra title="Notes">
                <div className="modal-body">
                    <p> - Scroll to zoom, drag to pan</p>
                    <p> - Legends are clickable to toggle visiblity by group</p>
                    <p> - Zooming/Dragging may be laggy in certain browsers</p>
                    <hr/>
                    <p> Why the 3 charts can't be merged &#63; </p>
                    <p> - The measurement is different, while first chart cares about live status (number of sense seen last minute), the second chart illustrates the aggregate count of senses which is last seen anytime during the last 24 hours. Third chart is meso-level </p>
                    <p> - Counts are not accumulative, i.e. if we know there is <em>x</em> sense seen last minute and <em>y</em> sense seen the minute before last minute, it is still impossible to tell how many sense seen last 2 minutes as the result could be anything between <em>max(x,y)</em> and <em>x+y</em> </p>
                    <p> - Minute data is kept for maximum 4 days, there is a purge mechanism to get rid of out-of-date data. For daily data, it's likely I'll keep them permanently</p>
                </div>
            </Modal>
        );
    }
});

var ActiveDevicesHistory = React.createClass({
    getInitialState: function() {
        return {
            minuteData: [],
            filteredMinuteData: [],
            tenMinutesData: [],
            filteredTenMinutesData: [],
            dailyData: [],
            stackable: false,
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
            filteredMinuteData: this.state.minuteData.filter(function(d) {
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

    loadMinuteData: function() {
        var that = this;
        $.ajax({
            url: "/api/active_devices_minute_history",
            type: "GET",
            dataType: "json",
            success: function(response) {
                console.log(response);
                if (response.error.isWhiteString()){
                    that.setState({minuteData: response.data, filteredMinuteData: response.data.reverse().filter(function(d, i){return i%20 === 0;}) , alert: ""});
                }
                else {
                    that.setState({minuteData: [], filteredMinuteData: [], alert: response.error});
                }
            }
        });
    },

    load15MinutesData: function() {
        var that = this;
        $.ajax({
            url: "/api/active_devices_15_minutes_history",
            type: "GET",
            dataType: "json",
            success: function(response) {
                console.log(response);
                if (response.error.isWhiteString()){
                    that.setState({tenMinutesData: response.data, filteredTenMinutesData: response.data.reverse().filter(function(d, i){return i%1 === 0;}) , alert: ""});
                }
                else {
                    that.setState({tenMinutesData: [], filteredTenMinutesData: [], alert: response.error});
                }
            }
        });
    },

    loadDailyData: function() {
        var that = this;
        $.ajax({
            url: "/api/active_devices_daily_history",
            type: "GET",
            dataType: "json",
            success: function(response) {
                console.log(response);
                if (response.error.isWhiteString()){
                    that.setState({dailyData: response.data, alert: ""});
                }
                else {
                    that.setState({dailyData: [], alert: response.error});
                }
            }
        });
    },

    componentDidMount: function() {
        $("#stack-check").attr("checked", false);
        $("#zoom-check").attr("checked", true);
        this.loadMinuteData();
        this.load15MinutesData();
        this.loadDailyData();
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
                <Col xs={1} sm={1} md={1}><ModalTrigger modal={<NotesModal />}>
                    <Button bsSize="small">Notes</Button>
                </ModalTrigger></Col>
                <LongDatetimePicker size="1" placeHolder="start date" id="start-date" pickTime={false} format="MM-DD-YYYY"/>
                <LongDatetimePicker size="1" placeHolder="end date" id="end-date" pickTime={false} format="MM-DD-YYYY"/>
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
            <h3>Number of Devices Seen Last Minute History</h3>
            <Row>
                <Col xs={12} sm={12} md={12}>
                    <c3HistoryChart id="minute-chart" data={this.state.filteredMinuteData} stackable={this.state.stackable} zoomable={this.state.zoomable} chartType={this.state.chartType} xTickFormat="short"/>
                </Col>
            </Row>
            <h3>Number of Devices Seen Last 24 Hours History</h3>
            <Row>
                <Col xs={12} sm={12} md={12}>
                    <c3HistoryChart id="daily-chart" data={this.state.dailyData} stackable={this.state.stackable} zoomable={this.state.zoomable} chartType={this.state.chartType} xTickFormat="short"/>
                </Col>
            </Row>
            <h3>Number of Devices Seen Last 15 Minutes History</h3>
            <Row>
                <Col xs={12} sm={12} md={12}>
                    <c3HistoryChart id="ten-minutes-chart" data={this.state.filteredTenMinutesData} stackable={this.state.stackable} zoomable={this.state.zoomable} chartType={this.state.chartType} xTickFormat="short"/>
                </Col>
            </Row>
        </div>)
    }
});
React.renderComponent(<ActiveDevicesHistory />, document.getElementById('active-devices-history'));