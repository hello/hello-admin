var yesterday = new Date();
yesterday.setDate(yesterday.getDate()-1);
dateInputFromURL = d3.time.format("%m-%d-%Y")(yesterday);

var FeedbackTableResults = React.createClass({
    updateFeedback: function(created) {
        console.log("Undoing feedback");
        $.ajax({
            url: "/api/feedback",
            type: "PUT",
            data: JSON.stringify({night: created, email: $("#email-input").val()}),
            success: function(response) {
                if (response.error.isWhiteString()){
                    this.props.getFeedback();
                }
                else {
                    alert("Failed to update because " + response.error);
                }
            }.bind(this)
        });
        return false;
    },
    render: function() {
        if (this.props.data.length === 0) {
            return null;
        }
        return <Table>
            <thead>
                <tr>
                    <th>Account ID</th>
                    <th>Date of Night</th>
                    <th>Old Time</th>
                    <th>New Time</th>
                    <th>Event Type</th>
                    <th>Created</th>
                    <th>Set new_time=old_time</th>
                </tr>
            </thead>
            <tbody>{
                this.props.data.map(function(d){
                    return <tr>
                        <td>{d.account_id}</td>
                        <td>{d.date_of_night}</td>
                        <td className={d.old_time_event == d.new_time_event ? "ok" : "not-ok"}>{d.old_time_event}</td>
                        <td className={d.old_time_event == d.new_time_event ? "ok" : "not-ok"}>{d.new_time_event}</td>
                        <td>{d.event_type}</td>
                        <td>{d.created}</td>
                        <td>{d.old_time_event == d.new_time_event ? "not applicable" : <Button onClick={this.updateFeedback.bind(this, d.created)}>Undo update</Button>}</td>
                    </tr>
                }.bind(this))
            }</tbody>
        </Table>
    }
});
var FeedbackMaster = React.createClass({
    getInitialState: function() {
        return {data: [], error: null};
    },
    getFeedback: function() {
        $.ajax({
            url: "/api/feedback",
            type: "GET",
            data: {night: reformatDate($("#date-input").val()), email: this.refs.emailInput.getDOMNode().value},
            success: function(response) {
                console.log(response);
                if (response.error.isWhiteString() && response.data.length > 0){
                    this.setState({data: response.data, error: null});
                }
                else {
                    this.setState({error: <Alert>No feedback!</Alert>});
                }
            }.bind(this)
        });
        return false;
    },
    render: function() {
        return <div>
            <form onSubmit={this.getFeedback}>
                <Col xs={3} md={3}>
                    <input ref="emailInput" className="form-control" id="email-input" type="text" addonBefore={<Glyphicon glyph="user"/>} placeholder="user email" />
                </Col>
                <LongDatetimePicker size="2" placeHolder="date" id="date-input" pickTime={false} format="MM-DD-YYYY" defaultDate={yesterday} />
                <Button type="submit"><Glyphicon glyph="search"/></Button>
            </form>
            <FeedbackTableResults data={this.state.data} getFeedback={this.getFeedback} />
            {this.state.error}
        </div>
    }
});

React.render(<FeedbackMaster />, document.getElementById("feedback"));
function reformatDate(dateString) {
    var dateComponents = dateString.split("-");
    var year = dateComponents[2];
    var month = dateComponents[0];
    var date = dateComponents[1];
    return [year, month, date].join("-");
}