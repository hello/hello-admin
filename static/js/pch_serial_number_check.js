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
        return {alert: null, placeholder: "SNs(new line separated), e.g:\nsense_sn1\nsense_sn2\nsense_sn3"};
    },
    componentDidMount: function() {
        var ssn = $("#ssn"), that = this;
        ssn.val(that.state.placeholder);

        ssn.focus(function(){
            if($(this).val() === that.state.placeholder){
                $(this).val('');
            }
        });

        ssn.blur(function(){
            if($(this).val() === ''){
                $(this).val(that.state.placeholder);
            }
        });
    },
    handleSubmit: function () {
        var that = this;
        if (that.refs.sn.getDOMNode().value === that.state.placeholder || that.refs.sn.getDOMNode().value.isWhiteString()) {
            that.setState({alert: <Alert bsStyle="info">Invalid input !</Alert>});
            return false;
        }
        that.setState({alert: <Alert bsStyle="warning">Checking...</Alert>});
        var senseSNs = that.refs.sn.getDOMNode().value.split("\n");
        $.ajax({
            url: '/api/pch_sn_check',
            dataType: 'json',
            type: 'POST',
            data: {
                sn: JSON.stringify(senseSNs.map(function(ssn){return ssn.trim().toUpperCase()})),
                device_type: "sense"
            },
            success: function (response) {
                console.log(response, response.data.length);
                that.setState({alert: response.error ?
                    <Alert bsStyle="danger">{response.error}</Alert> :
                    <Alert bsStyle="success">
                        Summary:
                        <p>{response.data.length} not found / {senseSNs.length} submitted</p>
                        Missing sense serial numbers: <br/>
                        {!(response.data && response.data.length) > 0 ? "[]" : response.data.map(function(ssn){
                            return <p>{ssn}</p>
                        })}
                    </Alert>
                });
            }
        });
        return false;
    },
    render: function() {
        return (<div>
            <form onSubmit={this.handleSubmit}>
                <div><textarea id="ssn" className="form-control" ref="sn" type="text"/></div><br/>
                <div><Button className="submit" type="submit">Submit</Button></div><br/>
            </form>
            {this.state.alert}
        </div>)
    }
});

var PCHSerialNumberCheckForPill = React.createClass({
    getInitialState: function () {
        return {alert: null, placeholder: "SNs(new line separated), e.g:\npill_sn1\npill_sn2\npill_sn3"};
    },
    componentDidMount: function() {
        var psn = $("#psn"), that = this;
        psn.val(that.state.placeholder);

        psn.focus(function(){
            if($(this).val() === that.state.placeholder){
                $(this).val('');
            }
        });

        psn.blur(function(){
            if($(this).val() === ''){
                $(this).val(that.state.placeholder);
            }
        });
    },
    handleSubmit: function () {
        var that = this;
        if (that.refs.sn.getDOMNode().value === that.state.placeholder || that.refs.sn.getDOMNode().value.isWhiteString()) {
            that.setState({alert: <Alert bsStyle="info">Invalid input !</Alert>});
            return false;
        }
        that.setState({alert: <Alert bsStyle="warning">Checking...</Alert>});
        $.ajax({
            url: '/api/pch_sn_check',
            dataType: 'json',
            type: 'POST',
            data: {
                sn: that.refs.sn.getDOMNode().value.trim().toUpperCase(),
                device_type: "pill"
            },
            success: function (response) {
                console.log(response);
                that.setState({alert: response.error ?
                    <Alert bsStyle="danger">{response.error}</Alert> :
                    <Alert bsStyle="success">
                        Summary:
                        <p>{response.data.trim().split("\n").length} not found / {that.refs.sn.getDOMNode().value.trim().split("\n").length} submitted</p>
                        <br/> Missing pill serial numbers: <br/>
                        {response.data.trim().split("\n").map(function(psn){
                            return <p>{psn}</p>
                        })}
                    </Alert>
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


