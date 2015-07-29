/** @jsx React.DOM */

var PAGE_LIMIT = 25;
var QUERY_THROTTLE = 200; //ms

var SenseEventsMaestro = React.createClass({
    getInitialState: function() {
        return {data: [], error: "", cursor: 0, scrollY: 0, haltQuery: false, timer: null, loading: ""}
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
                    if(that.state.haltQuery === false) {
                        that.handleSubmit(true);
                    }
                }, QUERY_THROTTLE)});
            }
            that.setState({scrollY: frames.top.scrollY});
        });
    },

    submitWithInputsFromURL: function() {
        var accountInputFromURL = getParameterByName("account_input");
        if (accountInputFromURL.isWhiteString()){
            return false;
        }
        $('#account-input').val(accountInputFromURL);
        this.handleSubmit(false);
    },

    handleSubmit: function(willRetainOldData) {
        var that = this, accountInput = $('#account-input').val().trim();
        that.setState({loading: "Loading ...", haltQuery: false});
        var startTs = new Date().getTime();
        if (willRetainOldData){
            startTs = that.state.cursor === 0 ? new Date().getTime() : that.state.cursor;
        }

        history.pushState({}, '', '/sense_events/?account_input=' + accountInput);

        if (accountInput.indexOf('@') !== -1) {
            $.ajax({
                url: '/api/device_by_email',
                dataType: 'json',
                type: 'GET',
                data: {email: accountInput, device_type: "sense"},
                async: false,
                success: function (response) {
                    accountInput = response.data[0].device_account_pair.externalDeviceId
                }
            });
        }
        $.ajax({
            url: '/api/sense_events',
            dataType: 'json',
            type: 'GET',
            data: {
                start_ts: startTs,
                device_id: accountInput,
                limit: PAGE_LIMIT
            },
//            async: false,
            success: function(response) {
                console.log("raw events", response);
                that.setState({loading: ""});

                if (response.error.isWhiteString()) {
                    that.setState({error: ""});

                    if (response.data.length > 0){
                        that.setState({cursor: response.data.last().createdAt});
                    }

                    if (response.data.length < PAGE_LIMIT){
                        that.setState({haltQuery: true});
                    }

                    if (that.state.data.length > 0) {
                        if(willRetainOldData) {
                            that.setState({data: that.state.data.concat(response.data.slice(1))});
                        }
                        else {
                            that.setState({data: response.data});
                        }
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
        var loading = this.state.loading === "" ? null : <Alert>{this.state.loading}</Alert>;
        var senseEventsData = this.state.data.map(function(senseEvent){
            var beforeEventTs = d3.time.format('%m/%d/%Y %H:%M:%S')(new Date(senseEvent.createdAt - 5*60*1000));
            var afterEventTs = d3.time.format('%m/%d/%Y %H:%M:%S')(new Date(senseEvent.createdAt + 5*60*1000));
            return <tr>
                <td>{senseEvent.deviceId}</td>
                <td>
                    {d3.time.format('%a %d %b %H:%M:%S %Z')(new Date(senseEvent.createdAt))}
                    &nbsp;
                    <a target="_blank" href={"/sense_logs/?field=device_id&keyword=" + senseEvent.deviceId + "&category=device_id&category_input=&limit=&start=" + beforeEventTs + "&end=" + afterEventTs}>see logs</a>
                </td>
                <td>{senseEvent.events.map(function(event){
                    if (event.indexOf("color") > -1){
                        event = event.replace(/\s+/g, '');
                        var correctedHex = convertChrisHex('#' + event.split(":")[1]);
                        var senseColor = {
                            color: luminate(correctedHex, -0.3),
                            "background-color": correctedHex
                        };
//                        return <p style={senseColor}>{event.replace(event.split(": ")[1], convertChrisHex('#' + event.split(": ")[1]))}</p>
                        return <p>color: <span style={senseColor}>{convertChrisHex('#' + event.split(":")[1])}</span></p>;
                    }
                    return <p>{event.split(":")[0]}: {event.split(":")[1]}</p>
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
            <form className="row" onSubmit={this.handleSubmit.bind(this, false)}>
                <Col xs={4} xsOffset={3}><Input type="text" id="account-input" placeholder="Enter device ID / email"/></Col>
                <Col xs={1}><Button type="submit"><Glyphicon glyph="search"></Glyphicon></Button></Col>
            </form>
            {loading}
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
    if (hexString.length < 7) {
        hexString = "#00" + hexString.split("#")[1];
    }
    else if (hexString.length > 7 && hexString.indexOf("#00") === 0) {
        hexString = "#" + hexString.split("#00")[1];
    }

    var rgb = hexToRgb(hexString);
    if (rgb === null) {
        return hexString;
    }
    return rgbToHex(r=rgb.g, g=rgb.r, b=rgb.b);
}