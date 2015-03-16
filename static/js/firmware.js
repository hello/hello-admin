/** @jsx React.DOM */

var inputType = {
    'copy_to_serial_flash': 'checkbox',
    'reset_network_processor': 'checkbox',
    'reset_application_processor': 'checkbox',
    'serial_flash_filename': 'text',
    'serial_flash_path': 'text',
    'sd_card_filename': 'text',
    'sd_card_path': 'text'
};

var headerStyle = {
    'copy_to_serial_flash': 'alert-warning',
    'reset_network_processor': 'alert-warning',
    'reset_application_processor': 'alert-warning',
    'serial_flash_filename': 'alert-danger',
    'serial_flash_path': 'alert-danger',
    'sd_card_filename': 'alert-danger',
    'sd_card_path': 'alert-danger'
};

var LinkToFWSearch = React.createClass({
    populateFirmwareVersion: function(){
        $('#firmware_version').focus().val(this.props.firmware_version);
        $("#firmware_version_search").click();
    },
    render: function() {
        return <span className="cursor-custom" onClick={this.populateFirmwareVersion}>{this.props.firmware_version}</span>
    }
});

var LinkToFWHistorySearch = React.createClass({
    populateDeviceID: function(){
        $('#device_id').focus().val(this.props.device_id);
        $("#device_history_search").click();
    },
    render: function() {
        return <span className="cursor-custom" onClick={this.populateDeviceID}>{this.props.device_id}</span>
    }
});

var FirmwareMatrixHeaders = React.createClass({
    render: function() {
        var firmwareFields = [<th className="alert-success">s3_key</th>];
        this.props.headers.forEach(function(d){
            if (inputType[d] === 'checkbox' )
                firmwareFields.push(<th className={headerStyle[d]}>{d}</th>);
            else
                firmwareFields.push(<th className={headerStyle[d]}>{d}</th>);
        });
        return (<thead><tr>
            {firmwareFields}
        </tr></thead>)
    }
});

var FirmwareMatrixRows = React.createClass({
    render: function() {
        var firmwareTableRows = [];
        this.props.s3Keys.forEach(function(s3k){
            var inputFields = [];
            $.each(inputType, function(field, fieldType){
                var inputClass = s3k.split('/').reverse()[0].replace('.', 'DOT') + field;
                inputFields.push(<td><Input className={inputClass} type={fieldType}/></td>);
            });
            firmwareTableRows.push(
                <tr>
                    <td>{s3k}</td>
                    {inputFields}
                </tr>
            );
        });
        return (<tbody>
            {firmwareTableRows}
        </tbody>)
    }
});


var DeviceListHeaders = React.createClass({
    render: function() {
        return (<thead>
        <tr>
            <th className='alert-warning'>Firmware Version: {this.props.firmware_version}</th>
            <th className='alert-warning'></th>
        </tr>
        <tr>
            <th className='alert-warning'>Timestamp</th>
            <th className='alert-warning'>Device ID</th>
        </tr></thead>)
    }
});
var FirmwareListHeaders = React.createClass({
    render: function() {
        return (<thead><tr>
            <th className='alert-info'>FW Version</th>
            <th className='alert-info'># of Devices Seen</th>
        </tr></thead>)
    }
});
var HistoryListHeaders = React.createClass({
    render: function() {
        return (<thead>
        <tr>
            <th className='alert-success'>Device ID: {this.props.device_id}</th>
            <th className='alert-success'></th>
        </tr>
        <tr>
            <th className='alert-success'>Timestamp</th>
            <th className='alert-success'>FW Version</th>
        </tr></thead>)
    }
});

var FirmwareListRows = React.createClass({
    render: function() {
        var firmwareListRows = [];
        this.props.fwList.forEach(function(fw){
            firmwareListRows.push(
                            <tr>
                                <td>
                                <LinkToFWSearch firmware_version={fw.version} />
                                {" (" + parseInt(fw.version, 10).toString(16) + ")"}
                                </td>
                                <td>{fw.count}</td>
                            </tr>
                        );

        });
        return (<tbody>
            {firmwareListRows}
        </tbody>)
    }
});

var DeviceListRows = React.createClass({
    render: function() {
        var deviceListRows = [];
        this.props.fwDevices.forEach(function(device){
            var timestamp = new Date(Number(device.timestamp));
            deviceListRows.push(
                            <tr>
                                <td>{timestamp.toLocaleString()}</td>
                                <td>
                                <LinkToFWHistorySearch device_id={device.device_id} />
                                </td>
                            </tr>
                        );

        });
        return (<tbody>
            {deviceListRows}
        </tbody>)
    }
});

var HistoryListRows = React.createClass({
    render: function() {
        var historyListRows = [];
        Object.keys(this.props.firmwareHistory).sort().reverse().forEach(function(key){
            var timestamp = new Date(Number(key));
            historyListRows.push(
                <tr>
                    <td>{timestamp.toLocaleString()}</td>
                    <td>
                    <LinkToFWSearch firmware_version={this[key]} />
                    </td>
                </tr>
            );
        }, this.props.firmwareHistory);
        
        return (<tbody>
            {historyListRows}
        </tbody>)
    }
});

var FirmwareMatrix = React.createClass({
   render: function() {
        return (
            <Table responsive condensed bordered>
              <FirmwareMatrixHeaders headers={this.props.headers}/>
              <FirmwareMatrixRows s3Keys={this.props.s3Keys}/>
            </Table>
        )
   }
});

var FirmwareList = React.createClass({
   render: function() {
        return (
            <Table responsive condensed bordered>
              <FirmwareListHeaders/>
              <FirmwareListRows fwList={this.props.fwList}/>
            </Table>
        )
   }
});

var DeviceList = React.createClass({
   render: function() {
        return (
            <Table responsive condensed bordered>
              <DeviceListHeaders firmware_version={this.props.fwVersion}/>
              <DeviceListRows fwDevices={this.props.fwDevices}/>
            </Table>
        )
   }
});

var HistoryList = React.createClass({
   render: function() {
        return (
            <Table responsive condensed bordered>
              <HistoryListHeaders device_id={this.props.device_id}/>
              <HistoryListRows firmwareHistory={this.props.fwHistory}/>
            </Table>
        )
   }
});

var FirmwareMaestro = React.createClass({
    getInitialState: function() {
        return {
            getError: "",
            putError: "",
            s3Keys: [],
            fwDevices: [],
            fwList: [],
            headers: Object.keys(inputType),
            updateStatus: 0,
            removeStatus: 0,
            rangeStart: 0,
            rangeEnd: 14,
            files: [],
            viewDeviceError: ""
        }
    },
    componentDidMount: function(e) {
        var firmware_version = getParameterByName('firmware_version');
        if (firmware_version) {
          $('#firmware_version').val(firmware_version);
          this.deviceList(e);
        }
        var device_id = getParameterByName('device_id');
        if (device_id) {
          $('#device_id').val(device_id);
          this.fwHistoryList(e);
        }

    },
    retrieve: function() {
        console.log("retrieving");
        var sourceInput = $('#sourceInput').val();
        history.pushState({}, '', '/firmware/?source=' + sourceInput);
        $.ajax({ //nested ajax to avoid race condition
          url: '/api/firmware',
          dataType: 'json',
          data: {'source': sourceInput},
          type: 'GET',
          success: function(response) {
            if (response.error !== "") {
                this.setState({s3Keys: []});
                this.setState({getError: response.error});
            }
            else {
                this.setState({s3Keys: response.data});
                this.setState({getError: ""});
                // Type ahead some default values:
                $('.topDOTbincopy_to_serial_flash').prop('checked', true);
                $('.topDOTbinserial_flash_filename').val("update.bin");
                $('.topDOTbinserial_flash_path').val("/top/");
                $('.topDOTbinsd_card_filename').val("update.bin");
                $('.topDOTbinsd_card_path').val("top");
                $('.kitsuneDOTbincopy_to_serial_flash').prop('checked', true);
                $('.kitsuneDOTbinreset_application_processor').prop('checked', true);
                $('.kitsuneDOTbinserial_flash_filename').val("mcuimgx.bin");
                $('.kitsuneDOTbinserial_flash_path').val("/sys/");
                $('.kitsuneDOTbinsd_card_filename').val("mcuimgx.bin");
                $('.kitsuneDOTbinsd_card_path').val("/");
            }
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(status, err);
          }.bind(this)
        });
    },
    fwList: function() {
                console.log("listing firmwares");
                var sourceInput = $('#sourceInput').val();
                history.pushState({}, '', '/firmware/');

                $.ajax({ //nested ajax to avoid race condition
                  url: '/api/firmware/info',
                  dataType: 'json',
                  type: 'GET',
                  success: function(response) {
                    if (response.error !== "") {
                        this.setState({fwList: []});
                        this.setState({getError: response.error});
                    }
                    else {
                        this.setState({fwList: response.data});
                        this.setState({getError: ""});
                        // Type ahead some default values:
                    }
                  }.bind(this),
                  error: function(xhr, status, err) {
                    console.error(status, err);
                  }.bind(this)
                });
            },
    fwHistoryList: function() {
            console.log("fetching firmware history");
            var device_id = $('#device_id').val();
            history.pushState({}, '', '/firmware/?device_id=' + device_id);
            $.ajax({ //nested ajax to avoid race condition
              url: '/api/firmware/history',
              dataType: 'json',
              data: {'device_id': device_id},
              type: 'GET',
              success: function(response) {

                if (response.error !== "") {
                    this.setState({fwHistory: Object});
                    this.setState({getError: response.error});
                }
                else {
                    this.setState({fwHistory: response.data});
                    this.setState({device_id: device_id});
                    this.setState({getError: ""});
                }
              }.bind(this),
              error: function(xhr, status, err) {
                console.error(status, err);
              }.bind(this)
            });
        },
    deviceList: function() {
            console.log("listing");
            var firmware_version = $('#firmware_version').val();
            var range_end = $('#device-count').val();
            history.pushState({}, '', '/firmware/?firmware_version=' + firmware_version);
            $.ajax({ //nested ajax to avoid race condition
              url: '/api/firmware',
              dataType: 'json',
              data: {'firmware_version': firmware_version,
                    'range_start': this.state.rangeStart,
                    'range_end': range_end},
              type: 'GET',
              success: function(response) {
                if (response.error !== "") {
                    this.setState({fwDevices: []});
                    this.setState({getError: response.error});
                }
                else {
                    this.setState({fwDevices: response.data});
                    this.setState({fwVersion: firmware_version});
                    this.setState({rangeEnd: range_end});
                    this.setState({getError: ""});
                    // Type ahead some default values:
                }
              }.bind(this),
              error: function(xhr, status, err) {
                console.error(status, err);
              }.bind(this)
            });
        },
    changeRange: function() {
                console.log("listing");
                var firmware_version = $('#firmware_version').val();
                var range_end = $('#device-count').val();
                history.pushState({}, '', '/firmware/?firmware_version=' + firmware_version + '&range_end=' + range_end);
                this.deviceList();
            },
    update: function() {
        console.log("updating");
        var updateData = [];
        this.state.s3Keys.forEach(function(s3k){
          fileValues = {s3_key: s3k}
          $.each(inputType, function(field, fieldType) {
            thisInput = $('input.'+s3k.split('/').reverse()[0].replace('.', 'DOT')+field);
            if (thisInput.attr('type') === 'checkbox')
                fileValues[field] = thisInput.is(':checked');
            else
                fileValues[field] = thisInput.val();
          });
          updateData.push(fileValues);
        });

        var putData = {
          device_id: $('#targetDevice').val(),
          firmware_version: $('#firmwareVersion').val(),
          update_data: updateData
        };

        $.ajax({
          url: '/api/firmware',
          dataType: 'json',
          contentType: 'application/json',
          type: 'PUT',
          data: JSON.stringify(putData),
          success: function(response) {
            this.setState({updateStatus: response.status});
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(status, err);
            this.setState({updateStatus: status});
          }.bind(this)
        });
    },

    viewFiles: function () {
        var deviceInput = $('#deleteDevice').val();
        $.ajax({
          url: '/api/firmware',
          dataType: 'json',
          contentType: 'application/json',
          type: 'GET',
          data: {device_id: deviceInput},
          success: function(response) {
            if (response.data.length === 0) {
              this.setState({
                files: response.data,
                viewDeviceError: "This device either does not exist or has no files"
              });
            }
            else {
              this.setState({
                files: response.data,
                viewDeviceError: ""
              });
            }
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(status, err);
            this.setState({files: status});
          }.bind(this)
        });
    },

    remove: function() {
        var deleteData = {
          device_id: $('#deleteDevice').val()
        };
        console.log(deleteData);
        $.ajax({
          url: '/api/firmware',
          dataType: 'json',
          contentType: 'application/json',
          type: 'POST',
          data: JSON.stringify(deleteData),
          success: function(response) {
            console.log('successfully remove');
            console.log(response);
            this.setState({removeStatus: response.status});
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(status, err);
            this.setState({removeStatus: status});
          }.bind(this)
        });
    },

    render: function() {
        var inputStyle = React.addons.classSet({
            info: this.state.getError === "" && this.state.s3Keys.length === 0,
            success: this.state.getError === "" && this.state.s3Keys.length > 0,
            error: this.state.getError !== ""
        });
        var getResult = this.state.s3Keys.length === 0 ?
            <Alert bsStyle="default">{this.state.error}</Alert> :
            <FirmwareMatrix s3Keys={this.state.s3Keys} headers={this.state.headers}/>;
        var listResult = this.state.fwDevices.length === 0 ?
            <Alert bsStyle="default">{this.state.error}</Alert> :
            <DeviceList fwDevices={this.state.fwDevices} fwVersion={this.state.fwVersion}/>;
        var countResult = this.state.fwList.length === 0 ?
            <Alert bsStyle="default">{this.state.error}</Alert> :
            <FirmwareList fwList={this.state.fwList}/>;
        var historyResult = (typeof this.state.fwHistory == "undefined") ?
            <Alert bsStyle="default">{this.state.error}</Alert> :
            <HistoryList fwHistory={this.state.fwHistory} device_id={this.state.device_id}/>;
        var edit = this.state.s3Keys.length === 0 ?
            null:
            <div className="row">
              <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4">
                <Input id="targetDevice"type="text" placeholder='Target device ID, e.g: D05FB81BE1xx'/>
              </div>
              <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4">
                <Input id="firmwareVersion"type="text" placeholder="firmware version, e.g: 99"/>
              </div>
              <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1">
                <Button bsStyle="info" onClick={this.update}><Glyphicon glyph="pencil"/></Button>
              </div>
            </div>;
        var putResult = this.state.updateStatus === 0 ?
            null:
            <Alert bsStyle="success">{this.state.updateStatus}</Alert>;

        var remove = this.state.files.length === 0?
            null:
            <div className="col-xs-2 col-sm2 col-md-2 col-lg-2">
              <Button bsStyle="danger" onClick={this.remove}><Glyphicon glyph="remove"/></Button>
            </div>;

        var deviceFiles = this.state.viewDeviceError != ""?
            <Alert bsStyle="danger">{this.state.viewDeviceError}</Alert>:
            this.state.files.length === 0 ? null: prettify_json(this.state.files, 's3_key');

        var deleteResult = this.state.removeStatus === 0 ?
            null:
            <Alert bsStyle={this.state.removeStatus === 204 ? "success": "danger"}>
              {this.state.removeStatus === 204 ? "SUCCESS": "FAILURE"}
            </Alert>;

        return (<div>
            <TabbedArea defaultActiveKey={1}>
              <TabPane key={1} tab="Firmware History">
                <p/><p/>

                <div className="col">
                  <div className="col-xs-3 col-sm-3 col-md-3 col-lg-3">
                    <Button bsStyle="primary" onClick={this.fwList}><Glyphicon glyph="list"/> List All FW Seen</Button>
                  </div>
                </div>
                <div className="col">
                  <div className="col-xs-3 col-sm-3 col-md-3 col-lg-3">
                    <Input id="device_id" type="text" bsStyle={inputStyle} placeholder="<Enter Device ID>" hasFeedback />
                  </div>
                  <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1">
                    <Button id="device_history_search" bsStyle="success" onClick={this.fwHistoryList} type='submit'><Glyphicon glyph="search"/></Button>
                  </div>
                </div>
                <div className="col">
                  <div className="col-xs-3 col-sm-3 col-md-3 col-lg-3">
                    <Input id="firmware_version" type="text" bsStyle={inputStyle} placeholder="<Enter FW Version>" hasFeedback />
                  </div>
                  <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1">
                    <Button id="firmware_version_search" bsStyle="warning" onClick={this.deviceList} type='submit'><Glyphicon glyph="search"/></Button>
                  </div>
                  {remove}
                </div>

               <Col xs={5} md={5}>
                <Panel header="Firmware Seen">
                    <div id="fw_seen">
                    {countResult}
                    </div>
                </Panel>
                <Panel header="Device Firmware History">
                    {historyResult}
                </Panel>
                </Col>
                <Col xs={7} md={7}>
                    <Panel header="Device List">
                    <Input type="select" id="device-count" onChange={this.changeRange} addonBefore="Device Count:">
                      <option selected value="9">10</option>
                      <option value="19">20</option>
                      <option value="49">50</option>
                      <option value="99">100</option>
                      <option value="499">500</option>
                      <option value="999">1000</option>
                      <option value="-1">All Devices</option>
                    </Input>
                        <div id="device_list">
                        {listResult}
                        </div>
                    </Panel>
                </Col>
                {getResult}
                {edit}
                {putResult}
                {deviceFiles}
                {deleteResult}
              </TabPane>
            </TabbedArea>
        </div>);
    }
});

React.renderComponent(<FirmwareMaestro/>, document.getElementById('firmware-manager'));

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1]);
}

function prettify_json(json_obj, title_field) {
  var divs = [];
  $.each(json_obj, function(index, dict){
    divs.push(<div>
      <Label bsStyle="success">{dict[title_field]}</Label>
      <pre className="alert-default">{JSON.stringify(dict || 'Sorry, no match|', null, 3)}</pre>
    </div>);
  });
  return divs
}