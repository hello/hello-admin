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

var FirmwareMaestro = React.createClass({
    getInitialState: function() {
        return {
            getError: "",
            putError: "",
            s3Keys: [],
            headers: Object.keys(inputType),
            updateStatus: 0,
            removeStatus: 0,
            files: [],
            viewDeviceError: ""
        }
    },
    componentDidMount: function(e) {
        var sourceFromURL = getParameterByName('source');
        if (sourceFromURL) {
          $('#sourceInput').val(sourceFromURL);
          this.retrieve(e);
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
              <TabPane key={1} tab="Update firmware for a device">
                <p/><p/>
                <div className="row">
                  <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4">
                    <Input id="sourceInput"type="text" bsStyle={inputStyle} placeholder="Source (as s3 prefix), e.g.: chris-dev" hasFeedback />
                  </div>
                  <div className="col-xs-2 col-sm2 col-md-2 col-lg-2">
                    <Button bsStyle="primary" onClick={this.retrieve}><Glyphicon glyph="search"/></Button>
                  </div>
                </div>
                {getResult}
                {edit}
                {putResult}
              </TabPane>
              <TabPane key={2} tab="View/Remove all updates from a device">
                <p/><p/>
                <div className="row">
                  <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4">
                    <Input id="deleteDevice" type="text" bsStyle={inputStyle} placeholder="Device ID to view/remove firmware" />
                  </div>
                  <div className="col-xs-2 col-sm2 col-md-2 col-lg-2">
                    <Button bsStyle="warning" onClick={this.viewFiles}><Glyphicon glyph="search"/></Button>
                  </div>
                  {remove}
                </div>
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