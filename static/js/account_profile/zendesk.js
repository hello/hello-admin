var ZendeskTile = React.createClass({
    getInitialState: function() {
        return {
            zendeskResponse: {data: {}, error: ""},
            zendeskStatus: null
        }
    },
    loadZendeskTickets: function(email) {
        this.setState({zendeskStatus: <div className="loader"><img src="/static/image/loading.gif" /></div>});
        $.ajax({
            url: "/api/zendesk",
            dataType: "json",
            type: 'GET',
            data: {email: email},
            success: function (response) {
                if (response.error.isWhiteString()) {
                    this.setState({zendeskResponse: response, zendeskStatus: null});
                }
                else {
                    this.setState({zendeskResponse: response, zendeskStatus: <Well>{response.error}</Well>});
                }
            }.bind(this)
        });
    },
    componentDidMount: function() {
        this.loadZendeskTickets(this.props.email);
    },
    render: function() {
        var zendeskResponse = this.state.zendeskResponse, ticketsCount = 0;
        if (zendeskResponse.error.isWhiteString() && !$.isEmptyObject(zendeskResponse.data) && zendeskResponse.data.tickets.length > 0) {
            ticketsCount = zendeskResponse.data.count;
            var zendeskTickets = <ReactBootstrap.Carousel index={0} pause="true" interval={Math.pow(10, 10)}>
                {zendeskResponse.data.tickets.map(function(ticket){
                    var ticketURL = "https://helloinc.zendesk.com/tickets/" + ticket.id;
                    var ticketFrom = Object.keys(ticket.via.source.from).map(function(k){return ticket.via.source.from[k]}).join(" | ") || ticket.via.channel;
                    var ticketTags = <em>{ticket.tags.join(", ")}</em>;
                    return <ReactBootstrap.CarouselItem>
                        <div className="zendesk-well">
                            <Table>
                                <thead/>
                                <tbody>
                                    <tr><td>Created</td><td>{new Date(ticket.created_at).toString()}</td></tr>
                                    <tr><td>From</td><td>{ticketFrom}</td></tr>
                                    <tr><td>To</td><td>{ticket.recipient}</td></tr>
                                    <tr><td>Subject</td><td>{ticket.subject}</td></tr>
                                    <tr><td>Tags</td><td>{ticketTags}</td></tr>
                                    <tr><td>Updated</td><td>{new Date(ticket.updated_at).toString()}</td></tr>
                                    <tr><td>Status</td><td>{ticket.status}</td></tr>
                                    <tr><td>URL</td><td><a target="_blank" hrf={ticketURL}>{ticketURL}</a></td></tr>
                                    <tr><td/><td/></tr>
                                </tbody>
                            </Table>
                        </div>
                    </ReactBootstrap.CarouselItem>;
                })}</ReactBootstrap.Carousel>;
        }
        return <div>
            <div>&nbsp;&Sigma; = {ticketsCount}</div>
            {this.props.status}
            {zendeskTickets}
        </div>
    }
});

var ZendeskModal = React.createClass({
    render: function() {
        return ( <Modal animation={true}>
            <div className='modal-header row'>
                <Col xs={10} className="modal-title">Recent Zendesk Tickets</Col>
                <Col xs={2} className="right-wrapper"><Button bsSize="xsmall" class="modal-close" onClick={this.props.onRequestHide}>x</Button></Col>
            </div>
            <div className='modal-body'>
                <ZendeskTile email={this.props.email}/>
            </div>
            <div className='modal-footer'>
                <Button onClick={this.props.onRequestHide}>Close</Button>
            </div>
        </Modal>);
    }
});