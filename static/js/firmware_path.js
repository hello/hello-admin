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


var FirmwareGroupStatus = React.createClass({
    getInitialState: function() {
        return {groupStatus: []}
    },
    loadFirmwareGroupStatus: function(group) {
        $.ajax({
            url: '/api/firmware_group_status',
            dataType: 'json',
            contentType: 'application/json',
            data: {group: group},
            type: 'GET',
            success: function(response) {
                console.log("group status", response);
                this.setState({groupStatus: response.data});
            }.bind(this)
        });
    },
    componentWillReceiveProps: function() {
        this.loadFirmwareGroupStatus(this.props.parent.refs.group.getDOMNode().value);
    },
    render: function() {
        return <Table>
            <thead>
                <th>Version</th><th>Device ID</th><th>Timestamp</th>
            </thead>
            <tbody>{
                this.state.groupStatus.map(function(gs){
                    return <tr>
                        <td>{gs.version}</td>
                        <td>{gs.device_id}</td>
                        <td>{d3.time.format.utc("%b %d %H:%M")(new Date(gs.timestamp))}</td>
                    </tr>
                })
            }</tbody>
        </Table>
    }
});

var FirmwareGroupPath = React.createClass({
    getInitialState: function() {
        return {groupPath: [], updateIter: 0}
    },
    loadFirmwareGroupPath: function(group) {
        $.ajax({
            url: '/api/firmware_group_path',
            dataType: 'json',
            contentType: 'application/json',
            data: {group: group},
            type: 'GET',
            success: function(response) {
                console.log("group path", response);
                this.setState({groupPath: response.data});
            }.bind(this)
        });
    },
    componentWillReceiveProps: function() {
        this.loadFirmwareGroupPath(this.props.parent.refs.group.getDOMNode().value);
    },
    render: function() {
        return <Table>
            <thead>
                <th>From Firmware</th><th>To Firmware</th><th>Rollout Percentage</th>
            </thead>
            <tbody>{
                this.state.groupPath.map(function(gp){
                    return <tr>
                        <td>{gp.fromFWVersion}</td>
                        <td>{gp.toFWVersion}</td>
                        <td>{gp.rolloutPercent}</td>
                    </tr>
                })
            }</tbody>
        </Table>
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
                this.setState({groups: response.data.reverse().map(function(g){return <option value={g.name}>{g.name}</option>;})});
            }.bind(this)
        });
    },

    handleChange: function() {
        this.setState({updateIter: this.state.updateIter + 1});
    },

    componentDidMount: function() {
        this.loadFirmwareGroups();
    },

    render: function() {
        return <div>
            <Row>
                <Col xs={6} xsOffset={3}><form>
                    <select className="form-control" id="group" ref="group" onChange={this.handleChange}>
                        <option value="">Select a Group</option>
                        {this.state.groups}
                    </select>
                </form></Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <Tile title="Firmware Status" content={<FirmwareGroupStatus parent={this} updateIter={this.state.updateIter} />} />
                </Col>
                <Col xs={6}>
                    <Tile title="Firmware Path" content={<FirmwareGroupPath parent={this} updateIter={this.state.updateIter} />} />
                </Col>
            </Row>
        </div>
    }
});

React.render(<FirmwarePathMaster />, document.getElementById("firmware-path"));