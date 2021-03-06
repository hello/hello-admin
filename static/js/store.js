/** @jsx React.DOM */

var QueryOrdersById = React.createClass({
    getInitialState: function() {
        return {alert: "", confirmCancelOrder: false, confirmUncancelOrder: false}
    },

    submitWithInputsfromURL: function() {
        var orderIdInputFromUrl = getParameterByName('order_id');
        if (orderIdInputFromUrl.isWhiteString()) {
            return false;
        }
        $('#order-id-input').val(orderIdInputFromUrl);


        this.handleSubmit();
    },

    componentDidMount: function() {
        this.submitWithInputsfromURL();
    },

    // pushHistory: function(order_id) {
    //     history.pushState({}, '', '/orders/?order_id=' + order_id);
    // },

    handleSubmit: function() {
        var that = this;
        var orderId = $("#order-id-input").val().trim();
        var requestData = {
            order_id: orderId
        };
        if (isValidRequest(requestData)) {
            $.ajax({
                url: "/api/orders",
                type: "GET",
                dataType: 'json',
                data: requestData,
                success: function (response) {
                    if (!response.error.isWhiteString()){
                        that.setState({alert: response.error});
                    }
                    else {
                        that.setState({alert: response.data.order_link});
                    }
                }.bind(that),
                error: function (e) {
                    that.setState({alert: e.toString});
                }.bind(that)
            });
            return false;
        }
    },

    cancelOrder: function() {
        this.setState({confirmCancelOrder: true});
    },

    neverMindCancel: function() {
        this.setState({confirmCancelOrder: false});
    },

    uncancelOrder: function() {
        this.setState({confirmUncancelOrder: true});
    },

    neverMindUncancel: function() {
        this.setState({confirmUncancelOrder: false});
    },

    render: function() {
        var cancelBlock = this.state.confirmCancelOrder === false ?
            <div><p>Click the button to see next step</p><br/>
                <p><Button onClick={this.cancelOrder}>Proceed to Reveal <Glyphicon glyph="arrow-right"/></Button></p></div>
            :
            <div>
                <p>Be careful, you are about to cancel an order</p><br/>
                <p>There is no going back after you hit the following link</p><br/>
                <p>
                    <a href={"https://store.hello.is/cancel/" + this.state.alert} target="_blank">
                    {"https://store.hello.is/cancel/" + this.state.alert}
                    </a>
                </p><br/>
                <p><Button onClick={this.neverMindCancel}>Never mind <Glyphicon glyph="arrow-left"/></Button></p>
            </div>;

        var uncancelBlock = this.state.confirmUncancelOrder === false ?
            <div><p>Click the button to see next step</p><br/>
                <p><Button onClick={this.uncancelOrder}>Proceed to Reveal <Glyphicon glyph="arrow-right"/></Button></p></div>
            :
            <div>
                <p>Be careful, you are about to uncancel an order</p><br/>
                <p>There is no going back after you hit the following link</p><br/>
                <p>
                    <a href={"https://store.hello.is/uncancel/" + this.state.alert} target="_blank">
                    {"https://store.hello.is/uncancel/" + this.state.alert}
                    </a>
                </p><br/>
                <p><Button onClick={this.neverMindUncancel}>Never mind <Glyphicon glyph="arrow-left"/></Button></p>
            </div>;

        var alert = (this.state.alert === "") ? null:
            <div id="order-specs"><Alert bsStyle="info">
                <p>Order Details:</p><br/>
                <p><a href={"https://store.hello.is/details/" + this.state.alert} target="_blank">
                    {"https://store.hello.is/details/" + this.state.alert}
                </a></p>
            </Alert>
                <Alert bsStyle="danger">
                    <p>Cancel Order:</p><br/>
                {cancelBlock}
                </Alert>
                <Alert bsStyle="warning">
                    <p>Uncancel Order (if applicable):</p><br/>
                {uncancelBlock}
                </Alert></div>;
        return (<Col xs={6}><form onSubmit={this.handleSubmit}>
            <h3>Order by ID</h3>
            <hr className="fancy-line" /><br/>
            <Input id="order-id-input" type="text" placeholder="Enter order ID"/>
            <Button id="order-id-submit" bsStyle="info" bsSize="large" className="btn-circle" type="submit"><Glyphicon glyph="send"/></Button>

        </form>
        {alert}
        </Col>)
    }
});

var QueryOrdersOmni = React.createClass({
    getInitialState: function() {
        return {error: null, filteredResult: [], loading: false}
    },

    submitWithInputsfromURL: function() {
        var who = getParameterByName('who');
        if (who.isWhiteString()) {
            return false;
        }
        $('#omni').val(who);
        this.handleSubmit();
    },

    componentDidMount: function() {
        this.submitWithInputsfromURL();
    },
    handleSubmit: function() {
        this.setState({error: null, filteredResult: []});
        $("#order-id-input").val("");
        $("#order-specs").hide();

        var omniInput = this.refs.omniInput.getDOMNode().value.trim();

        if (omniInput.trim().length < 3) {
            this.setState({error: <Alert bsStyle="danger">Input string length must be at least 3 characters</Alert>});
            return false;
        }
        
        $.ajax({
            url: "/api/store/search/",
            type: "GET",
            dataType: 'json',
            data: {
                'q' : omniInput,
            },
            success: function (response) {
                this.setState({filteredResult: response});
            }.bind(this)
        });
        
        
        return false;
    },
    getOrderById: function(orderId) {
        $("#order-id-input").val(orderId);
        $("#order-id-submit").trigger("click").focus();
        $("#order-specs").show();
        return false;
    },
    render: function() {
        var loadingOrSubmit = <Button bsStyle="info" bsSize="large" className="btn-circle" type="submit"><Glyphicon glyph="send"/></Button>;
        
        var table = <Table>
                <thead><tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Order ID</th>
                    <th>Link</th>
                </tr></thead>
                <tbody>{
                    this.state.filteredResult.map(function(d){
                        return <tr>
                            <td>{d.name}</td>
                            <td>{d.email}</td>
                            <td><Button bsSize="small" bsStyle="success" onClick={this.getOrderById.bind(this, d.order_id)}>{d.order_id}</Button></td>
                            <td>
                                <form method="POST" action={"https://store.hello.is/details/" + d.link} target="_blank">
                                    <input type="hidden" name="email" value={d.email} />
                                    <input type="submit" class="btn btn-sm btn-success" value="View order" />
                                </form>
                            </td>
                        </tr>
                    }.bind(this))
                }</tbody>
            </Table>;

        return (<Col xs={6}><form onSubmit={this.handleSubmit}>
            <h3>OrderID by Name Partials / Email</h3>
            <hr className="fancy-line" /><br/>
            <input className="form-control" ref="omniInput" id="omni" type="text" placeholder="Enter name partials / email"/>
            {loadingOrSubmit}
        </form>{table}</Col>)
    }
});

var OrdersMaestro = React.createClass({
    render: function() {
        return <div>
            <QueryOrdersOmni />
            <QueryOrdersById />
        </div>;
    }
});
React.renderComponent(<OrdersMaestro />, document.getElementById('store'));

function isValidRequest(r) {
    return Object.keys(r).every(function(k){return r[k] && !r[k].isWhiteString()})
}
