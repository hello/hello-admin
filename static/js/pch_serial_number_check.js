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

var PCHSerialNumberCheckForSense = React.createClass({
    getInitialState: function () {
        return {alert: null};
    },
    handleSubmit: function () {
        var that = this;
        that.setState(that.getInitialState());
        $.ajax({
            url: '/api/pch_sn_check',
            dataType: 'json',
            type: 'POST',
            data: {
                sn: JSON.stringify(that.refs.sn.getDOMNode().value.split(",").map(function(ssn){return ssn.trim()})),
                device_type: "sense"
            },
            success: function (response) {
                console.log(response);
                that.setState({alert: response.error ?
                    <Alert bsStyle="danger">{response.error}</Alert> :
                    <Alert bsStyle="success">Missing pill serial numbers: <br/>{JSON.stringify(response.data)}</Alert>
                });
            }
        });
        return false;
    },
    render: function() {
        return (<div>
            <form onSubmit={this.handleSubmit}>
                <div><textarea id="ssn" className="form-control" ref="sn" type="text" placeholder="SNs (comma seprated), e.g: ssn1, ssn2 "/></div><br/>
                <div><Button className="submit" type="submit">Submit</Button></div><br/>
            </form>
            {this.state.alert}
        </div>)
    }
});

var PCHSerialNumberCheckForPill = React.createClass({
    getInitialState: function () {
        return {alert: null};
    },
    componentDidMount: function() {
        var placeholder = 'SNs(new line separated), e.g:\nsn1\nsn2',
            psn = $("#psn");
        psn.val(placeholder);

        psn.focus(function(){
            if($(this).val() === placeholder){
                $(this).val('');
            }
        });

        psn.blur(function(){
            if($(this).val() === ''){
                $(this).val(placeholder);
            }
        });
    },
    handleSubmit: function () {
        var that = this;
        that.setState(that.getInitialState());
        $.ajax({
            url: '/api/pch_sn_check',
            dataType: 'json',
            type: 'POST',
            data: {
                sn: JSON.stringify(that.refs.sn.getDOMNode().value),
                device_type: "pill"
            },
            success: function (response) {
                console.log(response);
                that.setState({alert: response.error ?
                    <Alert bsStyle="danger">{response.error}</Alert> :
                    <Alert bsStyle="success">Missing pill serial numbers: <br/>{response.data}</Alert>
                });
            }
        });
        return false;
    },
    render: function() {
        return (<div>
            <form onSubmit={this.handleSubmit}>
                <div><textarea id="psn" className="form-control" ref="sn" type="text"/></div><br/>
                <div><Button className="submit" type="submit">Submit</Button></div><br/>
            </form>
            {this.state.alert}
        </div>)
    }
});

var PCHSerialNumberCheckMaster = React.createClass({
    render: function() {
        return (<div><br/><br/>
            <Row>
                <Col xs={6}><Tile title="Check Sense SN" content={<PCHSerialNumberCheckForSense parent={this} />} /></Col>
                <Col xs={6}><Tile title="Check Pill SN" content={<PCHSerialNumberCheckForPill parent={this} />} /></Col>
            </Row>
        </div>);
    }
});

React.render(<PCHSerialNumberCheckMaster />, document.getElementById('pch-serial-number-check'));


