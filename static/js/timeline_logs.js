var TimelineLogsMaster = React.createClass({
    getInitialState: function() {
        return {data: [], error: ""}
    },

    pushHistory: function(date) {
        history.pushState({}, '', '/timeline_logs/?date=' + date);
    },

    componentDidMount: function() {
        this.submitWithInputsfromURL();
    },

    submitWithInputsfromURL: function() {
        var dateInputFromURL = getParameterByName('date');
        if (dateInputFromURL.isWhiteString()) {
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate()-1);
            dateInputFromURL = d3.time.format("%m-%d-%Y")(yesterday);
        }
        $('#date-input').val(dateInputFromURL);

        this.handleSubmit();
    },

    handleSubmit: function() {
        var dateInput = $("#date-input").val();
        $.ajax({
            url: '/api/timeline_logs',
            dataType: 'json',
            data: {date: reformatDate(dateInput)},
            type: "GET",
            success: function(response) {
                this.setState(response);
                this.pushHistory(dateInput);
            }.bind(this)
        });
        return false;
    },
    render: function() {
        var alert = this.state.error ? <Alert>{this.state.error}</Alert> : null;
        var results = this.state.data.length === 0 ? null :
            <Table>
                <thead><tr>
                    <th>Algorithm</th>
                    <th>Error</th>
                    <th>Count</th>
                </tr></thead>
                <tbody>
                    {this.state.data.map(function(d){
                        return <tr>
                            <td>{d.algorithm}</td>
                            <td>{d.error}</td>
                            <td>{d.count}</td>
                        </tr>
                    })}
                </tbody>
            </Table>;


        return (<div>
            <form onSubmit={this.handleSubmit}>
                <LongDatetimePicker size={3} glyphicon="clock" placeHolder="pick a date -- default = yesterday" id={this.props.dateId} pickTime={false} format="MM-DD-YYYY" size="4" />
                <Col xs={2}><Button type="submit">Go</Button></Col>
            </form>
            {alert}
            {results}
        </div>);
    }
});

React.render(<TimelineLogsMaster dateId="date-input"  />, document.getElementById("timeline-logs"));

function reformatDate(dateString) {
    var dateComponents = dateString.split("-");
    var year = dateComponents[2];
    var month = dateComponents[0];
    var date = dateComponents[1];
    return [year, month, date].join("-");
}