var utcFormatter = d3.time.format.utc("%a&nbsp;&nbsp;%d&nbsp;&nbsp;%b&nbsp;&nbsp;%Y<br>%H : %M : %S - GMT");

var Tile = React.createClass({
    getDefaultProps: function() {
        return {img: "svg/motion.svg"}
    },
    render: function() {
        return <div className={"tile tile-" + this.props.title.toLowerCase().replace(/\s/g, "-")}>
            <div className="tile-title">
                <Row>
                    <Col xs={2} className="tile-icon-wrapper">
                        <img className="tile-icon" src={"/static/" + this.props.img}/>
                    </Col>
                    <Col xs={8} className="tile-name">
                        {this.props.title}
                    </Col>
                </Row>
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
        return <div>
            <Table>
                <thead></thead>
                <tbody>
                    <tr><td>ID</td><td>{this.props.account.id}</td></tr>
                    <tr><td>Name</td><td>{this.props.account.name}</td></tr>
                    <tr><td>Email</td><td>{this.props.account.email}</td></tr>
                    <tr><td>Gender</td><td>{this.props.account.gender}</td></tr>
                    <tr><td>Partner</td><td>{partnerLink}</td></tr>
                    <tr><td>Last Modified</td><td><span dangerouslySetInnerHTML={{__html: utcFormatter(new Date(this.props.account.last_modified))}}/></td></tr>
                    <tr><td>Created Date</td><td><span dangerouslySetInnerHTML={{__html: utcFormatter(new Date(this.props.account.created))}}/></td></tr>
                    <tr><td/><td/></tr>
                </tbody>
            </Table>
            <ul className="extra">
                <li><a target="_blank" href={"https://mixpanel.com/report/544347/explore/#list/chosen_columns:!('$country_code','$last_seen','$city',Platform),filter:(conjunction:and,filters:!((filter:(operand:!('" + this.props.account.id + "'),operator:%3D%3D),property:'Account%20Id',selected_property_type:string,type:string))),sort_order:descending,sort_property:'!''"}>Mixpanel</a></li>
                <li><ModalTrigger modal={<ZendeskModal email={this.props.account.email} />}>
                    <a className="cursor-hand">Zendesk</a>
                </ModalTrigger></li>
                <li><ModalTrigger modal={<ClearbitModal email={this.props.account.email} />}>
                    <a className="cursor-hand">Clearbit</a>
                </ModalTrigger></li>
            </ul>
        </div>;
    }
});

AlarmsTile = React.createClass({
    render: function() {
        var response = this.props.alarmsResponse;
        return response.data.length === 0 ? <div>No alarm has been set</div>: <Table>
            <thead><tr>
                <th>Time</th>
                <th>Smart</th>
                <th>Repeated</th>
                <th>Enabled</th>
                <th>Day(s)</th>
            </tr></thead>
            <tbody>{
                response.data.map(function(alarm){
                    return <tr>
                        <td className="center-wrapper">
                            {alarm.hour.toString().length > 1 ? alarm.hour : "0" + alarm.hour}:
                            {alarm.minute.toString().length > 1 ? alarm.minute : "0" + alarm.minute}
                        </td>
                        <td className="center-wrapper">{alarm.smart ? <span>&#10004;</span> : <span>&#10008;</span>}</td>
                        <td className="center-wrapper">{alarm.repeated ? <span>&#10004;</span> : <span>&#10008;</span>}</td>
                        <td className="center-wrapper">{alarm.enabled ? <span>&#10004;</span> : <span>&#10008;</span>}</td>
                        <td>{weekDayNumberToShortName(alarm.day_of_week)}</td>
                    </tr>
                })
            }<tr><td/><td/><td/><td/><td/></tr></tbody>
        </Table>;
    }
});

var TimezoneHistoryTile = React.createClass({
    render: function() {
        var data = this.props.timezoneHistoryResponse.data;
        return $.isEmptyObject(data) ? <div>No timezone detected</div>: <Table>
            <thead><tr>
                <th className="center-wrapper">Updated (UTC)</th>
                <th className="center-wrapper">Timezone ID</th>
                <th className="center-wrapper">Offset (ms)</th>
            </tr></thead>
            <tbody>{
                Object.keys(data).sort(function(x1, x2){return new Date(x2).getTime() - new Date(x1).getTime()}).map(function(updatedAt){
                    return <tr>
                        <td className="center-wrapper">{d3.time.format.utc("%b %d %H:%M")(new Date(updatedAt))}</td>
                        <td className="center-wrapper">{data[updatedAt].timezone_id}</td>
                        <td className="center-wrapper">{data[updatedAt].timezone_offset}</td>
                    </tr>
                })
            }</tbody>
        </Table>;
    }
});

var TimelineTile = React.createClass({
    render: function() {
        var response = this.props.response;
        var timelinePreview,
            lastNightDate =  d3.time.format("%m-%d-%Y")(new Date(new Date().getTime() - 24*3600*1000));
        if (response.data.length > 0) {
            var lastNightScore = response.data[0].score && response.data[0].score >= 0 ?
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
            <ul className="extra">
                <li><a target="_blank" href={"/timeline_v2/?email=" + this.props.email + "&date=" + lastNightDate}>See full detail</a></li>
                <li><a target="_blank" href={"/insights/?email=" + this.props.email}>Insights</a></li>
                <li><a target="_blank" href={"/trends/?email=" + this.props.email}>Trends</a></li>
            </ul>
        </div>
    }
});


var AccountProfile = React.createClass({
    getInitialState: function() {
        return {
            alarmsResponse: {data: [], error: ""},
            senseResponse: {data: [], error: ""},
            pillResponse: {data: [], error: ""},
            senseKeyStoreResponse: {data: {}, error: ""},
            pillKeyStoreResponse: {data: {}, error: ""},
            timelineResponse: {data: [], error: ""},
            timezoneResponse: {data: {}, error: ""},
            timezoneHistoryResponse: {data: {}, error: ""},
            temperatureResponse: {data: [], error: ""},
            humidityResponse: {data: [], error: ""},
            lightResponse: {data: [], error: ""},
            soundResponse: {data: [], error: ""},
            lastRoomConditionsResponse: {data: {}, error: ""},
            senseColorResponse: {data: null, error: ""},
            accountInput: "",
            timelineStatus: null,
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
            alarmsResponse: {data: [], error: ""},
            senseResponse: {data: [], error: ""},
            pillResponse: {data: [], error: ""},
            senseKeyStoreResponse: {data: {}, error: ""},
            pillKeyStoreResponse: {data: {}, error: ""},
            timelineResponse: {data: [], error: ""},
            timezoneResponse: {data: {}, error: ""},
            timezoneHistoryResponse: {data: {}, error: ""},
            zendeskResponse: {data: {}, error: ""},
            temperatureResponse: {data: [], error: ""},
            humidityResponse: {data: [], error: ""},
            lightResponse: {data: [], error: ""},
            soundResponse: {data: [], error: ""},
            lastRoomConditionsResponse: {data: {}, error: ""},
            senseId: "",
            pillId: ""
        })
    },

    componentDidMount: function() {
        var inputFromURL = getParameterByName("input"),
            typeFromURL = getParameterByName("type");
        if (inputFromURL){
            this.setState({searchType: typeFromURL});
            this.refs.accountInput.getDOMNode().value = inputFromURL;
            setTimeout(function(){this.handleSubmit()}.bind(this), 75);
        }
    },

    getPlaceholder: function(searchType) {
        switch (searchType) {
            case "email": return "Enter Account Email"; break;
            case "email_partial": return "Enter Partial Email"; break;
            case "name": return "Enter Name Partials"; break;
            case "account_id": return "Enter Account ID"; break;
            case "sense_id": return "Enter Sense ID"; break;
            case "pill_id": return "Enter Pill ID"; break;
            default: return "Enter Account Email";
        }
    },

    clearHits: function() {
//        this.setState({hits: []});
        $("#account-hits").hide();
    },

    loadAccount: function(input, type, clearProfile) {
        if (clearProfile) {
            this.clearProfile();
        }
        $.ajax({
            url: "/api/account_search",
            dataType: 'json',
            type: "GET",
            data: {input: input, type: type},
            success: function (response) {
                if (!response.error.isWhiteString()) {
                    this.setState({accountError: <Alert>{response.error}</Alert>});
                }
                else if (response.data.length === 0) {
                    this.setState({accountError: <Alert>Account Not Found !</Alert>});
                    if (type == "sense_id") {
                        this.loadSenseByExternalId(input);
                    }
                    else if (type == "pill_id") {
                        this.loadPillByExternalId(input);
                    }
                }
                else {
                    var data =  response.data.sort(function(t1, t2){return t2.created - t1.created;});
                    this.loadProfile(data[0].email);
                    this.setState({
                        email: data[0].email,
                        accountError: null,
                        account: data[0]
                    });
                    if (data.length > 1) {
                        this.setState({
                            hits: <div id="account-hits" className="center-wrapper"><ButtonGroup>
                                <Button disabled>Hits: </Button>{
                                    data.map(function (d) {
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

    loadSenseByEmail: function(email) {
        $.ajax({
            url: '/api/device_by_email',
            dataType: 'json',
            type: 'GET',
            data: {email: email, device_type: "sense"},
            success: function (response) {
                this.setState({senseResponse: response});
                if (response.data.length > 0) {
                    if (response.data[0].device_account_pair) {
                        if (response.data[0].device_account_pair.external_device_id) {
                            var senseId = response.data[0].device_account_pair.external_device_id;
                            this.setState({senseId: senseId});
                            this.loadSenseKeyStore(senseId);
                            this.loadSenseColor(senseId);
                            this.loadLastRoomConditionsWithoutParticulates(senseId);
                        }
                    }
                }
            }.bind(this)
        });
    },

    loadSenseByExternalId: function(senseId) {
        this.setState({senseId: senseId});
        this.loadSenseKeyStore(senseId);
        this.loadSenseColor(senseId);
        this.loadLastRoomConditionsWithoutParticulates(senseId);
    },

    loadPillByExternalId: function(pillId) {
        this.loadPillKeyStore(pillId);
    },

    loadPillByEmail: function(email) {
        $.ajax({
            url: '/api/device_by_email',
            dataType: 'json',
            type: 'GET',
            data: {email: email, device_type: "pill"},
            success: function (response) {
                this.setState({pillResponse: response});
                if (response.data.length > 0) {
                    if (response.data[0].device_account_pair && response.data[0].device_account_pair.external_device_id) {
                        var pillId = response.data[0].device_account_pair.external_device_id;
                        this.loadPillKeyStore(pillId);
                    }
                }
            }.bind(this)
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
        $.ajax({
            aysnc: false,
            url: "/api/devices/key_store",
            dataType: 'json',
            type: 'GET',
            data: {device_id: pillId, device_type: "pill"},
            success: function (response) {
                this.setState({pillKeyStoreResponse: response});
            }.bind(this)
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
            url: "/api/account_search",
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



    loadSenseColor: function(senseId) {
        $.ajax({
            url: "/api/sense_color",
            dataType: "json",
            type: 'GET',
            aysnc: false,
            data: {sense_id: senseId},
            success: function (response) {
                this.setState({senseColorResponse: response});
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

    loadAlarms: function(email) {
        $.ajax({
            url: "/api/alarms_by_email",
            dataType: "json",
            type: 'GET',
            data: {email: email},
            success: function (response) {
                this.setState({alarmsResponse: response});
            }.bind(this)
        });
    },

    loadTimezoneHistory: function(email) {
        $.ajax({
            url: "/api/timezone_history",
            dataType: "json",
            type: 'GET',
            data: {email: email},
            success: function (response) {
                this.setState({timezoneHistoryResponse: response});
            }.bind(this)
        });
    },

    loadProfile: function(email) {
        this.loadPartner(email);
        this.loadSenseByEmail(email);
        this.loadPillByEmail(email);
        this.loadTimezone(email);
        this.loadTimeline(email);
        this.loadAlarms(email);
        this.loadTimezoneHistory(email);
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
        $("#viewer").trigger("click");
//        this.refs.accountInput.getDOMNode().value = "";
        this.refs.accountInput.getDOMNode().focus();
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
        var searchForm = <Col xs={12} lg={6} className="paddingless"><form id="submit" onSubmit={this.handleSubmit}>
            <div className="icon-addon addon-md">
                <input className="form-control" type="text" id="account-input" ref="accountInput" placeholder={this.getPlaceholder(this.state.searchType)}/>
                <Glyphicon className="cursor-hand" id="submit" glyph="search" onClick={this.handleSubmit}/>
                <span className="glyphicon cursor-hand" onClick={this.showSearchType}><img id="search-type-icon-active" src={this.searchTypeIconMap(this.state.searchType)} /></span>
                <DropdownButton title='Dropdown' id="search-type-toggle">
                    <MenuItem onClick={this.switchSearchType.bind(this, "email")}><img className="search-type-icon" src={this.searchTypeIconMap("email")} />Email</MenuItem>
                    <MenuItem onClick={this.switchSearchType.bind(this, "email_partial")}><img className="search-type-icon" src={this.searchTypeIconMap("email")} />Partial Email</MenuItem>
                    <MenuItem onClick={this.switchSearchType.bind(this, "name")}><img className="search-type-icon" src={this.searchTypeIconMap("name")} />Name</MenuItem>
                    <MenuItem onClick={this.switchSearchType.bind(this, "account_id")}><img className="search-type-icon" src={this.searchTypeIconMap("account_id")} />Internal ID</MenuItem>
                    <MenuItem onClick={this.switchSearchType.bind(this, "sense_id")}><img className="search-type-icon" src={this.searchTypeIconMap("sense_id")} />External ID</MenuItem>
                    <MenuItem onClick={this.switchSearchType.bind(this, "pill_id")}><img className="search-type-icon" src={this.searchTypeIconMap("pill_id")} />External ID</MenuItem>
                </DropdownButton>
            </div>
        </form></Col>;

        var senseId =  (this.state.senseResponse.data.length > 0 && this.state.senseResponse.data[0].device_account_pair) ? this.state.senseResponse.data[0].device_account_pair.external_device_id : undefined;
        var resultsTotal = [
            <Col xs={12} className="paddingless-left hits">{this.state.hits}</Col>,
            <Col xs={12} lg={4} className="paddingless-left">
                <Tile img="svg/sleep.svg" title="User Summary" img="svg/sleep.svg" content={<AccountTile account={this.state.account} partner={this.state.partner} zendeskResponse={this.state.zendeskResponse} zendeskStatus={this.state.zendeskStatus} />} />
                <Tile img="svg/timeline.svg" title="Timeline" content={<TimelineTile email={this.state.email} response={this.state.timelineResponse} status={this.state.timelineStatus} />} />
                <Tile img="svg/alarm.svg" title="Alarms" content={<AlarmsTile alarmsResponse={this.state.alarmsResponse} />} />
                <Tile img="svg/wifi.svg" title="Sessions" content={<SessionsTile email={this.state.email} />} />
            </Col>,
            <Col xs={12} lg={4} className="paddingless-left">
                <Tile img="image/sense-bw.png" title="Sense Summary" content={<SenseSummary senseResponse={this.state.senseResponse} senseKeyStoreResponse={this.state.senseKeyStoreResponse} timezoneResponse={this.state.timezoneResponse} senseColorResponse={this.state.senseColorResponse} />} />
                <Tile img="svg/room_conditions.svg" title="Room Conditions" content={<LastRoomConditionsTile lastRoomConditionsResponse={this.state.lastRoomConditionsResponse} email={this.state.email} />} />
                <Tile img="svg/timezone.svg" title="Timezone History" content={<TimezoneHistoryTile timezoneHistoryResponse={this.state.timezoneHistoryResponse} />} />
            </Col>,
            <Col xs={12} lg={4} className="paddingless-left">
                <Tile img="image/pill-bw.png" title="Pill Summary" content={<PillSummary senseResponse={this.state.senseResponse} pillResponse={this.state.pillResponse} pillKeyStoreResponse={this.state.pillKeyStoreResponse} email={this.state.email} />} />
                <Tile img="svg/uptime.svg" title="Sense Online Uptime" content={<UptimeTile email={this.state.email} />} />
                <Tile img="svg/wifi.svg" title="Wifi Info" content={<WifiTile senseId={senseId} />} />
            </Col>
        ];

        var deviceId = $("#account-input").val();
        var resultsForOrphanSense = deviceId &&  this.state.searchType === "sense_id" ? [
            <Col xs={12} lg={4} className="paddingless-left">
                <Tile img="image/sense-bw.png" title="Sense Summary" content={<SenseLimitedSummary senseId={deviceId} senseKeyStoreResponse={this.state.senseKeyStoreResponse} senseColorResponse={this.state.senseColorResponse} />} />
            </Col>,
            <Col xs={12} lg={4} className="paddingless-left">
                <Tile img="svg/room_conditions.svg" title="Room Conditions" content={<LastRoomConditionsTile lastRoomConditionsResponse={this.state.lastRoomConditionsResponse} />} />
            </Col>
        ] : null;

        var resultsForOrphanPill = deviceId && this.state.searchType === "pill_id" ?
            <Col xs={12} lg={4} className="paddingless-left">
                <Tile img="image/sense-bw.png" title="Pill Summary" content={<PillLimitedSummary pillId={deviceId} pillKeyStoreResponse={this.state.pillKeyStoreResponse}  />} />
            </Col>
            : null;

        return <Col xs={12} className="paddingless container">
            {searchForm}
            {this.state.accountError === null ? null : <Col xs={12} className="paddingless">{this.state.accountError }</Col>}
            {this.state.accountError === null ? resultsTotal : (resultsForOrphanSense || resultsForOrphanPill)}
        </Col>;
    }
});

React.render(<AccountProfile />, document.getElementById('account-profile'));

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

function weekDayNumberToShortName(wdList) {
    return wdList.map(function(wd) {
        switch (wd) {
            case 1:
                return "M";
            case 2:
                return "T";
            case 3:
                return "W";
            case 4:
                return "Th";
            case 5:
                return "F";
            case 6:
                return "Sa";
            case 7:
                return "Su";
            default:
                return "Xe";
        }
    }).join(" ");
}