/** @jsx React.DOM */

var TokenGenMaestro = React.createClass({
    getInitialState: function() {
      return {
        apps: [],
        generatedToken: ""
      }
    },
    componentDidMount: function () {
      $.ajax({
        url: '/api/app',
        dataType: 'json',
        contentType: 'application/json',
        type: 'GET',
        success: function(response) {
        var apps = _.map(response.data, function(app){
          return {name: app.name, client_id: app.client_id}
        });
        if ($("#restrict-app").val() === "Benjo") {
          apps = apps.filter(function(appl){
            return appl.name.indexOf("Benjo") > -1;
          });
        }
        this.setState({apps: apps});
        }.bind(this),
        error: function(e) {
          console.error(e);
        }.bind(this)
      });
    },
    handleTokenRequest: function() {
      var putData = {
        app: $('#token-app-input').val().trim(),
        username: $('#token-username-input').val().trim(),
        password: $('#token-password-input').val().trim()
      };
      $.ajax({
        url: '/api/tokens',
        dataType: 'json',
        contentType: 'application/json',
        type: 'PUT',
        data: JSON.stringify(putData),
        success: function(response) {
          this.setState({generatedToken: response.data.token});
        }.bind(this),
        error: function(e) {
          alert("Failed to generate token");
        }.bind(this)
      });
      return false;
    },
    render: function() {
        var appOptions = [];
        this.state.apps.forEach(function(app){
            appOptions.push(<option value={app.client_id}>{app.name + " (" + app.client_id + ")"}</option>);
        });
        var generatedToken = this.state.generatedToken === "" ? null:
            <div>Token "{this.state.generatedToken}" generated.</div>;

        return (<form className="fancy-box" onSubmit={this.handleTokenRequest}>
            <Input id="token-app-input" type="select">{appOptions}</Input>
            <Input id="token-username-input" type="text" placeholder="username"/>
            <Input id="token-password-input" type="password" placeholder="password"/>
            <div><button type="submit" className="btn btn-info btn-circle"><span className="glyphicon glyphicon-send"></span></button></div>
            {generatedToken}
        </form>)
    }
});

React.renderComponent(<TokenGenMaestro/>, document.getElementById('token-generator'));