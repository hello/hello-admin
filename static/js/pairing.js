/** @jsx React.DOM */

var PairingMaestro = React.createClass({
    getInitialState: function () {
        return {token: "", devices: [], linkAlert: "", unlinkAlert: ""}
    },

    listDevices: function() {
        var that = this;
        $.ajax({
            url: '/api/devices',
            dataType: 'json',
            type: 'GET',
            data: {email: $('#username-input-unlink').val()},
            success: function(response) {
                console.log(response);
                that.setState({devices: response.data});
            }.bind(that),
            error: function(e) {
                that.setState({devices: []});
            }.bind(that)
        })
    },

    handleUnlink: function() {
        var that = this;
        var requestData = {
            username: $('#username-input-unlink').val(),
            password: $('#password-input-unlink').val(),
            app: "admin-register-devices"
        };
        $.ajax({
            url: '/api/tokens',
            dataType: 'json',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify(requestData),
            success: function(response) {
                console.log(response);
                that.setState({token: response.data.token, error: ""});
                that.unregisterDevice();
            }.bind(that),
            error: function(e) {
                that.setState({token: ""});
            }.bind(that)
        });
        return false;
    },

    handleLink: function() {
        this.registerDevice();
        return false;
    },

    registerDevice: function() {
        var that = this, deviceInput = $('#device-input-link').val();
        var requestData = {
            device_type: 'pill',
            device_id: deviceInput,
            impersonatee_token: that.state.token
        };
        console.log('registering', JSON.stringify(requestData));
        $.ajax({
            url: '/api/devices',
            dataType: 'json',
            type: 'POST',
            data: requestData,
            success: function(response) {
                console.log(response);
                if (response.status === 204) {
                    this.setState({linkAlert: "Successfully registered pill ".concat(deviceInput)});
                }
                else {
                    this.setState({linkAlert: response.error});
                }
            }.bind(that),
            error: function(e) {
                console.log('js error!!');
            }.bind(that)
        });
    },

    unregisterDevice: function() {
        var that = this, deviceInput = $('#device-input-unlink').val();
        var requestData = {
            device_type: deviceInput.split(' - ')[0].toLocaleLowerCase(),
            device_id: deviceInput.split(' - ')[1],
            impersonatee_token: that.state.token
        };
        console.log('unregistering', JSON.stringify(requestData));
        $.ajax({
            url: '/api/devices',
            dataType: 'json',
            type: 'PUT',
            data: requestData,
            success: function(response) {
                console.log(response);
                if (response.status === 204) {
                    this.setState({unlinkAlert: "Successfully unregistered device ".concat(deviceInput)});
                }
                else if (response.status === 500) {
                    this.setState({unlinkAlert: "Failed to unlink device, very likely that device has been unlinked by this user or other users who share it."});
                }
                else {
                    this.setState({unlinkAlert: response.error});
                }
            }.bind(that),
            error: function(e) {
                console.log('js error!!');
            }.bind(that)
        });
    },


    render: function() {
        var currentUserInput = $('#username-input-unlink').val();
        var selectNarration = (!currentUserInput || currentUserInput.isWhiteString()) ?
            "Loading devices list ...": "Select a device of ".concat(currentUserInput);
        var options = [<option value="">{selectNarration}</option>];
        this.state.devices.forEach(function(device){
            var deviceInfo = [device.type, device.device_id].join(' - ');
            options.push(<option value={deviceInfo}>{deviceInfo}</option>)
        });
        var linkAlert = (this.state.linkAlert.isWhiteString()) ? null:
            <Row>
                <Alert>{this.state.linkAlert}</Alert>
            </Row>;
        var unlinkAlert = (this.state.unlinkAlert.isWhiteString()) ? null:
             <Row>
                <Alert>{this.state.unlinkAlert}</Alert>
             </Row>;

        return (<Row>
            <Col xs={5} sm={5} md={5} lg={4} xl={3} xsOffset={1} smOffset={1} mdOffset={1} lgOffset={2} xlOffset={2}>
                <form onSubmit={this.handleUnlink}>
                    <h3>Unlink a device</h3><hr className="fancy-line"/>
                    <Row onMouseLeave={this.listDevices}>
                        <Input id="username-input-unlink" type="text" addonBefore={<Glyphicon glyph="user"/>} placeholder="email" />
                    </Row>
                    <Row>
                        <Input id="password-input-unlink" type="password" addonBefore={<Glyphicon glyph="qrcode"/>} placeholder="password" />
                    </Row>
                    <Row xs={4} md={4}>
                        <Input id="device-input-unlink" type="select" addonBefore={<Glyphicon glyph="star-empty"/>}>
                        {options}
                        </Input>
                    </Row>
                    <Row xs={2} md={2}>
                        <Button bsStyle="info" type="submit">{<Glyphicon glyph="send"/>}</Button>
                    </Row>
                </form>
                <br/>
                {unlinkAlert}
            </Col>
            <Col xs={1} sm={1} md={1} lg={1} xl={1}/>
            <Col xs={5} sm={5} md={5} lg={4} xl={3}>
                <form onSubmit={this.handleLink}>
                    <h3>Link a pill</h3><hr className="fancy-line"/>
                    <Row onMouseLeave={this.listDevices}>
                        <Input id="username-input-link" type="text" addonBefore={<Glyphicon glyph="user"/>} placeholder="email" />
                    </Row>
                    <Row>
                        <Input id="password-input-link" type="password" addonBefore={<Glyphicon glyph="qrcode"/>} placeholder="password" />
                    </Row>
                    <Row xs={4} md={4}>
                        <Input id="device-input-link" type="text" addonBefore={<Glyphicon glyph="star-empty"/>} placeholder="Input a pill ID" />
                    </Row>
                    <Row xs={2} md={2}>
                        <Button bsStyle="info" type="submit">{<Glyphicon glyph="send"/>}</Button>
                    </Row>
                </form>
                <br/>
                {linkAlert}
            </Col>

        </Row>)
    }
});



React.renderComponent(<PairingMaestro />, document.getElementById('pairing'));