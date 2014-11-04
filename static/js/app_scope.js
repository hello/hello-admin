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
        }, 3000);
    },

    handleToggle: function(e){
        var clicked_element = $(e.target), this_toggle;
        if (clicked_element.hasClass("switch-button"))
            this_toggle = clicked_element.parent().prev(".toggle");
        else
            this_toggle = clicked_element.prev(".toggle");
        this_toggle.prop("checked", !this_toggle.prop("checked"));
        var toggled_scope = this_toggle.attr('id');
        console.log(toggled_scope, 'huhu');
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
            scopes: this.state.selectedAppScopes
        };
        console.log('this is updated data to be sent', updateData);
        $.ajax({
          url: 'api/app_scope',
          dataType: 'json',
          contentType: 'application/json',
          type: 'PUT',
          data: JSON.stringify(updateData),
          success: function(response) {
            console.log(response);
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(this.props.url, status, err);
          }.bind(this)
        });
    },
    render: function() {
//        $("label").click(function(){$(this).prev("input").prop("checked", true)});
        var options = [];
        this.state.apps.forEach(function(app){
            var option =  app.id === 3 ?
                          <option selected="selected" value={app.id}>{app.name}</option>:
                          <option value={app.id}>{app.name}</option>;
            options.push(option);
        }.bind(this));

        var tableHeader = <tr><th>Scope</th><th>Status</th></tr>;
        var tableRows = [];

        this.state.allScopes.forEach(function(scope){
            var tt = this.state.selectedAppScopes.indexOf(scope) === -1 ?
                <div><input id={scope} className="toggle" type="checkbox" /><label className="toggle-label" onClick={this.handleToggle}><span className="switch-button" onClick={this.handleToggle}/></label></div>
                : <div><input id={scope} className="toggle" type="checkbox" checked /><label className="toggle-label" onClick={this.handleToggle}><span className="switch-button" onClick={this.handleToggle}/></label></div>;

            tableRows.push(<tr>
                <td>{scope}</td>
                <td>{tt}</td>
            </tr>);
        }.bind(this));

        return (<div>
            <div className="fancy-box">
                <select ref="app" onChange={this.handleSelectChange} className="form-control">{options}</select>
                <table className="table table-condensed">
                  <thead>{tableHeader}</thead>
                  <tbody>{tableRows}</tbody>
                </table>
            </div>
            <button type="submit" onClick={this.update} className="btn btn-info form-control"><span className="glyphicon glyphicon-floppy-saved"> Save</span></button>
            <button type="button" onClick={this.handleSelectChange} className="btn btn-warning form-control" id="magic">Magic</button>
        </div>)
    }
});

React.renderComponent(<appScopeCanvas />, document.getElementById('app-scope'));

