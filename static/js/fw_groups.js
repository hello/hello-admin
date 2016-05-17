/** @jsx React.DOM */

var FeaturesTableBody = React.createClass({
    getDefaultProps: function() {
        return {data: []}
    },

    render: function () {
        var rows = [];
        this.props.data.forEach(function(d){
            var idsSpans = [];
            d.ids.forEach(function(id){
                var id_td = d.ids.indexOf(id) === d.ids.length - 1 ? id: id+", ";
                idsSpans.push(<span className="ids-td cursor-custom">{id_td}</span>);
            });
            rows.push(<tr>
                <td><span className="group-td cursor-custom">{d.name}</span></td>
                <td><div className="fw-group-ids">{idsSpans}</div></td>
                <td><span className="ids-all cursor-hand"><span className="ids-val">{d.ids.join(", ")}</span>
                    <img src="/static/image/copy.png"/></span></td>
            </tr>);
        });
        return (<tbody>
        {rows}
        </tbody>)
    }
});


var FeaturesTable = React.createClass({
    render: function() {
        return (<Table condensed bordered>
            <thead>
                <tr>
                    <th className="alert-info">Group</th>
                    <th className="alert-success">IDs</th>
                    <th className="alert-info">All</th>
                </tr>
            </thead>
            <FeaturesTableBody data={this.props.data} />
        </Table>)
    }
});

var FirmwareName = React.createClass({
     getInitialState: function() {
         return {unhashedVersion: ""}
     },
     unhashFirmwareName: function() {
         $.ajax({
                    url: '/api/firmware_unhash',
                    type: 'GET',
                    data: {version: parseInt(this.props.version, 10).toString(16)},
                    success: function(response) {
                        this.setState({unhashedVersion: response.data.join(",") || "unknown"});
                    }.bind(this)
                });
     },
     componentDidMount: function() {
         this.unhashFirmwareName();
     },

     render: function() {
         return <span>
                {this.props.version} -- {this.state.unhashedVersion}
            </span>
     }
 });
var FirmwareGroupStatus = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function() {
        return {group: "", groupStatus: []}
    },
    loadFirmwareGroupStatus: function(group) {
        if (group.isWhiteString()) {
            return [];
        }
        var groupStatus = [];
        $.ajax({
                   url: '/api/firmware_group_status',
                   dataType: 'json',
                   contentType: 'application/json',
                   data: {group: group.trim()},
                   type: 'GET',
                   async: false,
                   success: function(response) {
                       console.log("group status", response);
                       groupStatus = response.data;
                   }.bind(this)
               });
        return groupStatus;
    },
    render: function() {
        return <div>
            <Col xs={12} xsOffset={0}>
                <select className="form-control" valueLink={this.linkState("group")}>
                    <option value="">Select a Group</option>
                    {this.props.groups.map(function(g){return <option value={g.name}>{g.name}</option>;})}
                </select>
            </Col>
            <Table>
                <thead>
                <th>Version</th><th>Device ID</th><th>Timestamp</th>
                </thead>
                <tbody>{
                    this.loadFirmwareGroupStatus(this.state.group).map(function(gs){
                        return <tr>
                            <td><FirmwareName version={gs.middle_version}/></td>
                            <td>{gs.device_id}</td>
                            <td>{d3.time.format.utc("%b %d %H:%M")(new Date(gs.timestamp))}</td>
                        </tr>
                    })
                }</tbody>
            </Table>
        </div>
    }
});

var ConfigMaestro = React.createClass({
    getInitialState: function () {
        return {
            ids: "",
            data: [],
            groups: []
        };
    },

    populateInput: function () {
        $('.group-td').click(function(){
            $('#group-input').focus().val($(this).text());
        });
        $('.ids-td').click(function(){
            $('#ids-input').tagsinput('add', $(this).text());
            $('.bootstrap-tagsinput').children('input').focus();
        });
        $('.ids-all').click(function(){
            $('#ids-input').tagsinput('add', $(this).children(".ids-val").text());
            $('.bootstrap-tagsinput').children('input').focus();
        });
    },

    getFWGroups: function() {
        var that = this;
        $.ajax({
            url: '/api/fw_groups',
            dataType: 'json',
            contentType: 'application/json',
            type: 'GET',
            data: {mode: $('#mode-input').val()},
            success: function(response) {
                console.log(response.data);
                this.setState({
                    data: response.data
                });
                this.setState({groups: response.data});
                this.populateInput();
            }.bind(this),
            error: function(e) {
                console.error(e);
            }.bind(this)
        });
    },


    idExists: function(Ids) {
        var exists = false;
        var existingIds = [];
        this.state.data.forEach(function(d){

            d.ids.forEach(function(id){
                console.log(Ids);
                Ids.split(',').forEach(function(i){
                    if(id == i) {
                        exists = true;
                        existingIds.push(i);
                    }
                });

            });
       });
        return (existingIds)
    },

    handleModeChange: function() {
        this.getFWGroups();
    },
    componentDidMount: function () {
        this.getFWGroups();
    },

    handleSend: function(e) {
        var that = this;
        var action = $(e.target).attr('action') || $(e.target).parent('button').attr('action');
        console.log("IDs", this.state.data);
        if (action == "add") {
            var exisitingIds = this.idExists($('#ids-input').val());
            if (exisitingIds.length == 0) {
                var checkIds = $('#ids-input').val();
                this.setState({alert: null});
            } else {
                console.log("Exists", exisitingIds);
                this.setState({alert: <Alert>{exisitingIds.length} device(s) already in a FW group. Not adding. <br/>Found: {exisitingIds.join(", ")}</Alert>});
                return
            }
        }
        var sendData = {
            group: $('#group-input').val(),
            ids: $('#ids-input').val(),
            mode: $('#mode-input').val(),
            action: action
        };
        console.log('sending', sendData);
        $.ajax({
            url: '/api/fw_groups',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(sendData),
            type: 'PUT',
            success: function(response) {
                console.log("raw GET response", response);
                that.getFWGroups();
                this.setState({alert: <Alert>{action.toUpperCase()} Request Succeeded</Alert>});
            }.bind(this),
            error: function(e) {
                console.log(e);
                that.getFWGroups();
            }.bind(this)
        });
    },

    render: function () {
        var currentMode = $('#mode-input').val();
        var displayMode =  currentMode ? currentMode.capitalize().substring(0, currentMode.length - 1): null;
        var inputTypeRemark = currentMode === "users" ? "int": "string";
        return (
            <TabbedArea defaultActiveKey={1}>
                <TabPane key={1} tab="Edit Groups">
                    <Row>
                        &nbsp;
                    </Row>
            <Col xs={4}>
                <Panel header="Group Type Selection">
                    <Input id="mode-input" bsStyle="warning" type="select" defaultValue="devices" onChange={this.handleModeChange} addonBefore="Group Type">
                        <option value="devices">&#10148;&nbsp;Device</option>
                        <option value="users">&#10148;&nbsp;User</option>
                    </Input>
                </Panel>
                <Panel header="Group Editor">
                <h4><span>{displayMode}</span> Firmware Group Name <em className="remark">Enter a <strong>string</strong> or click to select existing &rarr;</em></h4>
                <Input id="group-input" type="text" placeholder="e.g alpha-dev" className="col-xs-3 col-md-3 col-lg-3"/>
                <p>&nbsp;</p>
                <h4><span>{displayMode}</span> ID(s) <em className="remark">Enter <strong>{inputTypeRemark}</strong>(s) or click to select existing &rarr;</em></h4>
                <LongTagsInput id="ids-input" tagClass="label label-info" placeHolder="e.g 123, 666, 987" />
                <div className="col-xs-12 col-md-12 col-lg-12">{this.state.alert}</div>
                <Button className="col-xs-4 col-md-4 col-lg-4" action="add" bsStyle="success" onClick={this.handleSend}><Glyphicon glyph="plus"/> Add</Button>
                <Button className="col-xs-4 col-md-4 col-lg-4" action="replace" bsStyle="primary" onClick={this.handleSend}><Glyphicon glyph="refresh"/> Replace</Button>
                <Button className="col-xs-4 col-md-4 col-lg-4" action="remove" bsStyle="danger" onClick={this.handleSend}><Glyphicon glyph="minus"/> Remove</Button>
                <p>&nbsp;</p><p>&nbsp;</p>
                <Button className="col-xs-12 col-md-12 col-lg-12" action="delete-group" bsStyle="danger" onClick={this.handleSend}><Glyphicon glyph="remove"/> Delete Group</Button>
                </Panel>
            </Col>
            <Col xs={8}>
                <Panel header="Current FW Groups">
                    <div id="fw-groups-list">
                <FeaturesTable data={this.state.data} />
                    </div>
                <button id="refresh" onClick={this.getFWGroups}/>
                </Panel>
            </Col>
                </TabPane>
                <TabPane key={2} tab="Group Status">
                    <Col xs={6}>
                        <Panel header="Firmware Group Status">
                            <FirmwareGroupStatus groups={this.state.groups} />
                        </Panel>
                    </Col>
                </TabPane>
            </TabbedArea>
        );
    }
});

React.renderComponent(<ConfigMaestro />, document.getElementById("fw_groups"));
