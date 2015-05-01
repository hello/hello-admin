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
        idsSpans.push(<span className="ids-all cursor-hand">
            <span className="ids-val">{d.ids.join(", ")}</span>
            <img src="/static/image/copy.png"/><span className="superscript">all</span>
        </span>);
        rows.push(<tr>
            <td><span className="feature-td cursor-custom">{d.name}</span></td>
            <td>{idsSpans}</td>
            <td>{d.groups.join(", ")}</td>
            <td className="percentage-td">{d.percentage}</td>
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
      sliderValue: 0,
      alert: ""
    };
  },

  populateInput: function () {
    var that = this;
    $('.feature-td').click(function(){
      var updatedSliderValue = Number($(this).parent().siblings(".percentage-td").text());
      var mySlider = $('input.slider').slider();
      mySlider.slider("setValue", updatedSliderValue);
      that.setState({sliderValue: updatedSliderValue});
      $('#feature-input').focus().val($(this).text());
    });
    $('.ids-td').click(function(){
      $('#ids-input').tagsinput('add', $(this).text());
      $('.bootstrap-tagsinput').children('input').focus();
    });
    $('.ids-all').click(function(){
      $('#ids-input').tagsinput('add', $(this).children(".ids-val").text());
      $('.bootstrap-tagsinput').children('input').focus();
    });
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
        this.populateInput();
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
            this.populateInput();
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
    var mySlider = $('input.slider').slider();
    mySlider.slider("setValue", 0).on('slide', function(slideEvt){
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
        if (response.status === 204 && response.error === "") {
            that.setState({alert: "Successfully updated"});
        }
        else {
            that.setState({alert: response.error});
        }
        this.getCurrentFeatures();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err);
      }.bind(this)
    });
  },

  render: function () {
    var groupsOptions = [<option value="all">➢  all</option>];
    var that = this;
    groupsNames = _.chain(that.state.groups).values().flatten().pluck("name").uniq().value();
    groupsNames.forEach(function(group){
      groupsOptions.push(<option value={group}>{"➢  " + group}</option>)
    });
    var alert = this.state.alert === "" ? null:<Alert>{this.state.alert}</Alert>;
    return (<Grid>
      <Row className="show-grid">
        <Col xs={5} md={5}><code className="nonscript">
          <h4>Feature<em className="remark">Enter a <strong>string</strong> or click to select current &rarr;</em></h4>
          <Input id="feature-input" bsStyle="success" type="text" placeholder="e.g alpha-firmware"/>
          <h4>IDs<em className="remark">Enter device(s) (<strong>string</strong>), user(s) (<strong>int</strong>) or click to select current &rarr;</em></h4>
          <LongTagsInput id="ids-input" tagClass="label label-info" placeHolder="e.g D123, D456" />
          <h4>Groups<em className="remark">Hold <strong>Cmd</strong> to select/deselect multiple &darr;</em></h4>
          <Input id="groups-input" type="select" multiple>
            {groupsOptions}
          </Input>
          <h4>Percentage: <span>{this.state.sliderValue}</span></h4>
          <span>0&nbsp;&nbsp;&nbsp;</span>
          <input type="text" className="span2 slider" value="" data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-id="RC" id="R" data-slider-tooltip="show" data-slider-handle="square" />
          <span>&nbsp;100</span>
          <h4>Submit</h4>
          <Button bsStyle="danger" onClick={this.handleSubmit}><Glyphicon glyph="send"/> PUT</Button>
          <br/>
          {alert}
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
