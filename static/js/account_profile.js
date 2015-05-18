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

var AccountTile = React.createClass({
    render: function() {
        var partnerLink = this.props.partner ? <a
                title={this.props.partner.name} target="_blank"
                href={"/account_profile/?type=email&input=" + this.props.partner.email}>
            {this.props.partner.email}</a> : "-";
        return <Table>
            <thead></thead>
            <tbody>
                <tr><td>ID</td><td>{this.props.account.id}</td></tr>
                <tr><td>Name</td><td>{this.props.account.name}</td></tr>
                <tr><td>Email</td><td>{this.props.account.email}</td></tr>
                <tr><td>Partner</td><td>{partnerLink}</td></tr>
                <tr><td>Last Modified</td><td>{new Date(this.props.account.last_modified).toUTCString()}</td></tr>
                <tr><td/><td/></tr>
            </tbody>
        </Table>
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
            <p><a target="_blank" href={"/timeline/?email=" + this.props.email + "&date=" + lastNightDate}>See more</a></p>
        </div>
    }
});

var RoomConditionsTile = React.createClass({
    render: function() {
        var nowDateTime = d3.time.format("%m/%d/%Y %H:%M:%S")(new Date());
        var temperatureData = this.props.lastRoomConditionsResponse.data.temperature;
        var humidityData = this.props.lastRoomConditionsResponse.data.humidity;
        var lightData = this.props.lastRoomConditionsResponse.data.light;
        var soundData = this.props.lastRoomConditionsResponse.data.sound;

        var particulatesResponseData = this.props.particulatesResponse.data ? this.props.particulatesResponse.data.filter(purgeSentinels) : [];
        var latestTemperature = temperatureData && !$.isEmptyObject(temperatureData) && temperatureData.value != undefined ?
            [<td>{temperatureData.value.toFixed(2)}</td>, <td>{"°" + temperatureData.unit.toUpperCase()}</td>]
            :[<td><img className="loading-inline" src="/static/image/loading.gif" /></td>, <td/>];
        var latestHumidity = humidityData && !$.isEmptyObject(humidityData) && humidityData.value != undefined ?
            [<td>{humidityData.value.toFixed(2)}</td>, <td>{humidityData.unit}</td>]
            :[<td><img className="loading-inline" src="/static/image/loading.gif" /></td>, <td/>];
        var latestLight = lightData && !$.isEmptyObject(lightData) && lightData.value != undefined ?
            [<td>{lightData.value.toFixed(2)}</td>, <td>{lightData.unit}</td>]
            :[<td><img className="loading-inline" src="/static/image/loading.gif" /></td>, <td/>];
        var latestSound = soundData && !$.isEmptyObject(soundData) && soundData.value != undefined?
            [<td>{soundData.value.toFixed(2)}</td>, <td>{soundData.unit}</td>]
            :<td><img className="loading-inline" src="/static/image/loading.gif" /></td>;

        var latestParticulates = particulatesResponseData.length > 0 ?
            [<td>{particulatesResponseData[particulatesResponseData.length - 1].value.toFixed(2)}</td>, <td>µg/m³</td>]
            :[<td><img className="loading-inline" src="/static/image/loading.gif" /></td>, <td/>];

        var lastReadingTs = temperatureData && !$.isEmptyObject(temperatureData) ?
            new Date(temperatureData.last_updated_utc).toUTCString() : null;
        return <div>
            <p>Last Reading: {lastReadingTs}</p><br/>
            <Table>
                <thead></thead>
                <tbody>
                    <tr><td>Temperature</td>{latestTemperature}</tr>
                    <tr><td>Humidity</td>{latestHumidity}</tr>
                    <tr><td>Light</td>{latestLight}</tr>
                    <tr><td>Sound</td>{latestSound}</tr>
                    <tr><td>Particulates</td>{latestParticulates}</tr>
                    <tr><td/><td/><td/></tr>
                </tbody>
            </Table>
            <p><a target="_blank" href={"/room_conditions/?email=" + this.props.email + "&until=" + nowDateTime}>Last "Day" (not necessarily 24 hours)</a></p>
        </div>
    }
});


var WifiTile = React.createClass({
    render: function() {
        var response = this.props.wifiResponse;
        var networksTable = response.data.networks && response.data.networks.length > 0 ? <Table>
            <thead>
                <tr><th>Name</th><th>Security</th><th>Strength</th></tr>
            </thead>
            <tbody>
                    {response.data.networks.map(function(w){return <tr><td>{w.network_name}</td><td>{w.network_security}</td><td>{w.signal_strength}</td></tr>;})}
            </tbody>
        </Table> : null;

        return <div>
            {networksTable}
            <p> Last Scan: {response.data.scan_time ? new Date(Number(response.data.scan_time) * 1000).toUTCString() : <img className="loading-inline" src="/static/image/loading.gif" />}</p>
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
        var senseResponse = this.props.senseResponse,
            senseKeyStoreResponse = this.props.senseKeyStoreResponse,
            timezoneResponse = this.props.timezoneResponse,
            result = null, lastSeen = null, keyStore = null;

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

        if (senseResponse.data.length > 0) {
            var senseId = senseResponse.data[0].device_account_pair ? senseResponse.data[0].device_account_pair.externalDeviceId : undefined;
            var firmwareVersion = senseResponse.data[0].device_status ? senseResponse.data[0].device_status.firmwareVersion : undefined;

            if (senseResponse.data[0].device_status){
                var lastSeenEpoch = senseResponse.data[0].device_status.lastSeen;
                lastSeen = <span className={lastSeenEpoch < new Date().getTime() - 3600*1000 ? "not-ok" : "ok"}>
                    {new Date(lastSeenEpoch).toUTCString()}</span>;
            }
            var lastPairingTs = senseResponse.data[0].pairing_ts ?
                new Date(senseResponse.data[0].pairing_ts).toUTCString() : null;

            result = <div>
                <Table>
                    <tbody>
                        <tr><td>ID</td><td>{senseId}</td></tr>
                        <tr><td>Keystore</td><td>{keyStore}</td></tr>
                        <tr><td>Firmware</td><td>{this.loadUnhashedFirmware(firmwareVersion)}</td></tr>
                        <tr><td>Timezone</td><td>{timezone}</td></tr>
                        <tr><td>Last Seen</td><td>{lastSeen}</td></tr>
                        <tr><td>Last Pairing</td><td>{lastPairingTs}</td></tr>
                        <tr><td/><td/></tr>
                    </tbody>
                </Table>
                <p><a target="_blank" href={"/sense_logs/?text=&devices=" + senseId + "&max_docs=100&start=&end="}>Last 100 sense logs</a></p>
                <p><a target="_blank" href={"/sense_events/?account_input=" + senseId + "&start_ts=" + new Date().getTime()}>Last 25 events</a></p>
            </div>;
        }

        return !senseResponse.error.isWhiteString ?
            <Well>{senseResponse.error}</Well>: result;
    }
});

var PillSummary = React.createClass({
    render: function() {
        var pillResponse = this.props.pillResponse,
            pillStatusResponse = this.props.pillStatusResponse,
            pillKeyStoreResponse = this.props.pillKeyStoreResponse,
            result = null, batteryLevel = null, lastSeen = null, keyStore = null, uptime = null;

        if (pillStatusResponse.data.length > 0) {
            if(pillStatusResponse.data[0][0]) {
                batteryLevel = pillStatusResponse.data[0][0].batteryLevel ?
                    <span>{pillStatusResponse.data[0][0].batteryLevel + " %"}</span> : null;
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

        if (pillResponse.data.length > 0) {
            var pillId = pillResponse.data[0].device_account_pair ? pillResponse.data[0].device_account_pair.externalDeviceId : undefined;
            var lastNightDate =  d3.time.format("%m-%d-%Y")(new Date(new Date().getTime() - 24*3600*1000));
            result = <div><Table>
                <thead/>
                <tbody>
                    <tr><td>ID</td><td>{pillId}</td></tr>
                    <tr><td>Keystore</td><td>{keyStore}</td></tr>
                    <tr><td>Battery</td><td>{batteryLevel}</td></tr>
                    <tr><td>Uptime</td><td>{uptime}</td></tr>
                    <tr><td>Last Seen</td><td>{lastSeen}</td></tr>
                    <tr><td>Last Pairing</td><td>{new Date(pillResponse.data[0].pairing_ts).toUTCString()}</td></tr>
                    <tr><td/><td/></tr>
                </tbody>
            </Table>
                <p><a target="_blank" href={"/battery/?search=" + pillId + "&end_ts="}>Last 336 pill heartbeats</a></p>
                <p><a target="_blank" href={"/motion/?email=" + this.props.email + "&date=" + lastNightDate}>Last night motion</a></p></div>;
        }

        return !pillResponse.error.isWhiteString ?
            <Well>{pillResponse.error}</Well>: result;
    }
});

var AccountProfile = React.createClass({
    getInitialState: function() {
        return {
            senseResponse: {data: [], error: ""},
            pillResponse: {data: [], error: ""},
            pillStatusResponse: {data: [], error: ""},
            senseKeyStoreResponse: {data: {}, error: ""},
            pillKeyStoreResponse: {data: {}, error: ""},
            timelineResponse: {data: [], error: ""},
            timezoneResponse: {data: {}, error: ""},
            zendeskResponse: {data: {}, error: ""},
            temperatureResponse: {data: [], error: ""},
            humidityResponse: {data: [], error: ""},
            particulatesResponse: {data: [], error: ""},
            lightResponse: {data: [], error: ""},
            soundResponse: {data: [], error: ""},
            wifiResponse: {data: {}, error: ""},
            lastRoomConditionsResponse: {data: {}, error: ""},
            accountInput: "",
            timelineStatus: null,
            zendeskStatus: null,
            searchType: "email",
            hits: [],
            email: "",
            senseId: "",
            pillId: "",
            accountError: undefined,
            partner: undefined,
            account: undefined
        }
    },

    clearProfile: function() {
        this.setState({
            senseResponse: {data: [], error: ""},
            pillResponse: {data: [], error: ""},
            pillStatusResponse: {data: [], error: ""},
            senseKeyStoreResponse: {data: {}, error: ""},
            pillKeyStoreResponse: {data: {}, error: ""},
            timelineResponse: {data: [], error: ""},
            timezoneResponse: {data: {}, error: ""},
            zendeskResponse: {data: {}, error: ""},
            temperatureResponse: {data: [], error: ""},
            humidityResponse: {data: [], error: ""},
            particulatesResponse: {data: [], error: ""},
            lightResponse: {data: [], error: ""},
            soundResponse: {data: [], error: ""},
            wifiResponse: {data: {}, error: ""},
            lastRoomConditionsResponse: {data: {}, error: ""},
            senseId: "",
            pillId: ""
        })
    },

    componentDidMount: function() {
        var inputFromURL = getParameterByName("input"),
            typeFromURL = getParameterByName("type");
        if (inputFromURL){
            this.refs.accountInput.getDOMNode().value = inputFromURL;
            this.setState({searchType: typeFromURL});
            this.handleSubmit();
        }
    },

    getPlaceholder: function(searchType) {
        switch (searchType) {
            case "email": return "Enter Account Email"; break;
            case "name": return "Enter Name Partials"; break;
            case "account_id": return "Enter Account ID"; break;
            case "sense_id": return "Enter Sense ID"; break;
            case "pill_id": return "Enter Pill ID"; break;
            default: return "Enter Account Email";
        }
    },

    clearHits: function() {
//        this.setState({hits: []});
        $(".btn-group").hide();

    },

    loadAccount: function(input, type, clearProfile) {
        if (clearProfile) {
            this.clearProfile();
        }
        $.ajax({
            url: "/api/user_search",
            dataType: 'json',
            type: "GET",
            data: {input: input, type: type},
            success: function (response) {
                if (!response.error.isWhiteString()) {
                    this.setState({accountError: <Alert>{response.error}</Alert>});
                }
                else if (response.data.length === 0) {
                    this.setState({accountError: <Alert>Account Not Found !</Alert>});
                }
                else {
                    this.loadProfile(response.data[0].email);
                    this.setState({
                        email: response.data[0].email,
                        accountError: null,
                        account: response.data[0]
                    });
                    if (response.data.length > 1) {
                        this.setState({
                            hits: <div className="center-wrapper"><ButtonGroup>
                                <Button disabled>Hits: </Button>{
                                    response.data.map(function (d) {
                                        return <Button onClick={this.loadAccount.bind(this, d.email, "email")}>
                                                {d.email}
                                        </Button>;
                                    }.bind(this))
                                }<Button onClick={this.clearHits}><Glyphicon glyph="trash"/></Button>
                            </ButtonGroup></div>
                        });
                    }
                }
            }.bind(this)
        });
    },

    loadSense: function(email) {
        $.ajax({
            url: '/api/device_by_email',
            dataType: 'json',
            type: 'GET',
            data: {email: email, device_type: "sense"},
            success: function (response) {
                this.setState({senseResponse: response});
                if (response.data.length > 0) {
                    if (response.data[0].device_account_pair) {
                        if (response.data[0].device_account_pair.externalDeviceId) {
                            var senseId = response.data[0].device_account_pair.externalDeviceId;
                            this.loadSenseKeyStore(senseId);
                            this.loadWifi(senseId);
                            this.loadLastRoomConditionsWithoutParticulates(senseId);
                            this.loadParticulates(email);
                        }
                    }
                }
            }.bind(this)
        });
    },

    loadPill: function(email) {
        $.ajax({
            url: '/api/device_by_email',
            dataType: 'json',
            type: 'GET',
            data: {email: email, device_type: "pill"},
            success: function (response) {
                this.setState({pillResponse: response});
                if (response.data.length > 0) {
                    if (response.data[0].device_account_pair && response.data[0].device_account_pair.externalDeviceId) {
                        var pillId = response.data[0].device_account_pair.externalDeviceId;
                        this.loadPillStatus(pillId);
                        this.loadPillKeyStore(pillId);
                    }
                }
            }.bind(this)
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
        $.ajax({
            aysnc: false,
            url: "/api/devices/key_store",
            dataType: 'json',
            type: 'GET',
            data: {device_id: senseId, device_type: "sense"},
            success: function (response) {
                this.setState({senseKeyStoreResponse: response});
            }.bind(this)
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

    loadTimeline: function(email) {
        this.setState({timelineStatus: <div className="loader"><img src="/static/image/loading.gif" /></div>});
        $.ajax({
            url: "/api/timeline",
            dataType: "json",
            type: 'GET',
            data: {email: email, date: d3.time.format("%Y-%m-%d")(new Date(new Date().getTime() - 24*3600*1000))},
            success: function (response) {
                if (response.error.isWhiteString()) {
                    this.setState({timelineResponse: response, timelineStatus: null});
                }
                else {
                    this.setState({timelineResponse: response, timelineStatus: <Well>{response.error}</Well>});
                }
            }.bind(this)
        });
    },

    loadPartner: function(email) {
        $.ajax({
            url: "/api/user_search",
            dataType: "json",
            type: 'GET',
            data: {input: email, type: "partner"},
            success: function (response) {
                if (response.error.isWhiteString()) {
                    this.setState({partner: response.data});
                }
            }.bind(this)
        });
    },

    loadTimezone: function(email) {
        $.ajax({
            url: "/api/timezone",
            dataType: "json",
            type: 'GET',
            data: {email: email, event_ts: new Date().getTime()},
            success: function (response) {
                this.setState({timezoneResponse: response})
            }.bind(this)
        });
    },

    loadZendeskTickets: function(email) {
        this.setState({zendeskStatus: <div className="loader"><img src="/static/image/loading.gif" /></div>});
        $.ajax({
            url: "/api/zendesk",
            dataType: "json",
            type: 'GET',
            data: {email: email},
            success: function (response) {
                if (response.error.isWhiteString()) {
                    this.setState({zendeskResponse: response, zendeskStatus: null});
                }
                else {
                    this.setState({zendeskResponse: response, zendeskStatus: <Well>{response.error}</Well>});
                }
            }.bind(this)
        });
    },

    loadParticulates: function(email) {
        ['particulates'].forEach(function(sensor){
            $.ajax({
                url: "/api/room_conditions",
                dataType: "json",
                type: 'GET',
                data: {email: email, ts: new Date().getTime(), resolution: "day", sensor: sensor},
                success: function (response) {
                    this.setState({particulatesResponse: response});
                }.bind(this)
            });
        }.bind(this));
    },

    loadWifi: function(senseId) {
        $.ajax({
            url: "/api/wifi_signal_strength",
            dataType: "json",
            type: 'GET',
            aysnc: false,
            data: {device_id: senseId},
            success: function (response) {
                this.setState({wifiResponse: response});
            }.bind(this)
        });
    },

    loadLastRoomConditionsWithoutParticulates: function(senseId) {
        $.ajax({
            url: "/api/last_room_conditions",
            dataType: "json",
            type: 'GET',
            aysnc: false,
            data: {sense_id: senseId},
            success: function (response) {
                this.setState({lastRoomConditionsResponse: response});
            }.bind(this)
        });
    },

    loadProfile: function(email) {
        this.loadPartner(email);
        this.loadSense(email);
        this.loadPill(email);
        this.loadTimezone(email);
        this.loadTimeline(email);
        this.loadZendeskTickets(email);
    },

    loadData: function() {
        this.loadAccount(this.refs.accountInput.getDOMNode().value.trim(), this.state.searchType, true);
    },

    handleSubmit: function() {
        history.pushState({}, '', '/account_profile/?input=' + this.refs.accountInput.getDOMNode().value.trim() + '&type=' + this.state.searchType);
        var initialState = this.getInitialState();
        delete initialState.searchType;
        initialState.accountInput = this.refs.accountInput.getDOMNode().value.trim();
        this.setState(initialState);
        this.loadData();
        return false;
    },

    showSearchType: function() {
        $("#search-type-toggle").trigger("click");
    },

    switchSearchType: function(searchType) {
        $("#page-name").trigger("click");
        this.setState({searchType: searchType});
    },

    searchTypeIconMap: function(searchType) {
        switch (searchType) {
            case "email": return "/static/image/account-email.png"; break;
            case "name": return "/static/image/account-name.png"; break;
            case "account_id": return "/static/image/account-id.png"; break;
            case "sense_id": return "/static/image/sense-bw.png"; break;
            case "pill_id": return "/static/image/pill-bw.png"; break;
            default: return "/static/image/account-email.png";
        }
    },

    render: function() {
        var searchForm = <Row><Col id="submit" xs={6} xsOffset={3}><form onSubmit={this.handleSubmit}>
            <div className="icon-addon addon-md">
                <input className="form-control" type="text" id="account-input" ref="accountInput" placeholder={this.getPlaceholder(this.state.searchType)}/>
                <Glyphicon className="cursor-hand" id="submit" glyph="search" onClick={this.handleSubmit}/>
                <span className="glyphicon cursor-hand" onClick={this.showSearchType}><img id="search-type-icon-active" src={this.searchTypeIconMap(this.state.searchType)} /></span>
                <DropdownButton title='Dropdown' id="search-type-toggle">
                    <MenuItem onClick={this.switchSearchType.bind(this, "email")}><img className="search-type-icon" src={this.searchTypeIconMap("email")} />Email</MenuItem>
                    <MenuItem onClick={this.switchSearchType.bind(this, "name")}><img className="search-type-icon" src={this.searchTypeIconMap("name")} />Name</MenuItem>
                    <MenuItem onClick={this.switchSearchType.bind(this, "account_id")}><img className="search-type-icon" src={this.searchTypeIconMap("account_id")} />Internal ID</MenuItem>
                    <MenuItem onClick={this.switchSearchType.bind(this, "sense_id")}><img className="search-type-icon" src={this.searchTypeIconMap("sense_id")} />External ID</MenuItem>
                    <MenuItem onClick={this.switchSearchType.bind(this, "pill_id")}><img className="search-type-icon" src={this.searchTypeIconMap("pill_id")} />External ID</MenuItem>
                </DropdownButton>
            </div>
        </form></Col></Row>;

        var results = <div>
            {this.state.hits}<br/>
            <Row>
                <Col xs={8}>
                    <Row>
                        <Col xs={6}>
                            <Tile img="svg/sleep.svg" title="Basic Info" img="svg/sleep.svg" content={<AccountTile account={this.state.account} partner={this.state.partner} />} />
                            <Tile img="svg/timeline.svg" title="Timeline" content={<TimelineTile email={this.state.email} response={this.state.timelineResponse} status={this.state.timelineStatus} />} />
                        </Col>
                        <Col xs={6}>
                            <Tile img="image/sense-bw.png" title="Sense Summary" content={<SenseSummary senseResponse={this.state.senseResponse} senseKeyStoreResponse={this.state.senseKeyStoreResponse} timezoneResponse={this.state.timezoneResponse} />} />
                            <Tile img="svg/room_conditions.svg" title="Room Conditions" content={<RoomConditionsTile email={this.state.email} lastRoomConditionsResponse={this.state.lastRoomConditionsResponse} particulatesResponse={this.state.particulatesResponse} />} />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}><Tile img="svg/zendesk.svg" title="Zendesk" content={<ZendeskTile zendeskResponse={this.state.zendeskResponse} zendeskStatus={this.props.zendeskStatus} />} /></Col>
                    </Row>
                </Col>
                <Col xs={4}>
                    <Tile img="image/pill-bw.png" title="Pill Summary" content={<PillSummary pillResponse={this.state.pillResponse} pillStatusResponse={this.state.pillStatusResponse} pillKeyStoreResponse={this.state.pillKeyStoreResponse} email={this.state.email} />} />
                    <Tile img="svg/wifi.svg" title="Wifi Info" content={<WifiTile wifiResponse={this.state.wifiResponse} />} />
                </Col>
            </Row>
        </div>;
        return <div>
            {searchForm}
            {this.state.accountError === null ? results : this.state.accountError}
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

function purgeSentinels(d) {
    return d.value != 0 && d.value != -1;
}