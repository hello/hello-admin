var RecentDevice = React.createClass({
    getInitialState: function() {
        return {recent_devices: []};
    },

    componentDidMount: function() {
        this.getRecentDevices();
    },

    getRecentDevices: function() {
        
        $.ajax({
            url: "/api/devices/recent",
            type: "GET",
            success: function (response) {
                this.setState({recent_devices: response.data});
            }.bind(this)
        });
    },

    render: function() {
        
        var devices = this.state.recent_devices.map(function(d){
            var timestamp = moment.unix(d.paired_on / 1000).format("MMM-D HH:mm");

            return <tr>
                <td><a href={"/account_profile/?input=" +d.sense_id + "&type=sense_id"}>{d.sense_id}</a></td>
                <td>{d.hw_version}</td>
                <td>{timestamp}</td>
                <td>{d.account_id}</td>
            </tr>
        });

        return <table>
            <tr>
                <th>Sense Id</th>
                <th>Version</th>
                <th>Paired on</th>
                <th>Account id</th>
            </tr>
        {devices}
        </table>;
    }
});

React.render(<RecentDevice />, document.getElementById("recent-devices"));
