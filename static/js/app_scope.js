/** @jsx React.DOM */
// The above declaration must remain intact at the top of the script.

var appScopeCanvas = React.createClass({
    getInitialState: function() {
        return {
            apps: [],
            allScopes: [],
            selectedAppScopes: []
        };
    },
    handleSelectChange: function() {
        var selectedAppID = this.refs.app.getDOMNode().value;
        this.setState({
            selectedAppScopes: _.find(this.state.apps,function(t){ return t.id == selectedAppID}).scopes
        });
    },
    componentDidMount: function(){
        $.ajax({
          url: 'api/app',
          dataType: 'json',
          type: 'GET',
          success: function(response) {
            this.setState({apps: response.data});
            console.log('current apps info loaded');
            $.ajax({ //nested ajax to avoid race condition
              url: 'api/app_scope',
              dataType: 'json',
              type: 'GET',
              success: function(response) {
                this.setState({allScopes: response.data});
                console.log('all scopes loaded');
                console.log(this.state);
              }.bind(this),
              error: function(xhr, status, err) {
                console.error(this.props.url, status, err);
              }.bind(this)
            });
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(this.props.url, status, err);
          }.bind(this)
        });
        setTimeout(function(){
            $('#magic').click();
        }, 2000);
    },

    toggle: function(e) {
        var toggled_scope = $(e.target).parent().attr('id');
        var newSelectedAppScopes = this.state.selectedAppScopes.indexOf(toggled_scope) > -1 ?
                                    _.without(this.state.selectedAppScopes, toggled_scope):
                                    _.union(this.state.selectedAppScopes, [toggled_scope]);
        this.setState({
            selectedAppScopes: newSelectedAppScopes
        });
    },
    update: function(e) {
        var updateData = {
            app_id: this.refs.app.getDOMNode().value,
            scopes: JSON.stringify(this.state.selectedAppScopes)
        };
        console.log('this is updated data to be sent', updateData);
        $.ajax({
          url: 'api/app_scope',
          dataType: 'json',
          type: 'PUT',
          data: updateData,
          success: function(response) {
            console.log(response);
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(this.props.url, status, err);
          }.bind(this)
        });
    },
    render: function() {
        var options = [];
        this.state.apps.forEach(function(app){
            var option =  app.id === 3 ?
                          <option selected="selected" value={app.id}>{app.name}</option>:
                          <option value={app.id}>{app.name}</option>;
            options.push(option);
        }.bind(this));

        var tableHeader = <tr><th>Scope</th><th>Status</th></tr>;
        var tableRows = [];
        var offLabel = <span onClick={this.toggle} className="label label-danger form-control">OFF</span>,
            onLabel = <span onClick={this.toggle} className="label label-success form-control">ON</span>;

        this.state.allScopes.forEach(function(scope){
            var status = this.state.selectedAppScopes.indexOf(scope) === -1 ?
                      offLabel:onLabel;
            tableRows.push(<tr>
                <td>{scope}</td>
                <td id={scope}>{status}</td>
            </tr>);
        }.bind(this));

        return (<div>
            <select ref="app" onChange={this.handleSelectChange} className="form-control">{options}</select>
            <table className="table table-condensed">
              <thead>{tableHeader}</thead>
              <tbody>{tableRows}</tbody>
            </table>
            <button type="submit" onClick={this.update} className="btn btn-info form-control">Save</button>
            <button type="button" onClick={this.handleSelectChange} className="btn btn-warning form-control" id="magic">Magic</button>
        </div>)
    }
});

React.renderComponent(<appScopeCanvas />, document.getElementById('app-scope'));
