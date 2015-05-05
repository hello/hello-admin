/** @jsx React.DOM */

var Tile = React.createClass({
    getDefaultProps: function() {
        return {img: "svg/motion.svg"}
    },
    render: function() {
        return <div className={"tile tile-" + this.props.title.toLowerCase().replace(/\s/g, "-")}>
            <div className="tile-title">
                <Row><Col xs={2} className="tile-icon-wrapper"><img className="tile-icon" src={"/static/" + this.props.img}/></Col><Col xs={8}> {this.props.title}</Col></Row>
            </div>
            <br/>
            <div className="tile-content">
                {this.props.content}
            </div>
        </div>
    }
});

var UserBasicProfileTile = React.createClass({
    render: function() {
        var response = this.props.response;
        var partnerResponse = this.props.partnerResponse;
        var alert = response.error.isWhiteString() ? null : <Well>{response.error}</Well>;
        var partner = partnerResponse.error.isWhiteString() && !$.isEmptyObject(partnerResponse) ?
            <a title={partnerResponse.data.name} href={"/account_profile/?account_input=" + partnerResponse.data.email} target="_blank">{partnerResponse.data.email}</a>
            : <span> - </span>;

        var basicProfileTable = ($.isEmptyObject(response.data) || response.data.length === 0) ? null:
            <Table>
                <thead></thead>
                <tbody>
                    <tr><td>ID</td><td>{response.data.id}</td></tr>
                    <tr><td>Name</td><td>{response.data.name}</td></tr>
                    <tr><td>Email</td><td>{response.data.email}</td></tr>
                    <tr><td>Partner</td><td>{partner}</td></tr>
                    <tr><td>Last Modified</td><td>{new Date(response.data.last_modified).toUTCString()}</td></tr>
                    <tr><td/><td/></tr>
                </tbody>
            </Table>;
        return (<div>
            {alert}
            {basicProfileTable}
        </div>)

    }
});

var TimelineTile = React.createClass({
    render: function() {
        var response = this.props.response;
        var timelinePreview,
            lastNightDate =  d3.time.format("%m-%d-%Y")(new Date(new Date().getTime() - 24*3600*1000));
        if (response.data.length > 0) {
            var lastNightScore = response.data[0].score && response.data[0].score > 0 ?
                <Badge className="score-badge">{response.data[0].score}</Badge> : <span className="not-ok">unavailable</span>;
            var lastNightMessage = response.data[0].message ?
                response.data[0].message : <span className="not-ok">unavailable</span>;
            var lastNightInsights = response.data[0].insights && response.data[0].insights.length > 0 ?
                response.data[0].insights.map(function(insight){
                        return <tr><td>{insight.sensor.capitalize()}</td>
                            <td>{debunkMarkdown(insight.message)}</td>
                            </tr>;
                    })
                : <span className="not-ok">unavailable</span>;
            timelinePreview = <Table>
                <thead></thead>
                <tbody>
                    <tr><td>Score</td><td>{lastNightScore}</td></tr>
                    <tr><td>Message</td><td>{debunkMarkdown(lastNightMessage)}</td></tr>
                    {lastNightInsights}
                    <tr><td/><td/></tr>
                </tbody>
            </Table>
        }

        return <div>
            {this.props.status}
            {timelinePreview}
            <p><a target="_blank" href={"/timeline/?email=" + this.props.accountInput + "&date=" + lastNightDate}>See more</a></p>
        </div>
    }
});

var RoomConditionsTile = React.createClass({
    render: function() {
        var nowDateTime = d3.time.format("%m/%d/%Y %H:%M:%S")(new Date());
        return <div>
            <p><a target="_blank" href={"/room_conditions/?email=" + this.props.accountInput + "&until=" + nowDateTime}>Last 7 days</a></p>
        </div>
    }
});

var SenseLogsTile = React.createClass({
    render: function() {
        return <div>
            <p><a target="_blank" href={"/sense_logs/?text=&devices=" + this.props.accountInput + "&max_docs=100&start=&end="}>Last 100 documents</a></p>
        </div>
    }
});

var PillStatusTile = React.createClass({
    render: function() {
        return <div>
            <p><a target="_blank" href={"/battery/?search=" + this.props.accountInput + "&end_ts="}>Last 336 heartbeats</a></p>
        </div>
    }
});

var SenseEventsTile = React.createClass({
    render: function() {
        return <div>
            <p><a target="_blank" href={"/sense_events/?account_input=" + this.props.accountInput + "&start_ts=" + new Date().getTime()}>Last 25 events</a></p>
        </div>
    }
});

var MotionTile = React.createClass({
    render: function() {
        var lastNightDate =  d3.time.format("%m-%d-%Y")(new Date(new Date().getTime() - 24*3600*1000));
        return <div>
            <p><a target="_blank" href={"/motion/?email=" + this.props.accountInput + "&date=" + lastNightDate}>Last Night</a></p>
        </div>
    }
});

var ZendeskTile = React.createClass({
    render: function() {
        var zendeskResponse = this.props.zendeskResponse, ticketsCount = 0;
        if (zendeskResponse.error.isWhiteString() && !$.isEmptyObject(zendeskResponse.data) && zendeskResponse.data.tickets.length > 0) {
            ticketsCount = zendeskResponse.data.count;
            var zendeskTickets = <ReactBootstrap.Carousel index={0} pause="true" interval={Math.pow(10, 10)}>
                {zendeskResponse.data.tickets.map(function(ticket){
                    var ticketURL = "https://helloinc.zendesk.com/tickets/" + ticket.id;
                    var ticketFrom = Object.keys(ticket.via.source.from).map(function(k){return ticket.via.source.from[k]}).join(" | ") || ticket.via.channel;
                    var ticketTags = <em>{ticket.tags.join(", ")}</em>;
                    return <ReactBootstrap.CarouselItem>
                        <div className="zendesk-well">
                            <Table>
                                <thead/>
                                <tbody>
                                    <tr><td>Created</td><td>{new Date(ticket.created_at).toString()}</td></tr>
                                    <tr><td>From</td><td>{ticketFrom}</td></tr>
                                    <tr><td>To</td><td>{ticket.recipient}</td></tr>
                                    <tr><td>Subject</td><td>{ticket.subject}</td></tr>
                                    <tr><td>Tags</td><td>{ticketTags}</td></tr>
                                    <tr><td>Updated</td><td>{new Date(ticket.updated_at).toString()}</td></tr>
                                    <tr><td>Status</td><td>{ticket.status}</td></tr>
                                    <tr><td>URL</td><td><a target="_blank" href={ticketURL}>{ticketURL}</a></td></tr>
                                    <tr><td/><td/></tr>
                                </tbody>
                            </Table>
                        </div>
                    </ReactBootstrap.CarouselItem>;
                })}</ReactBootstrap.Carousel>;
        }
        return <div>
            <div>&nbsp;&Sigma; = {ticketsCount}</div>
            {this.props.status}
            {zendeskTickets}
        </div>
    }
});

var SenseSummary = React.createClass({
    loadUnhashedFirmware: function(version) {
        $.ajax({
            url: "/api/firmware_unhash",
            dataType: 'json',
            type: 'GET',
            async: false,
            data: {version: version},
            success: function(response) {
                if (response.error.isWhiteString()) {
                    version = <span>
                        {version || <span className="not-ok">unknown-hashed</span>}<span> (</span>
                        {response.data.join(", ") || <span className="not-ok">unknown-unhashed</span>}<span>)</span>
                    </span>;
                }
            }
        });
        return version;
    },
    render: function() {
        var senseInfoResponse = this.props.senseInfoResponse,
            senseKeyStoreResponse = this.props.senseKeyStoreResponse,
            timezoneResponse = this.props.timezoneResponse,
            result = null, lastSeen, keyStore;

        var timezone = <span>{timezoneResponse.error.isWhiteString() && !$.isEmptyObject(timezoneResponse) ?
            timezoneResponse.data.timezone_id : "-" }</span>;

        if (senseKeyStoreResponse.error.isWhiteString() && !$.isEmptyObject(senseKeyStoreResponse.data)) {
            if(senseKeyStoreResponse.data.key) {
                keyStore = senseKeyStoreResponse.data.key.slice(senseKeyStoreResponse.data.key.length-7, senseKeyStoreResponse.data.key.length);
            }
            else {
                keyStore = <span className="not-ok">unprovisioned</span>;
            }
        }

        if (senseInfoResponse.data.length > 0) {
            var senseId = senseInfoResponse.data[0].device_account_pair ? senseInfoResponse.data[0].device_account_pair.externalDeviceId : undefined;
            var firmwareVersion = senseInfoResponse.data[0].device_status ? senseInfoResponse.data[0].device_status.firmwareVersion : undefined;

            if (senseInfoResponse.data[0].device_status){
                var lastSeenEpoch = senseInfoResponse.data[0].device_status.lastSeen;
                lastSeen = <span className={lastSeenEpoch < new Date().getTime() - 3600*1000 ? "not-ok" : "ok"}>
                    {new Date(lastSeenEpoch).toUTCString()}</span>;
            }

            result = <Table>
                <tbody>
                    <tr><td>ID</td><td>{senseId}</td></tr>
                    <tr><td>Keystore</td><td>{keyStore}</td></tr>
                    <tr><td>Firmware</td><td>{this.loadUnhashedFirmware(firmwareVersion)}</td></tr>
                    <tr><td>Timezone</td><td>{timezone}</td></tr>
                    <tr><td>Last Seen</td><td>{lastSeen}</td></tr>
                    <tr><td/><td/></tr>
                </tbody>
            </Table>;
        }

        return !senseInfoResponse.error.isWhiteString ?
            <Well>{senseInfoResponse.error}</Well>: result;
    }
});

var PillSummary = React.createClass({
    render: function() {
        var pillInfoResponse = this.props.pillInfoResponse,
            pillStatusResponse = this.props.pillStatusResponse,
            pillKeyStoreResponse = this.props.pillKeyStoreResponse,
            result = null, batteryLevel, lastSeen, keyStore, uptime;

        if (pillStatusResponse.data.length > 0) {
            if(pillStatusResponse.data[0][0]) {
                batteryLevel = pillStatusResponse.data[0][0].batteryLevel;
                var lastSeenEpoch = pillStatusResponse.data[0][0].lastSeen;
                lastSeen = <span className={lastSeenEpoch < new Date().getTime() - 4*3600*1000 ? "not-ok" : "ok"}>
                    {new Date(lastSeenEpoch).toUTCString()}</span>;
                uptime = millisecondsToHumanReadableString(pillStatusResponse.data[0][0].uptime * 1000);
            }
            else {
                batteryLevel = <span className="not-ok">-</span>;
                lastSeen = <span className="not-ok">-</span>;
                uptime = <span className="not-ok">-</span>;

            }
        }

        if (pillKeyStoreResponse.error.isWhiteString() && !$.isEmptyObject(pillKeyStoreResponse.data)) {
            if(pillKeyStoreResponse.data.key) {
                keyStore = pillKeyStoreResponse.data.key.slice(pillKeyStoreResponse.data.key.length-7, pillKeyStoreResponse.data.key.length);
            }
            else {
                keyStore = <span className="not-ok">unprovisioned</span>;
            }
        }

        if (pillInfoResponse.data.length > 0) {
            var pillId = pillInfoResponse.data[0].device_account_pair ? pillInfoResponse.data[0].device_account_pair.externalDeviceId : undefined;
            result = <Table>
                <thead/>
                <tbody>
                    <tr><td>ID</td><td>{pillId}</td></tr>
                    <tr><td>Keystore</td><td>{keyStore}</td></tr>
                    <tr><td>Battery</td><td>{batteryLevel}</td></tr>
                    <tr><td>Uptime</td><td>{uptime}</td></tr>
                    <tr><td>Last Seen</td><td>{lastSeen}</td></tr>
                    <tr><td/><td/></tr>
                </tbody>
            </Table>;
        }

        return !pillInfoResponse.error.isWhiteString ?
            <Well>{pillInfoResponse.error}</Well>: result;
    }
});

var AccountProfile = React.createClass({
    getInitialState: function() {
        return {
            basicProfileResponse: {data: {}, error: ""},
            senseInfoResponse: {data: [], error: ""},
            pillInfoResponse: {data: [], error: ""},
            pillStatusResponse: {data: [], error: ""},
            senseKeyStoreResponse: {data: {}, error: ""},
            pillKeyStoreResponse: {data: {}, error: ""},
            timelineResponse: {data: [], error: ""},
            partnerResponse: {data: {}, error: ""},
            timezoneResponse: {data: {}, error: ""},
            zendeskResponse: {data: {}, error: ""},
            accountInput: "",
            submitted: false,
            timelineStatus: null,
            zendeskStatus: null
        }
    },

    componentDidMount: function() {
        var accountInputFromURL = getParameterByName("account_input"), that = this;
        if (accountInputFromURL){
            this.refs.accountInput.getDOMNode().value = accountInputFromURL;
            that.handleSubmit();
        }
    },

    loadBasicProfile: function() {
        var that = this;
        $.ajax({
            url: "/api/user_search",
            dataType: 'json',
            type: "GET",
            data: {search_input: that.refs.accountInput.getDOMNode().value.trim(), search_method: "email"},
            success: function (response) {
                that.setState({basicProfileResponse: response});
            }
        });
    },

    loadSenseInfo: function() {
        var that = this;
        $.ajax({
            url: '/api/device_by_email',
            dataType: 'json',
            type: 'GET',
            data: {email: that.refs.accountInput.getDOMNode().value.trim(), device_type: "sense"},
            success: function (response) {
                console.log(response);
                that.setState({senseInfoResponse: response});
                if (response.data.length > 0) {
                    if (response.data[0].device_account_pair) {
                        if (response.data[0].device_account_pair.externalDeviceId) {
                            var senseId = response.data[0].device_account_pair.externalDeviceId;
                            that.loadSenseKeyStore(senseId);
                        }
                    }
                }
            }
        });
    },

    loadPillInfo: function() {
        var that = this;
        $.ajax({
            url: '/api/device_by_email',
            dataType: 'json',
            type: 'GET',
            data: {email: that.refs.accountInput.getDOMNode().value.trim(), device_type: "pill"},
            success: function (response) {
                that.setState({pillInfoResponse: response});
                if (response.data.length > 0) {
                    if (response.data[0].device_account_pair) {
                        if (response.data[0].device_account_pair.externalDeviceId) {
                            var pillId = response.data[0].device_account_pair.externalDeviceId;
                            that.loadPillStatus(pillId);
                            that.loadPillKeyStore(pillId);
                        }
                    }
                }
            }
        });
    },

    loadPillStatus: function(pillId) {
        var that = this;
        $.ajax({
            aysnc: false,
            url: '/api/battery',
            dataType: 'json',
            type: 'GET',
            data: {search_input: pillId, end_ts: new Date().getTime()},
            success: function (response) {
                that.setState({pillStatusResponse: response});
            }
        });
    },

    loadSenseKeyStore: function(senseId) {
        var that = this;
        $.ajax({
            aysnc: false,
            url: "/api/devices/key_store",
            dataType: 'json',
            type: 'GET',
            data: {device_id: senseId, device_type: "sense"},
            success: function (response) {
                that.setState({senseKeyStoreResponse: response});
            }
        });
    },

    loadPillKeyStore: function(pillId) {
        var that = this;
        $.ajax({
            aysnc: false,
            url: "/api/devices/key_store",
            dataType: 'json',
            type: 'GET',
            data: {device_id: pillId, device_type: "pill"},
            success: function (response) {
                that.setState({pillKeyStoreResponse: response});
            }
        });
    },

    loadTimeline: function() {
        var that = this;
        that.setState({timelineStatus: <div className="loader"><img src="/static/image/loading.gif" /></div>});
        $.ajax({
            url: "/api/timeline",
            dataType: "json",
            type: 'GET',
            data: {email: that.refs.accountInput.getDOMNode().value.trim(), date: d3.time.format("%Y-%m-%d")(new Date(new Date().getTime() - 24*3600*1000))},
            success: function (response) {
                if (response.error.isWhiteString()) {
                    that.setState({timelineResponse: response, timelineStatus: null});
                }
                else {
                    that.setState({timelineResponse: response, timelineStatus: <Well>{response.error}</Well>});
                }
            }
        });
    },

    loadPartner: function() {
        var that = this;
        $.ajax({
            url: "/api/user_search",
            dataType: "json",
            type: 'GET',
            data: {search_input: that.refs.accountInput.getDOMNode().value.trim(), search_method: "partner"},
            success: function (response) {
                that.setState({partnerResponse: response});
            }
        });
    },

    loadTimezone: function() {
        var that = this;
        $.ajax({
            url: "/api/timezone",
            dataType: "json",
            type: 'GET',
            data: {email: that.refs.accountInput.getDOMNode().value.trim(), event_ts: new Date().getTime()},
            success: function (response) {
                that.setState({timezoneResponse: response})
            }
        });
    },

    loadZendeskTickets: function() {
        var that = this;
        that.setState({zendeskStatus: <div className="loader"><img src="/static/image/loading.gif" /></div>});
        $.ajax({
            url: "/api/zendesk",
            dataType: "json",
            type: 'GET',
            data: {email: that.refs.accountInput.getDOMNode().value.trim()},
            success: function (response) {
                  if (response.error.isWhiteString()) {
                    that.setState({zendeskResponse: response, zendeskStatus: null});
                }
                else {
                    that.setState({zendeskResponse: response, zendeskStatus: <Well>{response.error}</Well>});
                }
            }
        });
    },

    handleSubmit: function() {
        history.pushState({}, '', '/account_profile/?account_input=' + this.refs.accountInput.getDOMNode().value.trim());
        this.setState(this.getInitialState());
        this.setState({accountInput: this.refs.accountInput.getDOMNode().value.trim()});

        this.loadSenseInfo();
        this.loadPillInfo();
        this.loadBasicProfile();
        this.loadTimezone();
        this.loadPartner();
        this.loadTimeline();
        this.loadZendeskTickets();

        this.setState({submitted: true});
        return false;
    },

    render: function() {
        var results = this.state.submitted === false ? null :
            <div><Row>
                <Col xs={4}><Tile img="svg/sleep.svg" title="Basic Info" img="svg/sleep.svg" content={<UserBasicProfileTile response={this.state.basicProfileResponse} accountInput={this.state.accountInput} partnerResponse={this.state.partnerResponse} />} /></Col>
                <Col xs={4}><Tile img="image/sense-bw.png" title="Sense Summary" content={<SenseSummary senseInfoResponse={this.state.senseInfoResponse} senseKeyStoreResponse={this.state.senseKeyStoreResponse} timezoneResponse={this.state.timezoneResponse} accountInput={this.state.accountInput} />} /></Col>
                <Col xs={4}><Tile img="image/pill-bw.png" title="Pill Summary" content={<PillSummary pillInfoResponse={this.state.pillInfoResponse} pillStatusResponse={this.state.pillStatusResponse} pillKeyStoreResponse={this.state.pillKeyStoreResponse} accountInput={this.state.accountInput} />} /></Col>
            </Row>
            <Row>
                <Col xs={4}><Tile img="svg/timeline.svg" title="Timeline" content={<TimelineTile accountInput={this.state.accountInput} response={this.state.timelineResponse} status={this.state.timelineStatus} />} /></Col>
                <Col xs={4}><Tile img="svg/room_conditions.svg" title="Room Conditions" content={<RoomConditionsTile accountInput={this.state.accountInput} />} /></Col>
                <Col xs={4}><Tile img="svg/motion.svg" title="Motion "content={<MotionTile accountInput={this.state.accountInput}/>} /></Col>
            </Row>
            <Row>
                <Col xs={4}><Tile img="svg/sense_logs.svg" title="Sense Logs" content={<SenseLogsTile accountInput={this.state.accountInput} />} /></Col>
                <Col xs={4}><Tile img="svg/sense_events.svg" title="Sense Events" content={<SenseEventsTile accountInput={this.state.accountInput} />} /></Col>
                <Col xs={4}><Tile img="svg/pill_status.svg" title="Pill Status" content={<PillStatusTile accountInput={this.state.accountInput} />} /></Col>
            </Row>
            <Row>
                <Col md={8}><Tile img="svg/zendesk.svg" title="Zendesk" content={<ZendeskTile accountInput={this.state.accountInput} zendeskResponse={this.state.zendeskResponse} zendeskStatus={this.props.zendeskStatus} />} /></Col>
            </Row></div>;
        return <div>
            <Row><Col id="submit" xs={6} xsOffset={3}><form onSubmit={this.handleSubmit}>
                <div className="icon-addon addon-md">
                    <input className="form-control" type="text" id="account-input" ref="accountInput" placeholder="email please"/>
                    <Glyphicon className="cursor-hand" id="submit" glyph="search" onClick={this.handleSubmit}/>
                </div>
            </form></Col></Row>
            <br/><br/>
            {results}
        </div>;
    }
});

React.renderComponent(<AccountProfile />, document.getElementById('account-profile'));

function debunkMarkdown(md) {
    var partials = md.match(/(.*?)(\*\*)(.*?)(\*\*)(.*?)/);
    if (!partials) {
        return <span/>
    }
    return <span>{partials[1]}<span className="stress">{partials[3]}</span>{partials[5]}</span>;
}