/** @jsx React.DOM */

var QueryFileManifest = React.createClass({
    getInitialState: function() {
        return {error: null, filteredResult: [], loading: false}
    },
    submitWithInputsfromURL: function() {
        var senseIdFromUrl = getParameterByName('sense_id');
        if (senseIdFromUrl.isWhiteString()) {
            return false;
        }
        $('#filemanifest-input').val(senseIdFromUrl);
        this.handleSubmit();
    },
    componentDidMount: function() {
        this.submitWithInputsfromURL();
    },
    handleSubmit: function() {
        this.setState({error: null, filteredResult: []});

        var omniInput = this.refs.omniInput.getDOMNode().value.trim();

        // if (omniInput.trim().length < 3) {
        //     this.setState({error: <Alert bsStyle="danger">Input string length must be at least 3 characters</Alert>});
        //     return false;
        // }
        
        $.ajax({
            url: "/api/files/" + omniInput,
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
        var files = this.state.filteredResult;
        files.sort();
        var table = <Table>
                <thead><tr>
                    <th>File</th>
                </tr></thead>
                <tbody>{
                    files.map(function(d){
                        return <tr>
                            <td>{d}</td>
                        </tr>
                    }.bind(this))
                }</tbody>
            </Table>;

        return (<Col xs={6}><form onSubmit={this.handleSubmit}>
            <h3>Files on Sense</h3>
            <input type="text" id="filemanifest-input" ref="omniInput" className="form-control"/>
            <hr className="fancy-line" /><br/>
            {table}
            {loadingOrSubmit}
        </form></Col>)
    }
});


React.renderComponent(<QueryFileManifest />, document.getElementById('filemanifest'));
