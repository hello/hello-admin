/** @jsx React.DOM */

var OwnerEmail = React.createClass({
    populateUserSearchEmail: function(e) {
        $('#search-modes a[href="#by-email"]').tab('show');
        $('#omni-input').focus().val($(e.target).text());
        $("#omni-submit").click();
    },
    render: function() {
        var that = this;
        var emailsList = that.props.deviceEmailPair.emails.map(function(item){
             return <span className="cursor-custom" onClick={that.populateUserSearchEmail}>{item.email}&nbsp;</span>
        });
        return (<div><p>
            <span>{that.props.deviceEmailPair.deviceId}&nbsp;</span>{emailsList}
        </p><p/></div>)
    }
});

var DeviceOwnerSearch = React.createClass({
    getInitialState: function() {
      return {
        deviceEmailPairs: []
      }
    },

    handleSubmit: function(e) {
      $preloader.fadeIn('fast');
      if (e) {
        e.preventDefault();
      }
      var that = this;
      that.setState({deviceEmailPairs: []});
      var deviceIdsInput = $('#device-ids-input').val().trim();
      history.pushState({}, '', '/users/?device_id=' + deviceIdsInput);
      console.log("sending GET", deviceIdsInput.split(","));
      deviceIdsInput.split(",").forEach(function(deviceIdInput){
          $.ajax({
            url: '/api/devices/owners',
            dataType: 'json',
            contentType: 'application/json',
            type: 'GET',
            data: {device_id: deviceIdInput.trim()},
            success: function(response) {
              that.setState({deviceEmailPairs: that.state.deviceEmailPairs.concat([{
                  deviceId: deviceIdInput,
                  emails: response.data
              }])});
            }.bind(this),
            error: function(e) {
              console.error(e);
              this.setState({deviceEmailPairs: []});
            }.bind(this)
          });
      });
      $preloader.fadeOut('fast');
      return false;
    },

    componentDidMount: function(e) {
        var deviceIdFromURL = getParameterByName('device_id');
        if (deviceIdFromURL) {
          $("#device-ids-input").val(deviceIdFromURL);
          this.handleSubmit(e);
        }
    },

    render: function() {
        var results = this.state.deviceEmailPairs.map(function(deviceEmailPair){
                return <OwnerEmail deviceEmailPair={deviceEmailPair}/>;
            });
        return (<form className="fancy-box" onSubmit={this.handleSubmit}>
            <Row className="row-lefty">
                <Col className="col-paddingless" xs={10}>
                    <LongTagsInput id="device-ids-input" tagClass="label label-info" placeHolder="device ID" />
                </Col>
                <Col className="col-paddingless" xs={2}><Button id="device-id-submit" bsStyle="default" type="submit">
                  <Glyphicon glyph="search"/>
                </Button></Col>
            </Row>
            {results}
        </form>)
    }
});

React.renderComponent(<DeviceOwnerSearch/>, document.getElementById('by-devices'));