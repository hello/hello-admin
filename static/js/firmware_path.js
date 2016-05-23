var Tile = React.createClass({
    render: function() {
        return <Panel header={this.props.title}>
            <div className="tile-content">
                {this.props.content}
            </div>
            </Panel>
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
                    <input className="form-control" ref="groupName" type="text" placeholder="group name" value={this.props.group_name}/><br/>
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

var FirmwareGroupPath = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function() {
        return {group: "release", groupPath: []}
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
            }.bind(this)
        });
    },
    render: function() {
        return <div>

            <Row>
                <Col xs={2}>
                    <ModalTrigger modal={<AddFirmwareUpgradeNodeModal group_name={this.state.group}/>}>
                        <Button><Glyphicon glyph="plus" /></Button>
                    </ModalTrigger>
                </Col>
                <Col xs={10} xsOffset={0}>
                    <select className="form-control" valueLink={this.linkState("group")}>
                        <option value="">Select a Group</option>
                        <option value="release">release</option>
                        {this.props.groups.map(function(g){return <option value={g.name}>{g.name}</option>;})}
                    </select>
                </Col>
            </Row>

            <Table striped={true} hover={true}>
                <thead>
                    <th>From Firmware</th><th>To Firmware</th><th>%</th><th/>
                </thead>
                <tbody>{
                    this.loadFirmwareGroupPath(this.state.group).map(function(gp){
                        var percentHighlight = "";
                        if (gp.rolloutPercent < 100){ percentHighlight="rollout";}
                        return <tr>
                            <td><span className={percentHighlight}><FirmwareName version={gp.fromFWVersion}/></span></td>
                            <td><span className={percentHighlight}><FirmwareName version={gp.toFWVersion}/></span></td>
                            <td><span className={percentHighlight}>{gp.rolloutPercent}</span></td>
                            <td><Button bsSize="xsmall" onClick={this.removeFirmwareUpgradeNode.bind(this, gp.groupName, gp.fromFWVersion)}><Glyphicon glyph="trash"/></Button></td>
                        </tr>
                    }.bind(this))
                }</tbody>
            </Table>
        </div>
    }
});

var FirmwareMap = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function() {
      return {fwHash: []}
  },
  addFWMap: function() {
      var firmware_version = $('#firmware_version').val();
      if (firmware_version.isWhiteString()) {
          return [];
      }
      console.log(firmware_version);
      var fwHash = [];
      $.ajax({
         url: '/api/fw_map',
         dataType: 'json',
         contentType: 'application/json',
         data: JSON.stringify({fw_version: firmware_version}),
         type: 'POST',
         async: false,
         success: function(response) {
             console.log(response.data);
             if (response.data.fw_hash != null) {
                 fwHash = response.data.fw_hash;
                 this.setState({alert: <Alert>{parseInt('0x' + fwHash, 16)} added as map of {firmware_version}</Alert>});
             } else {
                 this.setState({alert: <Alert>Map for {firmware_version} failed. Ensure FW is uploaded to S3.</Alert>});
             }
         }.bind(this),
         error: function(xhr, status, err) {
             console.error(status, err);
         }.bind(this)
     });
      return fwHash;
  },
  render: function() {
      return <div>
          <Row>
              <Col xs={4}>
                  <Input id="firmware_version" type="text" placeholder="<FW Version>" hasFeedback />
              </Col>
              <Col xs={2}>
                  <Button onClick={this.addFWMap}><Glyphicon glyph="plus"/></Button>
              </Col>
              <Col xs={6} xsOffset={0}>
                  {this.state.alert}
              </Col>
          </Row>
      </div>
  }
});

var FirmwarePathMaster = React.createClass({
    getInitialState: function() {
        return {groups: [], selectedGroup: ""}
    },
    loadFirmwareGroups: function() {
        $.ajax({
            url: '/api/fw_groups',
            dataType: 'json',
            contentType: 'application/json',
            data: {mode: "devices"},
            type: 'GET',
            success: function(response) {
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
                   <Tile title="Add Firmware Version Map" content={<FirmwareMap />} />
                </Col>
            <Row>
                <Col xs={12}>
                    <Tile title="Firmware Upgrade Paths" content={<FirmwareGroupPath groups={this.state.groups} />} />
                </Col>
            </Row>
            </Row>
    }
});

React.render(<FirmwarePathMaster />, document.getElementById("firmware-path"));