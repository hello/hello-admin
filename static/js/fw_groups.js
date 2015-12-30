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
                <td><div className="fw-group-ids">{idsSpans}</div></td>
                <td><span className="ids-all cursor-hand"><span className="ids-val">{d.ids.join(", ")}</span>
                    <img src="/static/image/copy.png"/></span></td>
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
                    <th className="alert-info">All</th>
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
            $('#group-input').focus().val($(this).text());
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

    getFWGroups: function() {
        var that = this;
        $.ajax({
            url: '/api/fw_groups',
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
            error: function(e) {
                console.error(e);
            }.bind(this)
        });
    },


    handleModeChange: function() {
        this.getFWGroups();
    },

    componentDidMount: function () {
        this.getFWGroups();
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
            url: '/api/fw_groups',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(sendData),
            type: 'PUT',
            success: function(response) {
                console.log("raw GET response", response);
                that.getFWGroups();
            }.bind(this),
            error: function(e) {
                console.log(e);
                that.getFWGroups();
            }.bind(this)
        });
    },

    render: function () {
        var currentMode = $('#mode-input').val();
        var displayMode =  currentMode ? currentMode.capitalize().substring(0, currentMode.length - 1): null;
        var inputTypeRemark = currentMode === "users" ? "int": "string";
        return (<div>
            <Input id="mode-input" bsStyle="warning" type="select" defaultValue="devices" onChange={this.handleModeChange} addonBefore="Group Type">
                <option value="devices">&#10148;&nbsp;Device</option>
                <option value="users">&#10148;&nbsp;User</option>
            </Input>

            <Col xs={6}>
                <h4><span>{displayMode}</span> Firmware Group Name <em className="remark">Enter a <strong>string</strong> or click to select existing &rarr;</em></h4>
                <Input id="group-input" type="text" placeholder="e.g alpha-dev" />
                <h4><span>{displayMode}</span> ID(s) <em className="remark">Enter <strong>{inputTypeRemark}</strong>(s) or click to select existing &rarr;</em></h4>
                <LongTagsInput id="ids-input" tagClass="label label-info" placeHolder="e.g 123, 666, 987" />
                <h4>Change IDs of a Group</h4>
                <Button className="col-xs-3 col-md-3 col-lg-3" action="add" bsStyle="success" onClick={this.handleSend}><Glyphicon glyph="plus"/> Add</Button>
                <Button className="col-xs-3 col-md-3 col-lg-3" action="replace" bsStyle="primary" onClick={this.handleSend}><Glyphicon glyph="refresh"/> Replace</Button>
                <Button className="col-xs-3 col-md-3 col-lg-3"action="remove" bsStyle="danger" onClick={this.handleSend}><Glyphicon glyph="minus"/> Remove</Button>
                <p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><hr className="fancy-line"/><p>&nbsp;</p>
                <h4>Delete a Group</h4>
                <Input id="group-del-input" type="text" placeholder="e.g gamma-dev" buttonBefore={<Button>Before</Button>}/>
                <Button className="col-xs-3 col-md-3 col-lg-3" action="delete-group" bsStyle="default" onClick={this.handleSend}><Glyphicon glyph="remove"/> Delete</Button>
            </Col>
            <Col xs={6}>
                <h4>Current FW Groups</h4>
                <FeaturesTable data={this.state.data} />
                <button id="refresh" onClick={this.getFWGroups}/>
            </Col>
        </div>);
    }
});

React.renderComponent(<ConfigMaestro />, document.getElementById("fw_groups"));
