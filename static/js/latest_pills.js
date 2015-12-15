var LatestPillsMaster = React.createClass({
    getInitialState: function() {
        return {data: [], error: "", limit: 10, loading: null};
    },

    componentDidMount: function() {
        this.getLatestPillsData();
    },

    getLatestPillsData: function(maxId) {
        this.setState({data: [], error: "", loading: <img src="/static/image/loading.gif"/> });
        $.ajax({
            url: "/api/pill_latest/data",
            dataType: "json",
            data: maxId ? {limit: this.state.limit, max_id: maxId} : {limit: 10},
            type: "GET",
            success: function(response) {
                this.setState(response);
                this.setState({loading: null});
            }.bind(this)
        })
    },
    render: function() {
        var data = this.state.data;
        console.log(data);
        return <div><Table>
            <thead><tr>
                <th>Internal Pill ID</th>
                <th>External Pill ID</th>
                <th>Account ID</th>
                <th>Battery Level</th>
                <th>Firmware Version</th>
                <th>Uptime</th>
                <th>Created At</th>
            </tr></thead>
            <tbody>{
                data.map(function(d){
                    var latestHeartbeat = d.pill_heart_beats.length === 0 ?
                        [
                            <td> - </td>,
                            <td> - </td>,
                            <td> - </td>,
                            <td> - </td>
                        ]:
                        [
                            <td>{d.pill_heart_beats[0].battery_level}</td>,
                            <td>{d.pill_heart_beats[0].firmware_version}</td>,
                            <td>{d.pill_heart_beats[0].uptime}</td>,
                            <td>{new Date(d.pill_heart_beats[0].created_at).toLocaleString()}</td>
                        ];

                    return <tr>
                        <td>{d.device_account_pair.internal_device_id}</td>
                        <td>{d.device_account_pair.external_device_id}</td>
                        <td>{d.device_account_pair.account_id}</td>
                        {latestHeartbeat}
                    </tr>
                }.bind(this))
            }</tbody>
        </Table>
        {data.length === 0 ? null :
            [
                <Button onClick={this.getLatestPillsData.bind(this, data[0].device_account_pair.internal_device_id + this.state.limit)}>Prev</Button>,
                <Button onClick={this.getLatestPillsData.bind(this, data[data.length-1].device_account_pair.internal_device_id)}>Next</Button>,
                this.state.loading
            ]

        }
        {this.state.error ? <Alert>{this.state.error}</Alert> : null}
        </div>
    }
});

React.render(<LatestPillsMaster />, document.getElementById("latest-pills"));