var DropoutDevices= React.createClass({
    getInitialState: function() {
        return {error: null,  data: []}
    },
    handleSubmit: function() {
        $.ajax({
            url: "/api/dropout_devices",
            dataType: "json",
            data: {
                device_type: this.props.deviceType,
                before: reformatDate($("#before").val()),
                after: reformatDate($("#after").val())
            },
            type: "GET",
            success: function(response) {
                this.setState(response);
            }.bind(this)
        });
        return false;
    },
    render: function() {
        var results = this.state.data.length === 0 ? null :
            <Col xs={12} className="results">
                <div>Total: {this.state.data.length}</div>
                <br/>
                <ul>{
                    this.state.data.map(function(d){
                        return [<Button bsSize="xsmall">
                            <a target="_blank" href={"account_profile/?input=" + d + "&type=" + this.props.deviceType + "_id"}>{d}</a>
                        </Button>, <span>&nbsp;</span>]
                    }.bind(this))
                }</ul>
            </Col>;
        return <div>
            <form onSubmit={this.handleSubmit}>
                <LongDatetimePicker size={5} glyphicon="clock" placeHolder="before date" id={this.props.deviceType + "-before"}/>
                <LongDatetimePicker size={5} glyphicon="clock" placeHolder="after date" id={this.props.deviceType + "-after"}/>
                <Col xs={2}>
                    <Button type="submit"><Glyphicon glyph="search"/></Button>
                </Col>
            </form>
            {results}
        </div>
    }
});


React.render(<DropoutDevices deviceType="sense" />, document.getElementById("dropout-senses"));
React.render(<DropoutDevices deviceType="pill" />, document.getElementById("dropout-pills"));

function reformatDate(dateTimeString) {
    var dateString = dateTimeString.split(" ")[0];
    var dateComponents = dateString.split("/");
    var year = dateComponents[2];
    var month = dateComponents[0];
    var date = dateComponents[1];
    var hour = dateTimeString.split(" ")[1].split(":")[0];
    return [year, month, date, hour, "00"].join("_");
}