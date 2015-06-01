var Tile = React.createClass({
    render: function() {
        return <div className="tile">
            <div className="tile-title">
                {this.props.title}
            </div>
            <br/>
            <div className="tile-content">
                {this.props.content}
            </div>
        </div>
    }
});

var GetSenseBlackList = React.createClass({
    getInitialState: function () {
        return {alert: null};
    },
    retrieveBlackList: function() {
        $.ajax({
            url: '/api/sense_black_list',
            dataType: 'json',
            type: 'GET',
            success: function (response) {
                console.log(response);
                this.setState({alert: response.error ?
                    <Alert bsStyle="danger">{response.error}</Alert> :
                    response.data.map(function(sense){return <p>{sense}</p>;})
                });
            }.bind(this)
        });
    },
    componentDidMount: function() {
        this.retrieveBlackList();
    },
    render: function() {
        return <div>
            {this.state.alert}
            <Button onClick={this.retrieveBlackList} id="refresh-ban-list"/>
        </div>
    }
});
var PutSenseBlackList = React.createClass({
    getInitialState: function () {
        return {alert: null, placeholder: "Sense ID, e.g:\nABC123\nX1Y2Z3\nNULLVOID"};
    },
    componentDidMount: function() {
        var senses = $("#senses");
        var that = this;
        senses.val(this.state.placeholder);
        senses.focus(function(){
            if($(this).val() === that.state.placeholder){
                $(this).val('');
            }
        });
        senses.blur(function(){
            if($(this).val() === ''){
                $(this).val(that.state.placeholder);
            }
        });
    },
    updateBlackList: function () {
        if (this.refs.senses.getDOMNode().value === this.state.placeholder || this.refs.senses.getDOMNode().value.isWhiteString()) {
            this.setState({alert: <Alert bsStyle="info">Invalid input !</Alert>});
            return false;
        }
        this.setState({alert: <Alert bsStyle="warning">Checking...</Alert>});
        var bannedSenses = this.refs.senses.getDOMNode().value.split("\n");
        $.ajax({
            url: '/api/sense_black_list',
            dataType: 'json',
            type: $("#update-mode").val(),
            data: JSON.stringify(bannedSenses.map(function(sense){return sense.trim()})),
            success: function (response) {
                console.log(response);
                this.setState({alert: response.error ?
                    <Alert bsStyle="danger">{response.error}</Alert> :
                    <Alert bsStyle="success">SUCCESS</Alert>
                });
                if (response.error.isWhiteString()) {
                    $("#refresh-ban-list").trigger("click");
                }
            }.bind(this)
        });
        return false;
    },
    render: function() {
        return (<div>
            <Input type="select" id="update-mode">
                <option value="POST">Append</option>
                <option value="PUT">Overwrite</option>
            </Input>
            <form onSubmit={this.updateBlackList}>
                <div><textarea id="senses" className="form-control" ref="senses" type="text"/></div><br/>
                <div><Button className="submit" type="submit">Submit</Button></div><br/>
            </form>
            {this.state.alert}
        </div>)
    }
});

var BlackListMaster = React.createClass({
    render: function() {
        return (<div><br/><br/>
            <Row>
                <Col xs={6}><Tile title="Update Sense Black List" content={<PutSenseBlackList />} /></Col>
                <Col xs={6}><Tile title="Current Sense Black List" content={<GetSenseBlackList />} /></Col>
            </Row>
        </div>);
    }
});

React.render(<BlackListMaster />, document.getElementById('black-list'));


