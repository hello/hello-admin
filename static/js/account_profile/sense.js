var BYPASS_OTA_CHECKS_FEATURE_NAME = "bypass_ota_checks";
var FirmwareModal = React.createClass({
    getInitialState: function() {
        return {fwHistory: []};
    },
    translateFirmwares: function(firmwareHexList) {
        var fwTranslation = {};
        $.ajax({
            url: '/api/firmware_unhash',
            dataType: 'json',
            data: firmwareHexList,
            type: "POST",
            async: false,
            success: function(response) {
                fwTranslation = response.data
            }.bind(this)
        });
        return fwTranslation;
    },
    getFirmwares: function() {
        $.ajax({
            url: '/api/firmware/history',
            dataType: 'json',
            data: {'device_id': this.props.senseId},
            type: 'GET',
            success: function(response) {
                if (response.error.isWhiteString()){
                    var fwTranslation = this.translateFirmwares(JSON.stringify(Object.keys(response.data).map(function(ts){return parseInt(response.data[ts], 10).toString(16);})));
                    this.setState({
                        fwHistory: Object.keys(response.data).sort().reverse().map(function(ts){
                            var firmwareInt = response.data[ts];
                            var firmwareHex = parseInt(response.data[ts], 10).toString(16);
                            return {
                                timestamp: d3.time.format("%d %b %Y %H:%M:%S")(new Date(Number(ts))),
                                firmwareInt: firmwareInt,
                                firmwareHex: firmwareHex,
                                firmwareMan: fwTranslation[firmwareHex] || <span className="not-ok">--</span>
                            }
                        }.bind(this))
                    })
                }
            }.bind(this)
        });
    },
    componentDidMount: function() {
        this.getFirmwares();
    },
    render: function() {
        return <Modal animation={true}>
            <div className='modal-body'>
                <div className="modal-title">Firmware History <Button className="btn-round btn-borderless btn-fade" onClick={this.props.onRequestHide}>X</Button></div>
                <div className="modal-subtitle">Order by upgrade timestamp, see full detail for sense {this.props.senseId} <a href={"/firmware/?device_id=" + this.props.senseId} target="_blank">here</a></div>
                <br/>
                <Table id="fw-history">
                    <tbody>
                        <tr className="modal-col-title">
                            <td>Last seen (Browser tz)</td>
                            <td>Version (Dec)</td>
                            <td>Version (Hex)</td>
                            <td>Version (Man)</td>
                        </tr>
                        {this.state.fwHistory.map(function(h){
                            return <tr>
                                <td>{h.timestamp}</td>
                                <td>{h.firmwareInt}</td>
                                <td>{h.firmwareHex}</td>
                                <td className="modal-fw-man">{h.firmwareMan}</td>
                            </tr>;
                        })}
                        <tr><td/><td/><td/><td/></tr>
                    </tbody>
                </Table>
            </div>
            <div className='modal-footer'>
                <Button className="btn-round btn-fade" onClick={this.props.onRequestHide}>X</Button>
            </div>
        </Modal>;
    }
});


var BypassOTAModal = React.createClass({
    putSenseIdToFeature: function(putData) {
        $.ajax({
            url: '/api/features',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(putData),
            type: 'PUT',
            success: function(response) {
                if (!(response.status === 204 && response.error === "")) {
                    alert("Failed to update feature");
                }
            }.bind(this)
        });
    },
    updateFeatureBypassOTA: function() {
        $.ajax({
            url: "/api/features",
            dataType: 'json',
            type: 'GET',
            data: {feature: BYPASS_OTA_CHECKS_FEATURE_NAME},
            success: function(response) {
                if (response.error.isWhiteString()) {
                    if (response.data.ids && response.data.ids.indexOf(this.props.senseId) === -1) {
                        var putData = response.data;
                        putData.ids.push(this.props.senseId);
                        putData.ids = putData.ids.join();
                        putData.feature = putData.name;
                        this.putSenseIdToFeature(putData);
                    }
                }
            }.bind(this)
        });
        this.props.onRequestHide();
    },
    render: function() {
        return <Modal animation={true}>
            <div className='modal-body'>
                <div className="modal-title">Bypass OTA Checks <Button className="btn-round btn-borderless btn-fade" onClick={this.props.onRequestHide}>X</Button></div>
                <div className="modal-subtitle">Once submitted, {this.props.senseId} will be added to feature "bypass_ota_checks", see more <a href="/features/" target="_blank">here</a></div>
                <br/>
                <Button onClick={this.updateFeatureBypassOTA}>Submit</Button>
            </div>
            <div className='modal-footer'>
                <Button className="btn-round btn-fade" onClick={this.props.onRequestHide}>X</Button>
            </div>
        </Modal>;
    }
});


var DustOffsetUpdateModal = React.createClass({
    computeAndUpsertDustCalibration: function() {
        $.ajax({
            url: "/api/dust_offset",
            dataType: 'json',
            type: 'GET',
            data: {sense_internal_id: this.props.senseInternalId, account_id: this.props.accountId},
            success: function(response) {
                if (!response.error.isWhiteString()){
                    alert(response.error);
                }
                else {
                    var averageDustOffset = response.data.adc_offset;
                    this.upsertDustCalibration(averageDustOffset);
                    this.props.parent.getDustCalibration(this.props.senseId, this.props.accountId, this.props.senseInternalId);
                }
                this.props.onRequestHide();
            }.bind(this)
        })
    },
    upsertDustCalibration: function(averageDustOffset) {
        if (averageDustOffset <= 0) {
            return false;
        }
        $.ajax({
            url: "/api/dust_calibration",
            dataType: 'json',
            contentType: 'application/json',
            type: 'PUT',
            data: JSON.stringify({
                    sense_id: this.props.senseId,
                    test_at: new Date().getTime(),
                    dust_offset: averageDustOffset
                }),
            success: function(response) {
                if (!response.error.isWhiteString()){
                    alert(response.error);
                }
            }.bind(this)
        });
    },
    render: function() {
        return <Modal animation={true}>
            <div className='modal-body'>
                <div className="modal-title">Dust Calibration Update<Button className="btn-round btn-borderless btn-fade" onClick={this.props.onRequestHide}>X</Button></div>
                <div className="modal-subtitle">Once submitted, average dust concentration will be calculated for {this.props.senseId} over the last 10 days or less. If that calculation yields positive value, we will use it to compute calibration delta which trigger AQ rendering server-side.
                </div>
                <br/>
                <div className="modal-subtitle">Try NOT to do it twice within a short time.</div>
                <br/>
                <Button onClick={this.computeAndUpsertDustCalibration}>Submit</Button>
            </div>
            <div className='modal-footer'>
                <Button className="btn-round btn-fade" onClick={this.props.onRequestHide}>X</Button>
            </div>
        </Modal>;
    }
});

var SenseSummary = React.createClass({
    getInitialState: function() {
        return {dustOffset: null, unhashedFirmware: null, dustCalibration: null};
    },
    componentDidUpdate: function(nextProps, nextState) {
        var currentSenseId = this.props.senseResponse.data && this.props.senseResponse.data.length > 0  ? this.props.senseResponse.data[0].device_account_pair.external_device_id : null;
        var nextSenseId = nextProps.senseResponse.data && nextProps.senseResponse.data.length > 0  ? nextProps.senseResponse.data[0].device_account_pair.external_device_id : null;
        if (currentSenseId === nextSenseId) {
           return false;
        }

        var senseResponse = this.props.senseResponse;
        var firmwareVersion = senseResponse.data[0].device_status ? senseResponse.data[0].device_status.firmware_version : undefined;
        this.getUnhashedFirmware(firmwareVersion);

        var accountId = senseResponse.data[0].device_account_pair ? senseResponse.data[0].device_account_pair.account_id : undefined;
        var senseId = senseResponse.data[0].device_account_pair ? senseResponse.data[0].device_account_pair.external_device_id : undefined;
        var senseInternalId = senseResponse.data[0].device_account_pair ? senseResponse.data[0].device_account_pair.internal_device_id : undefined;
        this.getDustCalibration(senseId, accountId, senseInternalId);
    },

    getUnhashedFirmware: function(firmwareVersion) {
        $.ajax({
            url: "/api/firmware_unhash",
            dataType: 'json',
            type: 'GET',
            data: {version: firmwareVersion},
            success: function(response) {
                if (response.error.isWhiteString()) {
                    this.setState({unhashedFirmware: <div>
                        {firmwareVersion || <span className="not-ok">unknown</span>}
                        <span> {response.data.join(", ") ? "(" + response.data.join(", ") + ")" : null}</span>
                    </div>});
                }
                else {
                    this.setState({unhashedFirmware: <span className="not-ok">--</span>});
                }
            }.bind(this)
        });
    },

    getDustCalibration: function(senseId, accountId, senseInternalId) {
        $.ajax({
            url: "/api/dust_calibration",
            dataType: 'json',
            type: 'GET',
            data: {sense_id: senseId},
            success: function(response) {
                if (response.error.isWhiteString()){
                    this.setState({dustCalibration: <div>
                        <span>{response.data.dust_calibration_delta} </span>
                        <ModalTrigger modal={<DustOffsetUpdateModal parent={this} senseId={senseId} accountId={accountId} senseInternalId={senseInternalId} />}>
                            <Button bsSize="xsmall">Re-compute</Button>
                        </ModalTrigger>
                    </div>});
                }
                else {
                    this.setState({dustCalibration: <ModalTrigger modal={<DustOffsetUpdateModal senseId={senseId} accountId={accountId} senseInternalId={senseInternalId} />}>
                <Button bsSize="xsmall">Compute</Button>
            </ModalTrigger>});
                }
            }.bind(this)
        });
    },

    closePopoverManually: function() {
        $("#popover-trigger").trigger("click");
    },

    updateSenseColor: function(senseId, color) {
        this.closePopoverManually();
        $.ajax({
            url: "/api/sense_color",
            dataType: 'json',
            type: 'PUT',
            data: {sense_id: senseId, color: color},
            success: function(response) {
                if (response.error.isWhiteString()){
                    $("#popover-trigger").text(color);
                }
            }
        });
        return false;
    },

    render: function() {
        var senseResponse = this.props.senseResponse,
            senseKeyStoreResponse = this.props.senseKeyStoreResponse,
            timezoneResponse = this.props.timezoneResponse,
            senseColorResponse = this.props.senseColorResponse,
            result = null, lastSeen = null, keyStore = null;

        var timezone = <span>{timezoneResponse.error.isWhiteString() && !$.isEmptyObject(timezoneResponse) ?
            timezoneResponse.data.timezone_id : "-" }</span>;

        if (senseKeyStoreResponse.error.isWhiteString()) {
            if(!$.isEmptyObject(senseKeyStoreResponse) && senseKeyStoreResponse.data.key) {
                keyStore = senseKeyStoreResponse.data.key.slice(senseKeyStoreResponse.data.key.length-5, senseKeyStoreResponse.data.key.length) + " " + (senseKeyStoreResponse.data.created_at || "");
            }
        }
        else {
            keyStore = <span className="not-ok">unprovisioned</span>;
        }

        if (senseResponse.data.length > 0) {
            var accountId = senseResponse.data[0].device_account_pair ? senseResponse.data[0].device_account_pair.account_id : undefined;
            var senseId = senseResponse.data[0].device_account_pair ? senseResponse.data[0].device_account_pair.external_device_id : undefined;
            var senseIdSpan = senseId;
            if (flaggedSenses.indexOf(senseId) > -1) {
                senseIdSpan = <OverlayTrigger trigger="hover" placement="right" overlay={
                    <Popover title={<span>Flagged Sense</span>}>
                        belongs to 1.3K senses that were accidentally reset (wifi cred wiped out)
                    </Popover>}>
                    <span className="not-ok">{senseId}</span>
                </OverlayTrigger>
            }

            var senseInternalId = senseResponse.data[0].device_account_pair ? senseResponse.data[0].device_account_pair.internal_device_id : undefined;

            if (senseResponse.data[0].device_status){
                var lastSeenEpoch = senseResponse.data[0].device_status.last_seen;
                lastSeen = <span className={lastSeenEpoch < new Date().getTime() - 3600*1000 ? "not-ok" : "ok"}  dangerouslySetInnerHTML={{__html:utcFormatter(new Date(lastSeenEpoch))}}/>;
                var pairedByAdmin = senseResponse.data[0].paired_by_admin === true ? "&nbsp;&nbsp;by admin": "";
            }
            var lastPairing = <span dangerouslySetInnerHTML={{__html: senseResponse.data[0].pairing_ts ? utcFormatter(new Date(senseResponse.data[0].pairing_ts)) + pairedByAdmin : null}}/>;

            var senseColor = senseColorResponse.error.isWhiteString() && senseColorResponse.data ?
                <OverlayTrigger trigger="click" placement="right" overlay={
                    <Popover title={<span>Update Color &nbsp;<Button id="popover-close" onClick={this.closePopoverManually} bsSize="xsmall">x</Button></span>}>
                        <Button onClick={this.updateSenseColor.bind(this, senseId, "BLACK")} className="device-color" bsSize="xsmall">BLACK</Button>&nbsp;
                        <Button onClick={this.updateSenseColor.bind(this, senseId, "WHITE")} className="device-color" bsSize="xsmall">WHITE</Button>
                    </Popover>}>
                    <Button id="popover-trigger" className="device-color" bsSize="xsmall">{senseColorResponse.data}</Button>
                </OverlayTrigger> : null;

            result = <div>
                <Table>
                    <tbody>
                        <tr><td>ID</td><td><span>{senseIdSpan}</span><span>{" (" + senseInternalId + ")"}</span></td></tr>
                        <tr><td>Keystore</td><td>{keyStore}</td></tr>
                        <tr><td>Firmware</td><td>{this.state.unhashedFirmware}</td></tr>
                        <tr><td>Dust Calib.</td><td>{this.state.dustCalibration}</td></tr>
                        <tr><td>Timezone</td><td>{timezone}</td></tr>
                        <tr><td>Color</td><td>{senseColor}</td></tr>
                        <tr><td>Last Seen</td><td>{lastSeen}</td></tr>
                        <tr><td>Last Pairing</td><td>{lastPairing}</td></tr>
                        <tr><td/><td/></tr>
                    </tbody>
                </Table>
                <ul className="extra">
                    <li><a target="_blank" href={"/sense_logs_es/?text=&sense_id=" + senseId + "&top_fw=&middle_fw=&start=&end=&limit=&asc=false&crash_only=false"}>Logs</a></li>
                    <li><a target="_blank" href={"/sense_events/?account_input=" + senseId + "&start_ts=" + new Date().getTime()}>Events</a></li>
                    <li><ModalTrigger modal={<FirmwareModal senseId={senseId} />}>
                        <a className="cursor-hand">Firmware-History</a>
                    </ModalTrigger></li>
                    <li><ModalTrigger modal={<BypassOTAModal senseId={senseId} />}>
                        <a className="cursor-hand">Bypass-OTA</a>
                    </ModalTrigger></li>
                </ul>
            </div>;
        }

        return !senseResponse.error.isWhiteString ?
            <Well>{senseResponse.error}</Well>: result;
    }
});


var SenseLimitedSummary = React.createClass({
    updateSenseColor: function(senseId, color) {
        this.closePopoverManually();
        $.ajax({
            url: "/api/sense_color",
            dataType: 'json',
            type: 'PUT',
            data: {sense_id: senseId, color: color},
            success: function(response) {
                if (response.error.isWhiteString()){
                    $("#popover-trigger").text(color);
                }
            }
        });
        return false;
    },
    closePopoverManually: function() {
        $("#popover-trigger").trigger("click");
    },
    render: function() {
        var keyStore = null;
        var senseKeyStoreResponse = this.props.senseKeyStoreResponse;
        var senseColorResponse = this.props.senseColorResponse;

        if (senseKeyStoreResponse.error.isWhiteString()) {
            if(!$.isEmptyObject(senseKeyStoreResponse) && senseKeyStoreResponse.data.key) {
                keyStore = senseKeyStoreResponse.data.key.slice(senseKeyStoreResponse.data.key.length-5, senseKeyStoreResponse.data.key.length) + " " + (senseKeyStoreResponse.data.created_at || "");
            }
        }
        else {
            keyStore = <span className="not-ok">unprovisioned</span>;
        }

        var senseColor = senseColorResponse.error.isWhiteString() && senseColorResponse.data ?
                <OverlayTrigger trigger="click" placement="right" overlay={
                    <Popover title={<span>Update Color &nbsp;<Button id="popover-close" onClick={this.closePopoverManually} bsSize="xsmall">x</Button></span>}>
                        <Button onClick={this.updateSenseColor.bind(this, this.props.senseId, "BLACK")} className="device-color" bsSize="xsmall">BLACK</Button>&nbsp;
                        <Button onClick={this.updateSenseColor.bind(this, this.props.senseId, "WHITE")} className="device-color" bsSize="xsmall">WHITE</Button>
                    </Popover>}>
                    <Button id="popover-trigger" className="device-color" bsSize="xsmall">{senseColorResponse.data}</Button>
                </OverlayTrigger> : null;


        return <div>
            <Table>
                <tbody>
                    <tr><td>ID</td><td>{this.props.senseId}</td></tr>
                    <tr><td>Keystore</td><td>{keyStore}</td></tr>
                    <tr><td>Color</td><td>{senseColor}</td></tr>
                    <tr><td/><td/></tr>
                </tbody>
            </Table>
            <ul className="extra">
                <li><a target="_blank" href={"/sense_logs_es/?text=&sense_id=" + this.props.senseId + "&top_fw=&middle_fw=&start=&end=&limit=&asc=false&crash_only=false"}>Logs</a></li>
                <li><a target="_blank" href={"/sense_events/?account_input=" + this.props.senseId + "&start_ts=" + new Date().getTime()}>Events</a></li>
                <li><ModalTrigger modal={<FirmwareModal senseId={this.props.senseId} />}>
                    <a className="cursor-hand">Firmware-History</a>
                </ModalTrigger></li>
                <li><ModalTrigger modal={<BypassOTAModal senseId={this.props.senseId} />}>
                    <a className="cursor-hand">Bypass-OTA</a>
                </ModalTrigger></li>
            </ul>
        </div>;
    }
});
