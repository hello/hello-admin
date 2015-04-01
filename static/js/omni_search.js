/** @jsx React.DOM */

var OmniTableContent = React.createClass({
    render: function() {
        var thisContent = this.props.content;
        var combine = Object.keys(thisContent.profile).map(function(k){
            return <tr><td>{k}</td><td>{thisContent.profile[k]}</td></tr>;
        });

        thisContent.devices.forEach(function(device){
            var debugLogLink = device.type === "PILL" ?
                <a href={"/battery/?search=" + device.device_id} target="_blank" title="See pill status">
                    <Label bsStyle= {device.state === "NORMAL" ? "success": "danger"}>{device.device_id}</Label>
                </a>
                :
                <a href={"/sense_logs/?devices=" + device.device_id} target="_blank" title="Go to sense log">
                    <Label bsStyle= {device.state === "NORMAL" ? "success": "danger"}>{device.device_id}</Label>
                </a>;
            var deviceLabel = [
                <span>{device.type}</span>, <br/>,
                debugLogLink, <br/>,
                <a href={"/key_store/?device=" + device.device_id + "&type=" + device.type.toLowerCase()} target="_blank">view KeyStore</a>
            ];
            var deviceDetail = [
                <span>last seen: {new Date(device.last_updated).toLocaleString()}</span>, <br/>,
                <span>state: {device.state}</span>, <br/>,
                <span>firmware version: {device.firmware_version}</span>, <br/>
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
                    <span className="cursor-custom" onClick={that.populateSearch}>{device.device_id}</span>
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
                        placeholder="UserID || Email|Name partial || DeviceID"
                        />
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