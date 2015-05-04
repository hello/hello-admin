/** @jsx React.DOM */

var AppGenMaestro = React.createClass({
    getInitialState: function() {
      return {
        availableScopes: [],
        generatedApp: ""
      }
    },
    componentDidMount: function () {
      $.ajax({
        url: '/api/app_scope',
        dataType: 'json',
        contentType: 'application/json',
        type: 'GET',
        success: function(response) {
          this.setState({availableScopes: response.data});
        }.bind(this),
        error: function(e) {
          console.error(e);
        }.bind(this)
      });
    },
    handleSubmit: function() {
      var postData = {
        name: $('#app-name-input').val().trim(),
        scopes: $('#app-scopes-input').val().trim(),
        description: $('#app-description-input').val().trim(),
        client_id: $('#app-client-id-input').val().trim(),
        client_secret: $('#app-client-secret-input').val().trim(),
        redirect_uri: $('#app-redirect-uri-input').val().trim()
      };
      console.log("sending post", postData);
      $.ajax({
        url: '/api/app',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        data: JSON.stringify(postData),
        success: function(response) {
          this.setState({generatedApp: $('#app-name-input').val().trim()});
        }.bind(this),
        error: function(e) {
          console.error(e);
          this.setState({generatedApp: ""});
        }.bind(this)
      });
      return false;
    },
    render: function() {
        var availableScopes = [];
        this.state.availableScopes.forEach(function(s){
            availableScopes.push(<option value={s}>{s}</option>);
        });
        var generatedApp = this.state.generatedApp === "" ? null:
            <div>App "{this.state.generatedApp}" generated. Refresh page if you want other tools to update this new app</div>;
        return (<form className="fancy-box" onSubmit={this.handleSubmit}>
            <Input id="app-name-input" type="text" placeholder="name"/>
            <Input id="app-scopes-input" type="select" multiple>{availableScopes}</Input>
            <Input id="app-description-input" type="text" placeholder="description"/>
            <Input id="app-client-id-input" type="text" placeholder="client id"/>
            <Input id="app-client-secret-input" type="text" placeholder="client secret"/>
            <Input id="app-redirect-uri-input" type="text" placeholder="redirect uri"/>
            <div><button type="submit" className="btn btn-info btn-circle"><span className="glyphicon glyphicon-flash"></span></button></div>
            {generatedApp}
        </form>)
    }
});

React.renderComponent(<AppGenMaestro/>, document.getElementById('app-generator'));