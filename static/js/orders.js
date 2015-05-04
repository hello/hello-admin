/** @jsx React.DOM */

var OrdersMaestro = React.createClass({
    getInitialState: function() {
        return {alert: "", confirmCancelOrder: false}
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

    pushHistory: function(order_id) {
        history.pushState({}, '', '/orders/?order_id=' + order_id);
    },

    handleSubmit: function() {
        var that = this;
        var orderId = $("#order-id-input").val().trim();
        var requestData = {
            order_id: orderId
        };
        console.log(requestData);
        if (isValidRequest(requestData)) {
            $.ajax({
                url: "/api/orders",
                type: "GET",
                dataType: 'json',
                data: requestData,
                success: function (response) {
                    console.log(response);
                    if (!response.error.isWhiteString()){
                        that.setState({alert: response.error});
                    }
                    else {
                        that.pushHistory(orderId);
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

    neverMind: function() {
        this.setState({confirmCancelOrder: false});
    },

    render: function() {
        var cancelBlock = this.state.confirmCancelOrder === false ?
            <div><p>Click the button to see next step</p><br/>
            <p><Button onClick={this.cancelOrder}>Proceed to Reveal <Glyphicon glyph="arrow-right"/></Button></p></div>
            :
            <div>
                <p>Be careful, there is no going back after you hit the following link</p><br/>
                <p>
                  <a href={"https://order.hello.is/cancel/" + this.state.alert} target="_blank">
                    {"https://order.hello.is/cancel/" + this.state.alert}
                  </a>
                </p><br/>
                <p><Button onClick={this.neverMind}>Never mind <Glyphicon glyph="arrow-left"/></Button></p>
            </div>;
        var alert = (this.state.alert === "") ? null:
            <div><Alert bsStyle="info">
                <p>Order Details:</p><br/>
                <p><a href={"https://order.hello.is/details/" + this.state.alert} target="_blank">
                    {"https://order.hello.is/details/" + this.state.alert}
                </a></p>
            </Alert>
            <Alert bsStyle="info">
                <p>Cancel Order:</p><br/>
                {cancelBlock}
            </Alert></div>;
        return (<Col xs={6} sm={6} md={6} xsOffset={3} smOffset={3} mdOffset={3}><form onSubmit={this.handleSubmit}>
            <h3>Order Info</h3>
            <hr className="fancy-line" /><br/>
            <Input id="order-id-input" type="text" placeholder="Enter order ID"/>
            <Button bsStyle="info" bsSize="large" className="btn-circle" type="submit"><Glyphicon glyph="send"/></Button>
            {alert}
        </form></Col>)
    }
});
React.renderComponent(<OrdersMaestro />, document.getElementById('orders'));

function isValidRequest(r) {
    return Object.keys(r).every(function(k){return r[k] && !r[k].isWhiteString()})
}
