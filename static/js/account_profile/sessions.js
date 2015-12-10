var utcFormatter = d3.time.format.utc("%a&nbsp;&nbsp;%d&nbsp;&nbsp;%b&nbsp;&nbsp;%Y<br>%H : %M : %S - GMT");

var SessionsTile = React.createClass({
    getInitialState: function() {
        return {sessions: [], error: ""}
    },

    loadSessions: function(email) {
        this.getInitialState();
        $.ajax({
            url: "/api/sessions",
            dataType: "json",
            type: 'GET',
            data: {email: email},
            success: function (response) {
                this.setState({sessions: response.data, error: response.error})
            }.bind(this)
        });
        return false;
    },

    componentDidMount: function() {
        this.loadSessions(this.props.email);
    },

    render: function() {
        var latestSession = this.state.sessions.length === 0 ? null :
            [
                <tr><td/><td><em>Latest Active Session</em></td></tr>,
                <tr><td>Expires In</td><td>{this.state.sessions[0].expires_in}</td></tr>,
                <tr><td>Created At</td><td><span dangerouslySetInnerHTML={{__html:utcFormatter(new Date(this.state.sessions[0].created_at))}}/></td></tr>,
                <tr><td>App ID</td><td>{this.state.sessions[0].app_id}</td></tr>,
                <tr><td>App Name</td><td>{this.state.sessions[0].app_name}</td></tr>,
            ];
        return <div><Table>
            <tbody>
                <tr><td>Total tokens</td><td>{this.state.sessions.length}</td></tr>
                {latestSession}
            </tbody>
        </Table>
            <ul className="extra">
                <li><ModalTrigger modal={<SessionsModal sessions={this.state.sessions} email={this.props.email} loadSessions={this.loadSessions} />}>
                    <a className="cursor-hand">All Active Sessions</a>
                </ModalTrigger></li>
            </ul></div>;
    }
});


var SessionsModal = React.createClass({
    revokeSession: function(id) {
        $.ajax({
            url: "/api/sessions_update",
            dataType: "json",
            type: 'PUT',
            data: {id: id},
            success: function (response) {
                if (response.error) {
                    alert(response.error);
                }
                else {
                    this.props.loadSessions(this.props.email);
                }
            }.bind(this)
        });
        return false;
    },
    render: function() {
        return <Modal className="modal-sessions" animation={true}>
            <div className='modal-body'>
                <div className="modal-title">All sessions <Button className="btn-round btn-borderless btn-fade" onClick={this.props.onRequestHide}>X</Button></div>
                <div className="modal-subtitle">Sorted by row ID in descending order</div>
                <br/>
                <Table id="sessions">
                    <tbody>
                        <tr className="modal-col-title">
                            <td>ID</td>
                            <td>Created At (Browser tz)</td>
                            <td>Expires In</td>
                            <td>App ID</td>
                            <td>App Name</td>
                            <td>Scopes</td>
                            <td>Action</td>
                        </tr>
                        {this.props.sessions.map(function(s){
                            var revokeButton = !($("#is-super-engineer").val() === "True") ? null :
                                <Button onClick={this.revokeSession.bind(this, s.id)}>
                                    <Glyphicon glyph="trash" />&nbsp;&nbsp;Revoke
                                </Button>;
                            return <tr>
                                <td>{s.id}</td>
                                <td>{new Date(s.created_at).toLocaleString()}</td>
                                <td>{s.expires_in}</td>
                                <td>{s.app_id}</td>
                                <td>{s.app_name}</td>
                                <td>{s.scopes.join(", ")}</td>
                                <td>{revokeButton}</td>
                            </tr>;
                        }.bind(this))}
                        <tr><td/><td/><td/><td/></tr>
                    </tbody>
                </Table>
            </div>
            <div className='modal-footer'>
                <Button className="btn-round btn-fade" onClick={this.props.onRequestHide}>X</Button>
            </div>
        </Modal>;
    }
});