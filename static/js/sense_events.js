/** @jsx React.DOM */

var PAGE_LIMIT = 25;
var QUERY_THROTTLE = 200; //ms

var SenseEventsMaestro = React.createClass({
    getInitialState: function() {
        return {data: [], error: "", cursor: 0, scrollY: 0, haltQuery: false, timer: null}
    },

    componentDidMount: function() {
        this.submitWithInputsFromURL();
        this.submitWheneverScrollToBottom();
    },

    submitWheneverScrollToBottom : function() {
        var that = this;
        $(window).on("scroll", function() {
            if (frames.top.scrollY > that.state.scrollY && $(window).scrollTop() + $(window).height() == getDocHeight()) {
                clearTimeout(that.state.timer);
                that.setState({timer: setTimeout(function(){
                    that.handleSubmit();
                }, QUERY_THROTTLE)});
            }
            that.setState({scrollY: frames.top.scrollY});
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

    emptyDataStoredInState: function() {
        this.setState({data: [], error: "", cursor: 0, scrollY: 0, haltQuery: false, timer: null});
    },

    handleSubmit: function() {
        var that = this, deviceId = $('#device-id-input').val();
        var startTs = that.state.cursor === 0 ? new Date().getTime() : that.state.cursor;

        if (that.state.currentDeviceId !== deviceId) {
            that.emptyDataStoredInState();
            startTs = new Date().getTime();
        }
        that.setState({currentDeviceId: deviceId});

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
                    that.setState({error: ""});

                    if (response.data.length > 0){
                        that.setState({cursor: response.data.last().createdAt});
                    }

                    if (response.data.length < PAGE_LIMIT){
                        that.setState({haltQuery: true});
                    }

                    if (that.state.data.length > 0) {
                        that.setState({data: that.state.data.concat(response.data.slice(1))});
                    }
                    else {
                        that.setState({data: response.data})
                    }
                }
                else {
                    that.setState({data: [], error: response.status});
                }
            }
        });
        return false;
    },
    render: function() {
        var senseEventsData = this.state.data.map(function(senseEvent){
            return <tr>
                <td>{senseEvent.deviceId}</td>
                <td>{d3.time.format('%a %d %b %H:%M:%S %Z')(new Date(senseEvent.createdAt))}</td>
                <td>{senseEvent.events.map(function(event){
                    if (event.indexOf("color") > -1){
                        var correctedHex = convertChrisHex('#' + event.split(": ")[1]);
                        var senseColor = {
                            color: luminate(correctedHex, -0.3),
                            "background-color": correctedHex
                        };
//                        return <p style={senseColor}>{event.replace(event.split(": ")[1], convertChrisHex('#' + event.split(": ")[1]))}</p>
                        return <p>color:<span style={senseColor}> {convertChrisHex('#' + event.split(": ")[1])}</span></p>;
                    }
                    return <p>{event}</p>
                })}</td>
            </tr>
        });

        var alert = this.state.haltQuery === false ? null : <Alert> No more older events found! </Alert>;

        if (this.state.error !== "") {
            alert = <Alert> {this.state.error} </Alert>
        }

        var results = this.state.error !== "" ? null :
            <Table id="events-table" striped>
                <thead>
                    <tr>
                        <th>Device ID</th>
                        <th>Created At</th>
                        <th>Events</th>
                    </tr>
                </thead>
                <tbody>
                    {senseEventsData}
                </tbody>
            </Table>;

        return (<div>
            <form className="row" onSubmit={this.handleSubmit}>
                <Col xs={4} xsOffset={3}><Input type="text" id="device-id-input" placeholder="Enter device ID"/></Col>
                <Col xs={1}><Button type="submit"><Glyphicon glyph="search"></Glyphicon></Button></Col>
            </form>
            <Row>{results}</Row>
            {alert}
        </div>)
    }
});

React.renderComponent(<SenseEventsMaestro />, document.getElementById('sense-events'));

function getDocHeight() {
    var D = document;
    return Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.offsetHeight, D.documentElement.offsetHeight,
        D.body.clientHeight, D.documentElement.clientHeight
    );
}

function convertChrisHex(hexString) {
    var rgb = hexToRgb(hexString);
    if (rgb === null) {
        return hexString;
    }
    return rgbToHex(r=rgb.g, g=rgb.r, b=rgb.b);
}