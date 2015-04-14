/** @jsx React.DOM */

var PAGE_LIMIT = 10;

var SenseEventsMaestro = React.createClass({
    getInitialState: function() {
        return {data: [], error: "", cursor: 0}
    },

    componentDidMount: function() {
        var that = this;
        that.submitWithInputsFromURL();
        $(window).scroll(function() {
            if (  document.documentElement.clientHeight +
                $(document).scrollTop() >= document.body.offsetHeight )
            {
                console.log("current cursor is", that.state.cursor);
                that.handleSubmit();
            }
        });
    },

    submitWithInputsFromURL: function() {
        var deviceIdFromURL = getParameterByName("device_id");
        if (deviceIdFromURL.isWhiteString()){
            return false;
        }
        $('#device-id-input').val(deviceIdFromURL);
        this.handleSubmit();
    },

    handleSubmit: function() {
        var that = this, deviceId = $('#device-id-input').val();
        var startTs = that.state.cursor === 0 ? new Date().getTime() : that.state.cursor;
        console.log("Submitting with start ts", startTs);
        history.pushState({}, '', '/sense_events/?device_id=' + deviceId + '&start_ts=' + startTs);
        $.ajax({
            url: '/api/sense_events',
            dataType: 'json',
            type: 'GET',
            data: {
                start_ts: startTs,
                device_id: deviceId,
                limit: PAGE_LIMIT
            },
            success: function(response) {
                console.log(response);
                if (response.error.isWhiteString()) {
                    that.setState({data: response.data.reverse(), error: ""});
                    if (response.data.length > 0){
                        that.setState({cursor: response.data.last().createdAt});
                    }
                }
                else {
                    that.setState({data: [], error: response.error});
                }
            }
        });
        return false;
    },
    render: function() {
        var results = !this.state.error.isWhiteString() ? null :
            <Table striped>
                <thead>
                    <tr>
                        <th>Device ID</th>
                        <th>Created At</th>
                        <th>Events</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.data.map(function(senseEvent){
                        return <tr>
                            <td>{senseEvent.deviceId}</td>
                            <td>{new Date(senseEvent.createdAt).toString()}</td>
                            <td>{senseEvent.events}</td>
                        </tr>
                    })}
                </tbody>
            </Table>;
        return (<div>
            <form className="row" onSubmit={this.handleSubmit}>
                <Col xs={4} xsOffset={3}><Input type="text" id="device-id-input" placeholder="Enter device ID"/></Col>
                <Col xs={1}><Button type="submit"><Glyphicon glyph="search"></Glyphicon></Button></Col>
            </form>
            <Row>{results}</Row>
        </div>)
    }
});

React.renderComponent(<SenseEventsMaestro />, document.getElementById('sense-events'));