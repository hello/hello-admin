var SenseSummary = React.createClass({
    loadUnhashedFirmware: function(version, senseId) {
        $.ajax({
            url: "/api/firmware_unhash",
            dataType: 'json',
            type: 'GET',
            async: false,
            data: {version: version},
            success: function(response) {
                if (response.error.isWhiteString()) {
                    version = <div>
                        <a href={"/firmware/?device_id=" + senseId} target="_blank">
                        {version || <span className="not-ok">unknown</span>}</a>
                        <span>{response.data.join(", ") ? "(" + response.data.join(", ") + ")" : null}</span>
                    </div>;
                }
            }
        });
        return version;
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
            var senseId = senseResponse.data[0].device_account_pair ? senseResponse.data[0].device_account_pair.externalDeviceId : undefined;
            var senseInternalId = senseResponse.data[0].device_account_pair ? " (" + senseResponse.data[0].device_account_pair.internalDeviceId + ")" : undefined;
            var firmwareVersion = senseResponse.data[0].device_status ? senseResponse.data[0].device_status.firmwareVersion : undefined;

            if (senseResponse.data[0].device_status){
                var lastSeenEpoch = senseResponse.data[0].device_status.lastSeen;
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
                        <tr><td>ID</td><td>{senseId + senseInternalId}</td></tr>
                        <tr><td>Keystore</td><td>{keyStore}</td></tr>
                        <tr><td>Firmware</td><td>{this.loadUnhashedFirmware(firmwareVersion, senseId)}</td></tr>
                        <tr><td>Timezone</td><td>{timezone}</td></tr>
                        <tr><td>Color</td><td>{senseColor}</td></tr>
                        <tr><td>Last Seen</td><td>{lastSeen}</td></tr>
                        <tr><td>Last Pairing</td><td>{lastPairing}</td></tr>
                        <tr><td/><td/></tr>
                    </tbody>
                </Table>
                <ul className="extra">
                    <li><a target="_blank" href={"/sense_logs/?field=device_id&keyword=" + senseId + "&sense_id=&limit=&start=&end="}>Logs</a></li>
                    <li><a target="_blank" href={"/sense_events/?account_input=" + senseId + "&start_ts=" + new Date().getTime()}>Events</a></li>
                </ul>
            </div>;
        }

        return !senseResponse.error.isWhiteString ?
            <Well>{senseResponse.error}</Well>: result;
    }
});