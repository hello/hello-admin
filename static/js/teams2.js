/** @jsx React.DOM */

var FeaturesTableBody = React.createClass({
  getDefaultProps: function() {
      return {data: []}
  },

  render: function () {
      var rows = [];
      this.props.data.forEach(function(d){
        var idsSpans = [];
        d.ids.forEach(function(id){
          var id_td = d.ids.indexOf(id) === d.ids.length - 1 ? id: id+", ";
          idsSpans.push(<span className="ids-td cursor-custom">{id_td}</span>);
        });
        rows.push(<tr>
            <td><span className="group-td cursor-custom">{d.name}</span></td>
            <td>{idsSpans}</td>
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
              <th className="alert-info">Group</th>
              <th className="alert-success">IDs</th>
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
      data: []
    };
  },

  populateInput: function () {
    $('.group-td').click(function(){
      $('#group-input').val($(this).text());
    });
    $('.ids-td').click(function(){
      $('#ids-input').tagsinput('add', $(this).text());
    });
  },

  getTeams: function() {
    var that = this;
    $.ajax({
      url: '/api/teams2/',
      dataType: 'json',
      contentType: 'application/json',
      type: 'GET',
      data: {mode: $('#mode-input').val()},
      success: function(response) {
        console.log(response.data);
        this.setState({
          data: response.data
        });
        this.populateInput();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err);
      }.bind(this)
    });
  },


  handleModeChange: function() {
    this.getTeams();
  },

  componentDidMount: function () {
    this.getTeams();
  },

  handleSend: function(e) {
    var that = this;
    var action = $(e.target).attr('action') || $(e.target).parent('button').attr('action');
    var sendData = {
      group: action !== 'delete-group' ? $('#group-input').val(): $('#group-del-input').val(),
      ids: $('#ids-input').val(),
      mode: $('#mode-input').val(),
      action: action
    };
    console.log('sending', sendData);
    $.ajax({
      url: '/api/teams2',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(sendData),
      type: 'PUT',
      success: function(response) {
        console.log(response);
        that.getTeams();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err);
      }.bind(this)
    });
  },

  render: function () {
    var currentMode = $('#mode-input').val();
    var displayMode =  currentMode ? currentMode.capitalize(): null;
    return (<Grid>
      <Row className="show-grid">
        <Col xs={3} md={3} xsOffset={5} mdOffset={5}><code className="nonscript">
          <Input id="mode-input" bsStyle="warning" type="select" defaultValue="devices" onChange={this.handleModeChange} addonBefore="Type">
            <option value="devices">&#10148;&nbsp;Devices</option>
            <option value="users">&#10148;&nbsp;Users</option>
          </Input>
        </code></Col>
      </Row>
      <Row className="show-grid">
        <hr className="fancy-line"/>
      </Row>
      <Row className="show-grid">
        <Col xs={5} md={5}><code className="nonscript">
          <h4><span>{displayMode}</span> Group <em className="remark">Enter new or click to select current &rarr;</em></h4>
          <Input id="group-input" type="text" placeholder="e.g alpha-dev" />
          <h4><span>{displayMode}</span> IDs <em className="remark">Enter new or click to select current &rarr;</em></h4>
          <LongTagsInput id="ids-input" tagClass="label label-info" placeHolder="e.g 555Cxx, 555C6y" />
          <h4>Change IDs of a Group</h4>
          <Button action="add" bsStyle="warning" onClick={this.handleSend}><Glyphicon glyph="send"/> Add</Button>
          <span>&nbsp;</span>
          <Button action="replace" bsStyle="primary" onClick={this.handleSend}><Glyphicon glyph="send"/> Replace</Button>
          <span>&nbsp;</span>
          <Button action="remove" bsStyle="danger" onClick={this.handleSend}><Glyphicon glyph="send"/> Remove</Button>
          <p>&nbsp;</p><p>&nbsp;</p><hr className="fancy-line"/><p>&nbsp;</p>
          <h4>Delete a Group</h4>
          <Input id="group-del-input" type="text" placeholder="e.g gamma-dev" buttonBefore={<Button>Before</Button>}/>
          <Button action="delete-group" bsStyle="default" onClick={this.handleSend}><Glyphicon glyph="send"/> Delete</Button>
        </code></Col>
        <Col xs={7} md={7}><code className="nonscript">
          <h4>Current Teams</h4>
          <FeaturesTable data={this.state.data} />
          <button id="refresh" onClick={this.getTeams}/>
        </code></Col>
      </Row>
    </Grid>);
  }
});

React.renderComponent(<ConfigMaestro />, document.getElementById("teams2"));
