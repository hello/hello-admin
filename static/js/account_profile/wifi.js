var utcFormatter = d3.time.format.utc("%a&nbsp;&nbsp;%d&nbsp;&nbsp;%b&nbsp;&nbsp;%Y<br>%H : %M : %S - GMT");

var WifiTile = React.createClass({
    getInitialState: function() {
        return {senseId: "", wifiInfo: {
            ssid: "",
            rssi:  "",
            condition:  "",
            last_updated:  ""
        }}
    },

    loadWifi: function(senseId) {
        this.getInitialState();
        $.ajax({
            url: "/api/wifi_info",
            dataType: "json",
            type: 'GET',
            aysnc: false,
            data: {sense_id: senseId},
            success: function (response) {
                if (response.error.isWhiteString()) {
                    this.setState({wifiInfo: {
                        ssid: response.data.ssid,
                        rssi:  response.data.rssi,
                        condition:  response.data.condition,
                        last_updated:  <span dangerouslySetInnerHTML={{__html: utcFormatter(new Date(response.data.last_updated))}}/>
                    }});
                }
                else {
                    this.setState({wifiInfo: {
                        ssid: <span className="not-ok">--</span>,
                        rssi:  <span className="not-ok">--</span>,
                        condition:  <span className="not-ok">--</span>,
                        last_updated:  <span className="not-ok">--</span>
                    }});
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
        return <Table>
            <tbody>
                <tr><td>SSID</td><td>{this.state.wifiInfo.ssid}</td></tr>
                <tr><td>RSSI</td><td>{this.state.wifiInfo.rssi}</td></tr>
                <tr><td>Condition</td><td>{this.state.wifiInfo.condition}</td></tr>
                <tr><td>Last Updated</td><td>{this.state.wifiInfo.last_updated}</td></tr>
            </tbody>
        </Table>;
    }
});