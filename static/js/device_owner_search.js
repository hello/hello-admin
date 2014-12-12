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
      var deviceIdInput = $('#device-id-input').val().trim();
      history.pushState({}, '', '/users/?device_id=' + deviceIdInput);
      console.log("sending GET", deviceIdInput);
      $.ajax({
        url: '/api/devices/owners',
        dataType: 'json',
        contentType: 'application/json',
        type: 'GET',
        data: {device_id: deviceIdInput},
        success: function(response) {
          console.log(response.data);
          this.setState({emails: response.data});
        }.bind(this),
        error: function(e) {
          console.error(e);
          this.setState({emails: []});
        }.bind(this)
      });
      return false;
    },

    componentDidMount: function(e) {
        var deviceIdFromURL = getParameterByName('device_id');
        if (deviceIdFromURL) {
          $("#device-id-input").val(deviceIdFromURL);
          this.handleSubmit(e);
        }
    },

    render: function() {
        var emails = [<p/>];
        this.state.emails.forEach(function(email){
            emails.push(<OwnerEmail email = {email}/>);
        });
        var results = this.state.emails.length === 0 ? <div>&#9731;</div> : emails;
        return (<form className="fancy-box" onSubmit={this.handleSubmit}>
            <div className="input-group input-group-md">
              <span className="input-group-addon"><i className="glyphicon glyphicon-tasks"></i></span>
              <div className="icon-addon addon-md">
                <Input id="device-id-input" type="text" placeholder="query by EXACT device ID" />
                <label for="device-id-input" className="glyphicon glyphicon-phone"></label>
              </div>
              <span className="input-group-btn">
                <button id="device-id-submit" className="btn btn-default form-control" type="submit">
                  <span className="glyphicon glyphicon-search"/>
                </button>
              </span>
            </div>
            {results}
        </form>)
    }
});

React.renderComponent(<DeviceOwnerSearch/>, document.getElementById('device-owner-search'));