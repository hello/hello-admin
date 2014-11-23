/** @jsx React.DOM */

var FeaturesTableBody = React.createClass({
  getDefaultProps: function() {
      return {data: []}
  },
  render: function () {
      var rows = [];
      this.props.data.forEach(function(d){
        rows.push(<tr>
            <td>{d.name}</td>
            <td>{d.ids.join(", ")}</td>
            <td>{d.groups.join(", ")}</td>
            <td>{d.percentage}</td>
        </tr>);
      });
      return (<tbody>
        {rows}
      </tbody>)
  }
});


var FeaturesTable = React.createClass({
  render: function() {
      return (<Table condensed bordered>
          <thead>
            <tr>
              <th className="alert-info">Feature</th>
              <th className="alert-success">IDs</th>
              <th className="alert-success">Groups</th>
              <th className="alert-success">Percentage</th>
            </tr>
          </thead>
          <FeaturesTableBody data={this.props.data} />
      </Table>)
  }
});

var ConfigMaestro = React.createClass({
  getInitialState: function () {
    return {
      ids: "",
      groups: [],
      data: [],
      sliderValue: 20
    };
  },

  getCurrentFeatures: function() {
    $.ajax({
      url: '/api/features',
      dataType: 'json',
      contentType: 'application/json',
      type: 'GET',
      success: function(response) {
        this.setState({
          data: response.data
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err);
      }.bind(this)
    });
  },

  getCurrentGroups: function() {
    $.ajax({
      url: 'api/teams',
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      data: {mode: 'users'},
      success: function(response) {
        var usersGroups = response.data;
        $.ajax({
          url: 'api/teams',
          type: 'GET',
          dataType: 'json',
          contentType: 'application/json',
          data: {mode: 'devices'},
          success: function(response) {
            var devicesGroups = response.data;
            this.setState({
              groups: usersGroups.concat(devicesGroups)
            });
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(status, err);
          }.bind(this)
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err);
      }.bind(this)
    });
  },

  componentDidMount: function () {
    this.getCurrentFeatures();
    this.getCurrentGroups();
    var that = this;
    $('#ids-input').change(function(){
      that.setState({ids: $('#ids-input').val()});
    });
    $('#groups-input').change(function(){
      that.setState({ids: $('#groups-input').val()});
    });

    $('.slider').slider({value: 20}).on('slide', function(slideEvt){
      that.setState({sliderValue: slideEvt.value});
    });
  },

  handleSubmit: function() {
    var that = this;
    var submitData = {
      feature: $('#feature-input').val(),
      ids: $('#ids-input').val(),
      groups: $('#groups-input').val(),
      percentage: this.state.sliderValue
    };
    $.ajax({
      url: '/api/features',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(submitData),
      type: 'PUT',
      success: function(response) {
        this.getCurrentFeatures();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err);
      }.bind(this)
    });
  },

  render: function () {
    var groupsOptions = [];
    var that = this;
    groupsNames = _.chain(that.state.groups).values().flatten().pluck("name").uniq().value();
    groupsNames.forEach(function(group){
      groupsOptions.push(<option value={group}>{"➢  " + group}</option>)
    });
    return (<Grid>
      <Row className="show-grid">
        <Col xs={5} md={5}><code className="nonscript">
          <h4>Feature</h4>
          <Input id="feature-input" bsStyle="warning" type="text" placeholder="e.g alpha-firmware"/>
          <h4>IDs</h4>
          <LongTagsInput id="ids-input" tagClass="label label-info" placeHolder="e.g D123, D456" />
          <h4>Groups</h4>
          <Input id="groups-input"type="select" multiple>
            {groupsOptions}
          </Input>
          <h4>Percentage: <span>{this.state.sliderValue}</span></h4>
          <span>0&nbsp;</span>
          <input type="text" className="span2 slider" value="" data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-id="RC" id="R" data-slider-tooltip="show" data-slider-handle="square" />
          <span>&nbsp;100</span>
          <h4>Submit</h4>
          <Button bsStyle="danger" onClick={this.handleSubmit}><Glyphicon glyph="send"/> PUT</Button>
        </code></Col>
        <Col xs={7} md={7}><code className="nonscript">
          <h4>Current Configs</h4>
          <FeaturesTable data={this.state.data} />
          <button id="refresh" onClick={this.getCurrentFeatures}/>
        </code></Col>
      </Row>
    </Grid>);
  }
});

React.renderComponent(<ConfigMaestro />, document.getElementById("configuration"));
