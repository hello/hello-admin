var Tile = React.createClass({
    render: function() {
        return <div className="tile">
            <div className="tile-title">
                {this.props.title}
            </div>
            <br/>
            <div className="tile-content">
                {this.props.content}
            </div>
        </div>
    }
});


var AddFirmwareUpgradeNodeModal = React.createClass({
    addFirmwareUpgradeNode: function() {
        $.ajax({
            url: '/api/firmware_group_path',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                group_name: this.refs.groupName.getDOMNode().value,
                from_fw_version: this.refs.fromFWVersion.getDOMNode().value,
                to_fw_version: this.refs.toFWVersion.getDOMNode().value,
                rollout_percent: this.refs.rolloutPercent.getDOMNode().value
            }),
            type: 'PUT',
            success: function(response) {
                console.log(response);
            }.bind(this)
        });
        this.props.onRequestHide();
    },
    saveNewFirmwareUpgradeNode: function() {
        this.addFirmwareUpgradeNode();
    },
    render: function() {
        return (
            <Modal animation={false}>
                <div className='modal-header'>
                    Add a new firmware upgrade node
                </div>
                <div className='modal-body'>
                    <input className="form-control" ref="groupName" type="text" placeholder="group name"/><br/>
                    <input className="form-control" ref="fromFWVersion" type="text" placeholder="from firmware version (int)"/><br/>
                    <input className="form-control" ref="toFWVersion" type="text" placeholder="to firmware version (int)"/><br/>
                    <input className="form-control" ref="rolloutPercent" type="text" placeholder="rollout percent"/>
                </div>
                <div className='modal-footer'>
                    <Button onClick={this.saveNewFirmwareUpgradeNode}>Save</Button>
                    <Button onClick={this.props.onRequestHide}>Close</Button>
                </div>
            </Modal>
        );
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
            <Col xs={8} xsOffset={2}>
                <select className="form-control" valueLink={this.linkState("group")}>
                    <option value="">Select a Group</option>
                    {this.props.groups.reverse().map(function(g){return <option value={g.name}>{g.name}</option>;})}
                </select>
            </Col>
            <Table>
                <thead>
                    <th>Version</th><th>Device ID</th><th>Timestamp</th>
                </thead>
                <tbody>{
                    this.loadFirmwareGroupStatus(this.state.group).map(function(gs){
                        return <tr>
                            <td>{gs.version}</td>
                            <td>{gs.device_id}</td>
                            <td>{d3.time.format.utc("%b %d %H:%M")(new Date(gs.timestamp))}</td>
                        </tr>
                    })
                    }</tbody>
            </Table>
        </div>
    }
});

var FirmwareGroupPath = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function() {
        return {group: "", groupPath: []}
    },
    loadFirmwareGroupPath: function(group) {
        if (group.isWhiteString()) {
            return [];
        }
        var groupPath = [];
        $.ajax({
            url: '/api/firmware_group_path',
            dataType: 'json',
            contentType: 'application/json',
            data: {group: group.trim()},
            type: 'GET',
            async: false,
            success: function(response) {
                console.log("group path", response);
                groupPath = response.data;
            }.bind(this)
        });
        return groupPath;
    },
    removeFirmwareUpgradeNode: function(groupName, fromFWVersion) {
        $.ajax({
            url: '/api/firmware_group_path',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({group_name: groupName, from_fw_version: fromFWVersion}),
            type: 'POST',
            success: function(response) {
                console.log(response);
                this.loadFirmwareGroupPath(groupName);
            }.bind(this)
        });
    },
    render: function() {
        return <div>

            <Row>
                <Col xs={2}>
                    <ModalTrigger modal={<AddFirmwareUpgradeNodeModal />}>
                        <Button><Glyphicon glyph="plus" /></Button>
                    </ModalTrigger>
                </Col>
                <Col xs={6} xsOffset={2}>
                    <select className="form-control" valueLink={this.linkState("group")}>
                        <option value="">Select a Group</option>
                        <option value="release">Release</option>
                        {this.props.groups.reverse().map(function(g){return <option value={g.name}>{g.name}</option>;})}
                    </select>
                </Col>
            </Row>

            <Table>
                <thead>
                    <th>From Firmware</th><th>To Firmware</th><th>Rollout Percentage</th>
                </thead>
                <tbody>{
                    this.loadFirmwareGroupPath(this.state.group).map(function(gp){
                        return <tr>
                            <td>{gp.fromFWVersion}</td>
                            <td>{gp.toFWVersion}</td>
                            <td>{gp.rolloutPercent}</td>
                            <td><Button onClick={this.removeFirmwareUpgradeNode.bind(this, gp.groupName, gp.fromFWVersion)}><Glyphicon glyph="trash"/></Button></td>
                        </tr>
                    }.bind(this))
                }</tbody>
            </Table>
        </div>
    }
});

var FirmwarePathMaster = React.createClass({
    getInitialState: function() {
        return {groups: [], selectedGroup: ""}
    },
    loadFirmwareGroups: function() {
        $.ajax({
            url: '/api/teams',
            dataType: 'json',
            contentType: 'application/json',
            data: {mode: "devices"},
            type: 'GET',
            success: function(response) {
                console.log(response);
                this.setState({groups: response.data});
            }.bind(this)
        });
    },
    componentDidMount: function() {
        this.loadFirmwareGroups();
    },
    render: function() {
        return <Row>
            <Col xs={6}>
                <Tile title="Firmware Status" content={<FirmwareGroupStatus groups={this.state.groups} />} />
            </Col>
            <Col xs={6}>
                <Tile title="Firmware Path" content={<FirmwareGroupPath groups={this.state.groups} />} />
            </Col>
        </Row>
    }
});

React.render(<FirmwarePathMaster />, document.getElementById("firmware-path"));