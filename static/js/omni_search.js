/** @jsx React.DOM */
var omniTimeFormat = d3.time.format('%a %d %b %H:%M %Z');
var OmniTableContent = React.createClass({
    render: function() {
        var thisContent = this.props.content;
        var combine = Object.keys(thisContent.profile).map(function(k){
            switch (k) {
                case "last_modified":
                    return <tr><td>Last Modified</td><td>{thisContent.profile[k] ? 
                        omniTimeFormat(new Date(thisContent.profile[k])) : "unknown"}</td></tr>;
                case "email_verified":
                    return null;
                default:
                    return <tr><td>{k.capitalize()}</td><td>{thisContent.profile[k]}</td></tr>;
            }
        });

        thisContent.devices.forEach(function(device){

            var debugLogLink = <a href={(device.type === "SENSE" ? "/sense_logs/?devices=" : "/battery/?search=")+ device.deviceId} target="_blank" title="View sense logs">
                    <Label bsStyle= {device.state === "NORMAL" ? "success" : (device.state === "UNPAIRED" ? "danger" : "warning")}>{device.deviceId}</Label>
                </a>;

            var deviceLabel = [
                <a href={"/key_store/?device=" + device.deviceId + "&type=" + device.type.toLowerCase()} title="View key hint" target="_blank">
                   <Glyphicon glyph="barcode" />
                </a>,
                <span>&nbsp;{device.type}</span>, <br/>,
                debugLogLink, <br/>
            ];
            console.log(Number(device.lastSeen));
            var deviceLastSeen = <span>Last Seen: <span className=
                { isNaN(device.lastSeen) || (device.type === "SENSE" && device.lastSeen < new Date().getTime() - 3600*1000) || (device.type === "PILL" && device.lastSeen < new Date().getTime() - 4*3600*1000) ? "inactive-devices" : "active-devices"}>
                { isNaN(device.lastSeen) ? "unknown" : omniTimeFormat(new Date(device.lastSeen))}
                </span></span>;

            var deviceDetail = [
                deviceLastSeen, <br/>,
                device.type === "SENSE" ?
                <span>Firmware Version: <a href={"/firmware/?device_id=" +  device.deviceId} target="_blank">
                    {device.firmwareVersion || <span className="inactive-devices">unknown</span>}
                </a></span>:
                <span>Battery Level: <a href={"/battery/?search=" + device.deviceId} target="_blank">
                    {device.batteryLevel}
                </a></span>,
                <br/>
            ];

            combine.unshift(
                <tr>
                    <td>{deviceLabel}</td>
                    <td>{deviceDetail}</td>
                </tr>);
        });

        if (thisContent.zendesk && thisContent.zendesk.count == 0) {
            Object.keys(thisContent.zendesk).forEach(function(k){
                combine.push(
                    <tr>
                        <td>{k}</td>
                        <td>{thisContent.zendesk[k]}</td>
                    </tr>);
            });
        }


        return <Table responsive>
            <thead><tr><th className="col-xs-1">Attribute</th><th className="col-xs-3">Value</th></tr></thead>
            <tbody className="omni-search-table-body">{combine}</tbody>
        </Table>;
    }
});


var OmniResultsTable = React.createClass({
    populateSearch: function(e) {
        $('#omni-input').focus().val($(e.target).text());
        $("#omni-submit").click();
    },
    render: function() {
        var that = this;
        var preview = this.props.data.map(function(d){
            var devices = d.devices.map(function(device){
                return <div>
                    <span className="cursor-custom" onClick={that.populateSearch}>{device.deviceId}</span>
                </div>;
            });
            return <Alert><Table>
                <tbody>
                    <tr>
                        <td className="col-xs-1">
                            <Badge className="cursor-custom" onClick={that.populateSearch}>{d.profile.id}</Badge>
                        </td>
                        <td className="col-xs-3">
                            <span className="cursor-custom" onClick={that.populateSearch}>{d.profile.name}</span>
                        &nbsp;(<span className="cursor-custom" onClick={that.populateSearch}>{d.profile.email}</span>)
                        </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td>{devices}</td>
                    </tr>
                </tbody>
            </Table></Alert>;
        });
        var content = this.props.data.length === 1 ? <OmniTableContent content={this.props.data[0]}/>
            : <div className="omni-search-table-body"><br/>{preview}</div>;
        return (<div>{content}</div>)
    }
});
var OmniMaestro = React.createClass({
    getInitialState: function() {
        return {
            data: [],
            alert: ""
        }
    },

    componentDidMount: function() {
        this.submitWithInputsfromURL();
    },

    submitWithInputsfromURL: function() {
        var omniInputFromURL = getParameterByName('omni_input');
        if (omniInputFromURL.isWhiteString()) {
            return false;
        }
        $('#omni-input').val(omniInputFromURL);
        this.handleSubmit();
    },

    handleSubmit: function() {
        var that = this, omniInput = $("#omni-input").val();
        history.pushState({}, '', '/users/?omni_input=' + omniInput);

        if (isNaN(Number(omniInput)) && omniInput.trim().length < 3) {
            that.setState({data: [], alert: "Search string should be at least 3 characters"});
            return false;
        }

        $.ajax({
            url: "/api/omni_search",
            dataType: 'json',
            type: 'GET',
            data: {omni_input: omniInput},
            success: function(response) {
                console.log(response);
                if (response.error) {
                    that.setState({data: [], alert: response.error});
                }
                else {
                    that.setState({data: response.data, alert: ""});
                }
            }
        });
        return false;
    },

    render: function() {
        var alert = this.state.alert.isWhiteString() ? null:<p>{this.state.alert}</p>;
        var results = this.state.data.length === 0 ? null:<OmniResultsTable data={this.state.data}/>;
        return (<div className="fancy-box">
            <form onSubmit={this.handleSubmit}>
                <div className="input-group input-group-md">
                    <div className="icon-addon addon-md">
                        <input
                        id="omni-input"
                        className="form-control"
                        type="text"
                        placeholder="UserID || Email|Name partial || Pill|SenseID"
                        />
                        <label for="omni-input" className="glyphicon glyphicon-pencil"></label>
                    </div>
                    <span className="input-group-btn">
                        <button id="omni-submit" className="btn btn-default form-control" type="submit">
                            <span className="glyphicon glyphicon-search"/>
                        </button>
                    </span>
                </div>
            </form>
            {alert}
            {results}
        </div>);
    }
});

React.renderComponent(<OmniMaestro />, document.getElementById('by-email'));
