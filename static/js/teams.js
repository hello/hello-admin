/** @jsx React.DOM */

var AddRemoveDeviceModal = React.createClass({
  addDevice: function() {
      this.props.onRequestHide();
      var addData = {
          devices: $('#device').val(),
          team: $('#teamModify').val() || $('#teamNew').val()
      };
      var that = this;
      $.ajax({
          url: '/api/device',
          dataType: 'json',
          contentType: 'application/json',
          type: 'PUT',
          data: JSON.stringify(addData),
          success: function(response) {
            $('#update').click(); // trigger update
          }.bind(that),
          error: function(xhr, status, err) {
            console.error(status, err);
          }.bind(that)
      });
  },
  removeDevice: function() {
      this.props.onRequestHide();
      var removeData = {
          devices: $('#device').val(),
          team: $('#teamModify').val()
      };
      $.ajax({
          url: '/api/device',
          dataType: 'json',
          contentType: 'application/json',
          type: 'POST',
          data: JSON.stringify(removeData),
          success: function(response) {
            $('#update').click(); // trigger update
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(status, err);
          }.bind(this)
      });
  },

  handleNewTeamChange: function () {
      if ($('#teamNew').val() !== "") {
        $('#teamModify').val("");
        $('#teamModifyContainer').hide();
        $('#removeDeviceButton').hide();
      }
      else {
        $('#teamNew').val("");
        $('#teamModifyContainer').show();
        $('#removeDeviceButton').show();
      }
  },
  render: function() {
    var team = $('#teamSelect').val();
    var teamOptions = [<option value="">Choose Team</option>];
    this.props.teams.forEach(function(t){
      teamOptions.push(<option value={t}>{t}</option>)
    });

    return this.transferPropsTo(
        <Modal title="Add/Remove devices from an existing team" animation={true}>
          <div className="modal-body">
            <LongTagsInput id="device" type="text" tagClass="label label-info" label="Devices" placeHolder="input 1 or more devices" />
            <Input id="teamNew" type="text" bsStyle="warning" label="New Team" placeholder="input a brand new team" onChange={this.handleNewTeamChange} />
            <div id="teamModifyContainer">
            <Input id="teamModify" defaultValue={team} type="select" label="Existing Team">
              {teamOptions}
            </Input>
            </div>
          </div>
          <div className="modal-footer">
            <Button bsStyle="success" onClick={this.addDevice}><Glyphicon glyph="floppy-saved"/>&nbsp;&nbsp;Add</Button>
            <Button id="removeDeviceButton" bsStyle="danger" onClick={this.removeDevice}><Glyphicon glyph="floppy-remove"/>&nbsp;&nbsp;Remove</Button>
            <Button onClick={this.props.onRequestHide}>Close</Button>
          </div>
        </Modal>
      );
  }
});

var DeviceMaestro = React.createClass({
    getInitialState: function() {
        return {
            teams: [],
            devices: [],
            getStatus: 0
        }
    },

    getTeams: function() {
        $.ajax({
          url: '/api/device',
          dataType: 'json',
          contentType: 'application/json',
          type: 'GET',
          data: {show_teams_only: "true"},
          success: function(response) {
            this.setState({
                getStatus: response.status,
                teams: response.data
            });
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(status, err);
            this.setState({getStatus: status});
          }.bind(this)
        });
    },

    getDevices: function() {
        var selectedTeam = $('#teamSelect').val();
        if (selectedTeam === '') {
            this.setState({devices: []});
            return
        }

        $.ajax({
          url: '/api/device',
          dataType: 'json',
          contentType: 'application/json',
          type: 'GET',
          data: {team: selectedTeam},
          success: function(response) {
            this.setState({
                getStatus: response.status,
                devices: response.data.ids
            });
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(status, err);
            this.setState({getStatus: status});
          }.bind(this)
        });
    },

    componentDidMount: function() {
        this.getTeams();
    },

    update: function() {
        this.getTeams();
        this.getDevices();
    },

    render: function() {
        var listGroupItems = [];
        this.state.devices.forEach(function(d){
            listGroupItems.push(
                <ListGroupItem>{d}</ListGroupItem>
            );
        });
        var options = [<option value="">Select Team</option>];
        this.state.teams.forEach(function(team){
           options.push(<option value={team}>{team}</option>);
        });
        return (<div className="row">
          <div className="col-xs-4">
              <Input id="teamSelect" type="select" defaultValue="" onChange={this.getDevices}>
                {options}
              </Input>
              <ListGroup>
                {listGroupItems}
              </ListGroup>
          </div>

          <div className="col-xs-2">
            <ModalTrigger modal={<AddRemoveDeviceModal teams={this.state.teams} />}>
              <Button bsStyle="primary" bsSize="medium">Add / Remove Devices</Button>
            </ModalTrigger>
          </div>
          <button id="update" onClick={this.update}/>
        </div>);
    }
});

React.renderComponent(<DeviceMaestro/>, document.getElementById('reboot'));