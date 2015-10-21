var DustCalibrationLeftOverMaster = React.createClass({
    getInitialState: function() {
        return {data: [], error: ""}
    },

    getAllLeftOverPairs: function() {
        $.ajax({
            url: this.props.apiUrl,
            type: "GET",
            success: function(response) {this.setState(response);}.bind(this)
        });
    },

    componentDidMount: function() {
        this.getAllLeftOverPairs();
    },

    render: function() {
        return <Table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Account ID</th>
                    <th>Internal Sense ID</th>
                    <th>External Sense ID</th>
                </tr>
            </thead>
            <tbody>{
                this.state.data.map(function(d, i){
                    return <tr>
                           <td>{i+1}</td>
                           <td><a target="_blank" href={"/account_profile/?input=" + d.account_id + "&type=account_id"}>{d.account_id}</a></td>
                           <td>{d.internal_device_id}</td>
                           <td>{d.external_device_id}</td>
                        </tr>
                })
            }</tbody>
        </Table>
    }
});

React.render(<DustCalibrationLeftOverMaster apiUrl="/api/dust_calibration_left_over" />, document.getElementById("dust-calibration-left-over"));