/** @jsx React.DOM */

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

var PairSenseTile = React.createClass({
    getInitialState: function() {
        return {alert: null};
    },
    handleSubmit: function() {
        var that = this;
        that.setState(that.getInitialState());
        if (that.refs.emailInput.getDOMNode().value.isWhiteString() || that.refs.deviceIdInput.getDOMNode().value.isWhiteString()) {
            that.setState({alert: <Alert bsStyle="warning">Invalid Input</Alert>});
            return false;
        }
        $.ajax({
            url: '/api/devices',
            dataType: 'json',
            type: 'POST',
            data: {
                email: that.refs.emailInput.getDOMNode().value.trim(),
                device_id: that.refs.deviceIdInput.getDOMNode().value.trim(),
                timezone: that.refs.timezoneInput.getDOMNode().value,
                device_type: "sense"
            },
            success: function (response) {
                console.log(response);
                that.setState({alert: response.error ?
                    <Alert bsStyle="danger">{response.error}</Alert> : <Alert bsStyle="success">Success</Alert>});
            }
        });
        return false;
    },
    render: function() {
        return (<div>
                <form onSubmit={this.handleSubmit}>
                <div><input className="form-control" ref="emailInput" type="text" placeholder="Email" /></div><br/>
                <div><input className="form-control" ref="deviceIdInput" type="text" placeholder="Sense ID" /></div><br/>
                <div><select className="form-control" ref="timezoneInput" type="text" placeholder="Timezone">
                    <option value="America/Los_Angeles">America/Los Angeles</option>
                    <option value="UTC">UTC</option>
                    <option value="Asia/Shanghai">Asia/Shanghai</option>
                </select></div><br/>
                <div><Button className="submit" type="submit">Submit</Button></div><br/>
            </form>
            {this.state.alert}
        </div>)
    }
});

var PairPillTile = React.createClass({
    getInitialState: function() {
        return {alert: null};
    },
    handleSubmit: function() {
        var that = this;
        that.setState(that.getInitialState());
        if (that.refs.emailInput.getDOMNode().value.isWhiteString() || that.refs.deviceIdInput.getDOMNode().value.isWhiteString()) {
            that.setState({alert: <Alert bsStyle="warning">Invalid Input</Alert>});
            return false;
        }
        $.ajax({
            url: '/api/devices',
            dataType: 'json',
            type: 'POST',
            data: {
                email: that.refs.emailInput.getDOMNode().value.trim(),
                device_id: that.refs.deviceIdInput.getDOMNode().value.trim(),
                device_type: "pill"
            },
            success: function (response) {
                console.log(response);
                that.setState({alert: response.error ?
                    <Alert bsStyle="danger">{response.error}</Alert> : <Alert bsStyle="success">Success</Alert>});
            }
        });
        return false;
    },
    render: function() {
        return (<div>
            <form onSubmit={this.handleSubmit}>
                <div><input className="form-control" ref="emailInput" type="text" placeholder="Email" /></div><br/>
                <div><input className="form-control" ref="deviceIdInput" type="text" placeholder="Pill ID" /></div><br/>
                <div><input className="form-control input-hidden"/></div><br/>
                <div><Button className="submit" type="submit">Submit</Button></div><br/>
            </form>
            {this.state.alert}
        </div>)
    }
});

var UnpairSenseTile = React.createClass({
    getInitialState: function() {
        return {alert: null};
    },
    handleSubmit: function() {
        var that = this;
        that.setState(that.getInitialState());
        if (that.refs.emailInput.getDOMNode().value.isWhiteString() || that.refs.deviceIdInput.getDOMNode().value.isWhiteString()) {
            that.setState({alert: <Alert bsStyle="warning">Invalid Input</Alert>});
            return false;
        }
        $.ajax({
            url: '/api/devices',
            dataType: 'json',
            type: 'PUT',
            data: {
                email: that.refs.emailInput.getDOMNode().value.trim(),
                device_id: that.refs.deviceIdInput.getDOMNode().value.trim(),
                device_type: "sense",
                unlink_all: $("#unlink-all").is(":checked")
            },
            success: function (response) {
                console.log(response);
                that.setState({alert: response.error ?
                    <Alert bsStyle="danger">{response.error}</Alert> : <Alert bsStyle="success">Success</Alert>});
            }
        });
        return false;
    },
    render: function() {
        return (<div>
            <form onSubmit={this.handleSubmit}>
                <div><input className="form-control" ref="emailInput" type="text" placeholder="Email" /></div><br/>
                <div><input className="form-control" ref="deviceIdInput" type="text" placeholder="Sense ID" /></div><br/>
                <div>Unlink All Accounts <input id='unlink-all' type="checkbox" checked/></div><br/><br/>
                <div><Button className="submit" type="submit">Submit</Button></div><br/>
            </form>
        {this.state.alert}
        </div>)
    }
});

var UnpairPillTile = React.createClass({
    getInitialState: function() {
        return {alert: null};
    },
    handleSubmit: function() {
        var that = this;
        that.setState(that.getInitialState());
        if (that.refs.emailInput.getDOMNode().value.isWhiteString() || that.refs.deviceIdInput.getDOMNode().value.isWhiteString()) {
            that.setState({alert: <Alert bsStyle="warning">Invalid Input</Alert>});
            return false;
        }
        $.ajax({
            url: '/api/devices',
            dataType: 'json',
            type: 'PUT',
            data: {
                email: that.refs.emailInput.getDOMNode().value.trim(),
                device_id: that.refs.deviceIdInput.getDOMNode().value.trim(),
                device_type: "pill"
            },
            success: function (response) {
                console.log(response);
                that.setState({alert: response.error ?
                    <Alert bsStyle="danger">{response.error}</Alert> : <Alert bsStyle="success">Success</Alert>});
            }
        });
        return false;
    },
    render: function() {
        return (<div>
            <form onSubmit={this.handleSubmit}>
                <div><input className="form-control" ref="emailInput" type="text" placeholder="Email" /></div><br/>
                <div><input className="form-control" ref="deviceIdInput" type="text" placeholder="Pill ID" /></div><br/>
                <div><input className="form-control input-hidden"/></div><br/>
                <div><Button className="submit" type="submit">Submit</Button></div><br/>
            </form>
            {this.state.alert}
        </div>)
    }
});

var PairingMaster = React.createClass({
    render: function() {
        return (<div><br/><br/>
            <Row>
                <Col xs={3}><Tile title="Pair Sense" content={<PairSenseTile parent={this} />} /></Col>
                <Col xs={3}><Tile title="Pair Pill" content={<PairPillTile parent={this} />} /></Col>
                <Col xs={3}><Tile title="Unpair Sense" content={<UnpairSenseTile parent={this} />} /></Col>
                <Col xs={3}><Tile title="Unpair PIll" content={<UnpairPillTile parent={this} />} /></Col>
            </Row>
        </div>);
    }
});

React.renderComponent(<PairingMaster />, document.getElementById('pairing'));
