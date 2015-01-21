/** @jsx React.DOM */
var arcColors = ['rgba(146, 58, 242, 0.65)', 'orangered', 'rgba(0, 128, 128, 0.792157)', 'rgba(145, 189, 37, 0.81)', 'rgba(0, 0, 255, 0.64)', 'brown'];

var c3Chart = React.createClass({
    getDefaultProps: function() {
        return {id: "c3chart", title: "long"}
    },
    render: function() {
        var that = this, categories = [];
        console.log(that.props.data);
        if (that.props.data) {
            categories = Object.keys(that.props.data).filter(function(k){return that.props.data[k] > 0}).sort();
            var colors = {};
            categories.forEach(function(value, index){
                colors[value] = arcColors[index];
            });
        }
        c3.generate({
            bindto: '#'.concat(that.props.id),
            data: {
                type: that.props.chartType,
                json: [that.props.data],
                keys: {
                    value: categories
                },
                colors: colors
            },
            donut: {
                title: that.props.title,
                label: {
                    format: function (value, ratio, id) {
                        return value;
                    },
                    threshold: 0.012
                }
            },
            legend: {
        position: 'right'
    }
        });
        return(
            <div id={this.props.id} className="c3-chart"></div>
        )
    }
});


var ZendeskNow = React.createClass({
    getInitialState: function() {
        return {
            data: {},
            zoomable: false,
            chartType: "donut"
        }
    },

    componentDidMount: function() {
        $("#zoom-check").attr("checked", false);
        var that = this;
        $.ajax({
            url: "/api/zendesk_now",
            type: "GET",
            dataType: "json",
            success: function(response) {
                that.setState({data: response.data});
                console.log(response);
            }
        })
    },

    handleChartType: function() {
        this.setState({chartType: $("#chart-type").val()});
    },

    render: function() {
        return (<div>
            <p className="chart-remark">Note: Legends are clickable to toggle visibility by category</p>
            <Row>
                <Col xs={6} sm={6} md={6}>
                    <c3Chart data={this.state.data.status} title="Tickets Status Breakdown" id="ticket-status-chart" chartType={this.state.chartType}/>
                </Col>
                <Col xs={6} sm={6} md={6}>
                    <c3Chart data={this.state.data.recipient} title="Tickets Recipient Breakdown" id="ticket-recipient-chart" chartType={this.state.chartType}/>
                </Col>
            </Row>
        </div>)
    }
});
React.renderComponent(<ZendeskNow />, document.getElementById('zendesk-now'));