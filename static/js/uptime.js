/** @jsx React.DOM */

var QueryUptime = React.createClass({
    getInitialState: function() {
        return {error: null, filteredResult: [], loading: false}
    },
    handleSubmit: function() {
        this.setState({error: null, filteredResult: []});

        var omniInput = this.refs.omniInput.getDOMNode().value.trim();

        // if (omniInput.trim().length < 3) {
        //     this.setState({error: <Alert bsStyle="danger">Input string length must be at least 3 characters</Alert>});
        //     return false;
        // }
        
        $.ajax({
            url: "/api/uptime/" + omniInput,
            type: "GET",
            dataType: 'json',
            success: function (response) {
                console.log(response);
                this.setState({filteredResult: response.data});
            }.bind(this)
        });
        
        return false;
    },
    render: function() {
        var loadingOrSubmit = <Button bsStyle="info" bsSize="large" className="btn-circle" type="submit"><Glyphicon glyph="send"/></Button>;
        var uptimes = this.state.filteredResult;
        uptimes.sort(function compareUptime(a, b) {
                return a.uptime - b.uptime // sort by uptime
        });
        var table = <Table>
                <thead><tr>
                    <th>DeviceId</th>
                    <th>Uptime</th>
                </tr></thead>
                <tbody>{
                    uptimes.map(function(d){
                        return <tr>
                            <td>{d.device_id}</td>
                            <td>{d.uptime}</td>
                        </tr>
                    }.bind(this))
                }</tbody>
            </Table>;

        return (<Col xs={6}><form onSubmit={this.handleSubmit}>
            <h3>Uptime by firmware group</h3>
            <input type="text" id="uptime-input" ref="omniInput" className="form-control"/>
            <hr className="fancy-line" /><br/>
            {table}
            {loadingOrSubmit}
        </form></Col>)
    }
});


React.renderComponent(<QueryUptime />, document.getElementById('uptime'));

function isValidRequest(r) {
    return Object.keys(r).every(function(k){return r[k] && !r[k].isWhiteString()})
}
