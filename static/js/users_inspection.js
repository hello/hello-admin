/** @jsx React.DOM */
const d3TimeFormat = d3.time.format('%b %d %H:%M');

const ACCEPTABLE_BATTERY_LEVEL = 10;
const ACTIVE_SENSE_HOURS_THRESHOLD = 1;
const ACTIVE_PILL_HOURS_THRESHOLD = 4;
const MAX_INSPECT_POPULATION = 100000;  // users
const DEFAULT_INSPECT_POPULATION = 100;
const INSPECT_HEADWAY = 1500;  // ms
const TICKET_AGE_THRESHOLD = 7; // days

var RemarksModal =  React.createClass({
    render: function() {
        return this.transferPropsTo(
            <Modal pra title="Definitions">
                <div className="modal-body">
                    <p>Acceptable battery level = {ACCEPTABLE_BATTERY_LEVEL + " (%)"}</p>
                    <p>Active sense threshold = {ACTIVE_SENSE_HOURS_THRESHOLD + " (hours)"}</p>
                    <p>Active pill threshold = {ACTIVE_PILL_HOURS_THRESHOLD + " (hours)"}</p><br/>
                    <Row>
                        <Col xs={6}><span className="inspection-ok">&#10004;</span> &nbsp; means <em> positive</em></Col>
                        <Col xs={6}><Button bsSize="xsmall" bsStyle="success"><Glyphicon glyph="thumbs-up"/></Button>&nbsp;&#10230; Flawless</Col>
                    </Row><br/>
                    <Row>
                        <Col xs={6}><span className="inspection-not-ok">&#10008;</span> &nbsp; means <em> negative</em></Col>
                        <Col xs={6}><Button bsSize="xsmall" bsStyle="danger"><Glyphicon glyph="thumbs-down"/></Button>&nbsp;&#10230; Trouble Detected - No Ticket</Col>
                    </Row><br/>
                    <Row>
                        <Col xs={6}>&#8211; &nbsp; means <em> not applicable</em></Col>
                        <Col xs={6}><Button bsSize="xsmall" bsStyle="warning"><Glyphicon glyph="thumbs-down"/></Button>&nbsp;&#10230; Trouble Detected - Contacted</Col>
                    </Row><br/>
                    <Row>
                        <Col xs={6}>&#63; &nbsp; means <em> uninspected</em></Col>
                        <Col xs={6}><Button bsSize="xsmall" bsStyle="primary"><Glyphicon glyph="hand-right"/></Button>&nbsp;&#10230; Skipped</Col>
                    </Row><br/>
                    <p>Trouble signal</p>
                    <Alert>!({"(hasSense === true && (isSenseActive !== true || isSenseProvisioned !== true || hasPill === false))" +
                        " || (hasPill === true && (isPillActive !== true || isPillProvisioned !== true || isBatteryLevelOk !== true))"})</Alert>
                    <p>Not-OK signal</p>
                    <Alert bsStyle="danger">{"hasTrouble === true && hasTicketLastWeek === false"}</Alert>
                </div>
            </Modal>
        );
    }
});

var ProblemUsersMaestro = React.createClass({
    getInitialState: function() {
        return {
            recentUsers: [], selectedUsers: [], error: "", senses: [], pills: [],
            pillStatuses: [], senseProvisionStatuses: [], pillProvisionStatuses: [], zendeskTickets: [],
            nonOkUsers: [], inspectedUsers: []
        }
    },

    getRecentUsers: function() {
        var that = this;
        $.ajax({
            url: '/api/recent_users',
            dataType: 'json',
            data: {limit: MAX_INSPECT_POPULATION},
            type: 'GET',
            success: function(response) {
                if (response.error.isWhiteString()) {
                    that.setState({error: "", recentUsers: response.data, selectedUsers: response.data});
                }
                else {
                    that.setState({recentUsers: [], error: response.error, selectedUsers: []});
                }
            }
        });
        return false;
    },

    getDevicesInfo: function(email, i) {
        if (i === 0 || i === 99){
            console.log(new Date());
        }

        var that = this;
        that.loadZendeskTickets(email, i);
        $.ajax({
            url: '/api/device_by_email',
            dataType: 'json',
            type: 'GET',
            data: {email: email, device_type: "sense"},
            success: function (response) {
                var newSenses = that.state.senses;
                newSenses[i] = response.data[0] || null;  //assume only 1 sense per user
                that.setState({senses: newSenses});

                var deviceId = response.data[0] && response.data[0]['device_account_pair'] ?
                    response.data[0]['device_account_pair']['externalDeviceId'] : undefined;

                var newSenseProvisionStatuses = that.state.senseProvisionStatuses;
                if (deviceId) {
                    $.ajax({
                        url: "/api/devices/key_store",
                        dataType: 'json',
                        type: "GET",
                        async: false,
                        data: {device_id: deviceId, device_type: "sense"},
                        success: function (response) {
                            newSenseProvisionStatuses[i] = response.error.isWhiteString();
                        }
                    });
                }
                else {
                    newSenseProvisionStatuses[i] = null
                }
                that.setState({senseProvisionStatuses: newSenseProvisionStatuses});
            }
        });

        $.ajax({
            url: '/api/device_by_email',
            dataType: 'json',
            type: 'GET',
            data: {email: email, device_type: "pill"},
            success: function (response) {

                var newPills = that.state.pills;
                newPills[i] = response.data[0] || null;  //assume only 1 pill per user
                that.setState({pills: newPills});

                var deviceId = response.data[0] && response.data[0]['device_account_pair'] ?
                    response.data[0]['device_account_pair']['externalDeviceId'] : undefined;

                var newPillProvisionStatuses = that.state.pillProvisionStatuses;
                if (deviceId) {
                    $.ajax({
                        url: "/api/devices/key_store",
                        dataType: 'json',
                        type: "GET",
                        async: false,
                        data: {device_id: deviceId, device_type: "pill"},
                        success: function (response) {
                            newPillProvisionStatuses[i] = response.error.isWhiteString();
                        }
                    });
                }
                else {
                    newPillProvisionStatuses[i] = null;
                }
                that.setState({pillProvisionStatuses: newPillProvisionStatuses});
            }
        });

        $.ajax({
            url: "/api/battery",
            type: "GET",
            dataType: "json",
            data: {search_input: email, end_ts: new Date().getTime()},
            success: function (response) {
                var newPillStatuses = that.state.pillStatuses;
                newPillStatuses[i] = (response.data && response.data[0] ?
                    response.data[0][0] : undefined) || null;  //assume only 1 pill per user & only care about latest heartbeat
                that.setState({pillStatuses: newPillStatuses});
            }
        });
    },

    loadZendeskTickets: function(email, i) {
        var that = this;
        $.ajax({
            url: "/api/zendesk",
            dataType: "json",
            type: 'GET',
            data: {email: email},
            async: false,
            success: function (response) {
                var newZendeskTicket = that.state.zendeskTickets;
                newZendeskTicket[i] = ((!$.isEmptyObject(response.data) && response.data.tickets && response.data.tickets.length > 0) ?
                    response.data.tickets[0] : undefined) || null;
                that.setState({zendeskTickets: newZendeskTicket});
            }
        });
    },

    componentDidMount: function() {
        this.getRecentUsers();
    },
    slicePop: function(pop) {
        this.setState({selectedUsers: this.state.recentUsers.slice(0, pop)});
    },
    inspect: function(pop) {
        console.log('pop', pop);
        $('h3').click();
        var that = this;
        that.setState({error: "", senses: [], pills: [], pillStatuses: [], senseProvisionStatuses: [], pillProvisionStatuses: [], zendeskTickets: [], nonOkUsers: [], inspectedUsers: []});
        that.slicePop(pop);

        this.state.recentUsers.slice(0, pop).forEach(function(user, j){
            console.log(j);
            var delay = j * INSPECT_HEADWAY;
            setTimeout(function() {
                that.getDevicesInfo(user.email, j);
            }, delay);
        });
    },
    hideOkUsers: function() {
        $('tr').filter(function() {
            return $(this).find('.btn-danger').length === 0
                && $(this).find('.btn-default').length === 0
                && $(this).find('th').length === 0;
        }).hide();
    },

    unhideOkUsers: function() {
        $('tr').filter(function() {
            return $(this).find('.btn-danger').length === 0
                && $(this).find('.btn-default').length === 0
                && $(this).find('th').length === 0;
        }).show();
    },

    render: function() {
        var that = this;
        var usersInfo = this.state.selectedUsers.map(function(user, i) {
            var hasSense, isSenseActive, isSenseProvisioned, hasPill, isPillActive, isPillProvisioned, isBatteryLevelOk, hasTicketLastWeek;
            var thisSense = that.state.senses[i];
            if (thisSense !== undefined){
                if (thisSense !== null) {
                    if (thisSense.device_account_pair) {
                        hasSense = !isNaN(thisSense.device_account_pair.internalDeviceId);
                    }
                    else {
                        hasSense = false;
                    }

                    if (thisSense.device_status) {
                        isSenseActive = thisSense.device_status.lastSeen > new Date().getTime() - ACTIVE_SENSE_HOURS_THRESHOLD * 3600000;
                    }
                    else {
                        isSenseActive = null;
                    }
                }
                else {
                    hasSense = false;
                    isSenseActive = null;
                }
            }

            var thisPill = that.state.pills[i];
            if (thisPill !== undefined) {
                if (thisPill !== null) {
                    if (thisPill.device_account_pair) {
                        hasPill = !isNaN(thisPill.device_account_pair.internalDeviceId);
                    }
                    else {
                        hasPill = false;
                    }
                }
                else {
                    hasPill = false;
                }
            }

            var thisPillStatus = that.state.pillStatuses[i];
            if (thisPillStatus !== undefined) {
                if (thisPillStatus !== null) {
                    isPillActive = thisPillStatus.lastSeen > new Date().getTime() - ACTIVE_PILL_HOURS_THRESHOLD * 3600000;
                    isBatteryLevelOk = thisPillStatus.batteryLevel > ACCEPTABLE_BATTERY_LEVEL;
                }
                else {
                    isPillActive = null;
                    isBatteryLevelOk = null;
                }
            }

            var thisSenseProvisionStatus = that.state.senseProvisionStatuses[i];
            if (thisSenseProvisionStatus !== undefined) {
                 if (thisSenseProvisionStatus !== null) {
                    isSenseProvisioned = that.state.senseProvisionStatuses[i];
                }
                else {
                    isSenseProvisioned = null;
                }
            }

            var thisPillProvisionStatus = that.state.pillProvisionStatuses[i];
            if (thisPillProvisionStatus !== undefined) {
                if (thisPillProvisionStatus !== null) {
                    isPillProvisioned = that.state.pillProvisionStatuses[i];
                }
                else {
                    isPillProvisioned = null;
                }
            }

            var thisZendeskTicket = that.state.zendeskTickets[i];
            if (thisZendeskTicket !== undefined) {
                if (thisZendeskTicket !== null) {
                    hasTicketLastWeek = new Date().getTime() < new Date(that.state.zendeskTickets[i].created_at).getTime() + TICKET_AGE_THRESHOLD*24*3600*1000;
                }
                else {
                    hasTicketLastWeek = false;
                }
            }

            var metricsSet = [hasSense, isSenseActive, isSenseProvisioned, hasPill, isPillActive, isPillProvisioned, isBatteryLevelOk, hasTicketLastWeek];
            var undefinedMetricCount = metricsSet.filter(function(v){return v === undefined}).length;

            var inspectStatusIcon, inspectStatusStyle;
            switch (undefinedMetricCount) {
                case metricsSet.length:
                    inspectStatusIcon = "search";         // inspection ready
                    inspectStatusStyle = "default";
                    break;
                case 0:                                 // inspection complete
                    if ((hasSense === true && (isSenseActive !== true || isSenseProvisioned !== true || hasPill === false))
                        || (hasPill === true && (isPillActive !== true || isPillProvisioned !== true || isBatteryLevelOk !== true))) {
                        inspectStatusIcon = "thumbs-down";

                        if (hasTicketLastWeek === false) {
                            inspectStatusStyle = "danger";
                            if (that.state.nonOkUsers.indexOf(user.email) === -1) {
                                that.state.nonOkUsers.push(user.email);
                            }
                        }
                        else {
                            inspectStatusStyle = "warning";
                        }
                    }
                    else {
                        if (hasSense === true) {
                            inspectStatusIcon = "thumbs-up";
                            inspectStatusStyle = "success";
                        }
                        else {
                            inspectStatusIcon = "hand-right";
                            inspectStatusStyle = "primary";
                        }
                    }
                    if (that.state.inspectedUsers.indexOf(user.email) === -1) {
                        that.state.inspectedUsers.push(user.email);
                    }
                    break;
                default:                                // inspection in progress
                    inspectStatusIcon = "time";
                    inspectStatusStyle = "info";
            }

            return <tr>
                <td className="col-xs-1"><Button bsSize="small" bsStyle={inspectStatusStyle} id={"fire"+i} onClick={that.getDevicesInfo.bind(that, user.email, i)}><Glyphicon glyph={inspectStatusIcon}/></Button></td>
                <td className="col-xs-2 user-val"><a target="_blank" href={"/account_profile/?type=email&input=" + user.email}>{user.email}</a></td>
                <td className="col-xs-1 user-val">{d3TimeFormat(new Date(user.last_modified))}</td>
                <td className="col-xs-1 inspection-result">{booleanPresent(hasTicketLastWeek)}</td>
                <td className="col-xs-1 inspection-result">{booleanPresent(hasSense)}</td>
                <td className="col-xs-1 inspection-result">{booleanPresent(isSenseActive)}</td>
                <td className="col-xs-1 inspection-result">{booleanPresent(isSenseProvisioned)}</td>
                <td className="col-xs-1 inspection-result">{booleanPresent(hasPill)}</td>
                <td className="col-xs-1 inspection-result">{booleanPresent(isPillActive)}</td>
                <td className="col-xs-1 inspection-result">{booleanPresent(isPillProvisioned)}</td>
                <td className="col-xs-1 inspection-result">{booleanPresent(isBatteryLevelOk)}</td>
            </tr>
        });

        var alert = this.state.error === "" ? null : <Alert>{this.state.error}</Alert>;
        var loadingInspector = that.state.selectedUsers.length > 0 ? null :
            <div className="loading-inspector" ><img src="/static/image/loading.gif"/></div>;
        var results = this.state.error !== "" ? null :
            [<Table id="events-table" striped>
                <thead><tr>
                        <th className="col-xs-1 counter"> {that.state.inspectedUsers.length + "/" + that.state.selectedUsers.length}</th>
                        <th className="col-xs-2 user-attr"><em>Account Email</em></th>
                        <th className="col-xs-1 user-attr"><em>Last Modified</em></th>
                        <th className="col-xs-1 metric"><em>hasTicket LastWeek</em></th>
                        <th className="col-xs-1 metric"><em>hasSense</em></th>
                        <th className="col-xs-1 metric"><em>isSense Active</em></th>
                        <th className="col-xs-1 metric"><em>isSense Provisioned</em></th>
                        <th className="col-xs-1 metric"><em>hasPill</em></th>
                        <th className="col-xs-1 metric"><em>isPill Active</em></th>
                        <th className="col-xs-1 metric"><em>isPill Provisioned</em></th>
                        <th className="col-xs-1 metric"><em>isBattery LevelOk</em></th>
                </tr></thead>
                <tbody>
                    {usersInfo}
                </tbody>
            </Table>,
            loadingInspector];

        return (<div>
            <Row>
                <Col xs={3}>
                    <DropdownButton bsSize="small" title={<span><Glyphicon glyph="search"/> Inspect</span>} key={1}>
                        <MenuItem eventKey='1' onClick={that.inspect.bind(that, 10)}>latest 10</MenuItem>
                        <MenuItem eventKey='2' onClick={that.inspect.bind(that, 50)}>latest 50</MenuItem>
                        <MenuItem eventKey='3' onClick={that.inspect.bind(that, 100)}>latest 100</MenuItem>
                        <MenuItem eventKey='4' onClick={that.inspect.bind(that, 500)}>latest 500</MenuItem>
                        <MenuItem eventKey='5' onClick={that.inspect.bind(that, 1000)}>latest 1000</MenuItem>
                        <MenuItem divider />
                        <MenuItem eventKey='6' onClick={that.inspect.bind(that, MAX_INSPECT_POPULATION)}>ALL</MenuItem>
                    </DropdownButton>
                </Col>

                <Col xs={4}>
                    <ButtonGroup bsSize="small">
                        <Button id="hide-ok-users" onClick={that.hideOkUsers}><Glyphicon glyph="eye-open"/> Hide OK</Button>
                        <Button id="unhide-ok-users" onClick={that.unhideOkUsers}><Glyphicon glyph="eye-close"/> Unhide OK</Button>
                    </ButtonGroup>
                </Col>
                <Col xs={3}>
                    <Button bsSize="small">
                        <FileExporter fileContent={that.state.nonOkUsers.join(", ")} fileName="non-ok-users-list.txt" buttonName="Extract Not-OK List"/>
                    </Button>
                </Col>
                <Col xs={2}>
                    <ModalTrigger modal={<RemarksModal />}>
                        <Button bsSize="small">Definitions</Button>
                    </ModalTrigger>
                </Col>
            </Row>
            {alert}
            {results}
        </div>)
    }
});

React.renderComponent(<ProblemUsersMaestro />, document.getElementById('problem-users'));

function booleanPresent(b) {
    switch (b) {
        case true: return <span className="inspection-ok">&#10004;</span>;
        case false: return <span className="inspection-not-ok">&#10008;</span>;
        case null: return <span>&#8211;</span>;
        default: return <span>&#63;</span>;
    }
}