var WifiTile = React.createClass({
    getInitialState: function() {
        return {senseId: "", wifiInfo: {}}
    },
    loadWifi: function(senseId) {
        $.ajax({
            url: "/api/wifi_info",
            dataType: "json",
            type: 'GET',
            aysnc: false,
            data: {sense_id: senseId},
            success: function (response) {
                if (response.error.isWhiteString()) {
                    this.setState({wifiInfo: response.data});
                }
            }.bind(this)
        });
    },

    componentWillReceiveProps: function() {
        if (this.state.senseId !== this.props.senseId) {
            if (this.props.senseId) {
                this.loadWifi(this.props.senseId);
                this.setState({senseId: this.props.senseId});
            }
        }
    },
    render: function() {
        //var response = this.props.wifiResponse;
        //var networksTable = response.data.networks && response.data.networks.length > 0 ? <Table>
        //    <thead>
        //        <tr><th>Network SSID</th><th>Strength</th></tr>
        //    </thead>
        //    <tbody>{
        //        response.data.networks.map(function(w){return <tr>
        //            <td>{w.network_name}</td>
        //            <td className="center-wrapper">{w.signal_strength}</td>
        //        </tr>;})
        //    }<tr><td/><td/></tr></tbody>
        //</Table> : null;
        return <div>Placeholder</div>;
        //return <div>
        //    {networksTable}
        //    <p> Last Scan: {response.data.scan_time ? new Date(Number(response.data.scan_time) * 1000).toUTCString() : null}</p>
        //</div>
    }
});