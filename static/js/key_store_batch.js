var KeyStoreInfoTable = React.createClass({
    render: function() {
        return $.isEmptyObject(this.props.data) ? null : <Table>
            <thead><tr>
                <th>{this.props.deviceType + " ID"}</th>
                <th>Key</th>
                <th>Created</th>
                <th>Metadata</th>
            </tr></thead>
            <tbody>{
                Object.keys(this.props.data).map(function(k){
                    var v = this.props.data[k];
                    return <tr>
                        <td><a target="_blank" href={"/account_profile/?input=" + v.device_id + "&type=" + this.props.deviceType + "_id"}>{v.device_id}</a></td>
                        <td>{v.key.slice(0,4) + "..." + v.key.slice(v.key.length-4, v.key.length)}</td>
                        <td>{v.created_at}</td>
                        <td>{v.metadata}</td>
                    </tr>;
                }.bind(this))
            }</tbody>
        </Table>;
    }
});

var KeyStoreBatch = React.createClass({
    getInitialState: function() {
        return {data: {}, error: "", keylessDevices: []};
    },
    loadKeys: function() {
        this.setState(this.getInitialState());
        var ids = $("#" + this.props.deviceType + "-ids").val().split(",").map(function(id){return id.trim();});
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            data: JSON.stringify(ids),
            type: "POST",
            success: function(response) {
                var keylessDevices =  ids.filter(function(id){return Object.keys(response.data).indexOf(id) < 0;});
                this.setState({data: response.data, error: response.error, keylessDevices: keylessDevices});

            }.bind(this)
        });
        return false;
    },
    render: function() {
        console.log(this.state.data);
        var keylessDevicesDisplay = this.state.keylessDevices.length === 0 ? null : <div className="keyless">Keyless {this.props.deviceType}s: {this.state.keylessDevices.join(", ")}</div>;
        return <Col xs={6}>
            <form onSubmit={this.loadKeys}>
                <Col xs={10}>
                    <Input type="text" id={this.props.deviceType + "-ids"} ref="ids" placeholder={this.props.deviceType + " IDs comma separated"} />
                </Col>
                <Col xs={2}>
                    <Button type="submit"><Glyphicon glyph="search"/></Button>
                </Col>
            </form>
            <KeyStoreInfoTable data={this.state.data} deviceType={this.props.deviceType} />
            {keylessDevicesDisplay}
        </Col>;
    }
});


var KeyStoreBatchMaster = React.createClass({
    render: function() {
        return <div>
            <KeyStoreBatch deviceType="sense" url="/api/sense_key_store" />
            <KeyStoreBatch deviceType="pill" url="/api/pill_key_store" />
        </div>;
    }
});


React.render(<KeyStoreBatchMaster />, document.getElementById("key-store-batch"));