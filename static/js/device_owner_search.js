/** @jsx React.DOM */

var OwnerEmail = React.createClass({
    populateUserSearchEmail: function(e) {
        $('#email-search').focus().val($(e.target).text());
        $("#email-search-submit").click();
    },
    render: function() {
        return (<p>
            <span className="cursor-custom" onClick={this.populateUserSearchEmail}>{this.props.email}</span>
        </p>)
    }
});

var DeviceOwnerSearch = React.createClass({
    getInitialState: function() {
      return {
        emails: []
      }
    },

    handleSubmit: function(e) {
      if (e) {
        e.preventDefault();
      }
      var that = this;
      that.setState({emails: []});
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
              console.log(response.data);
              that.setState({emails: that.state.emails.concat(response.data)});
            }.bind(this),
            error: function(e) {
              console.error(e);
              this.setState({emails: []});
            }.bind(this)
          });
      });
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
        console.log(this.state.emails);
        var results = this.state.emails.map(function(email){
                return <OwnerEmail email = {email}/>;
            });
        return (<form className="fancy-box" onSubmit={this.handleSubmit}>
            <Row className="row-lefty">
                <Col className="col-paddingless" xs={10}>
                    <LongTagsInput id="device-ids-input" tagClass="label label-info" placeHolder="Levels e.g: INFO, DEBUG" />
                </Col>
                <Col className="col-paddingless" xs={2}><Button id="device-id-submit" bsStyle="default" type="submit">
                  <Glyphicon glyph="search"/>
                </Button></Col>
            </Row>
            {results}
        </form>)
    }
});

React.renderComponent(<DeviceOwnerSearch/>, document.getElementById('device-owner-search'));