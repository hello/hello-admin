/** @jsx React.DOM */

var c3Chart = React.createClass({
    getDefaultProps: function() {
        return {id: "chart"}
    },
    render: function() {
        var that = this, ticketCategories = [], stackingGroups = [];
        if (that.props.data !== [] && that.props.data.last()) {
            ticketCategories = Object.keys(that.props.data.last());
            stackingGroups = that.props.stackable === true ? [ticketCategories] : [];
        }
        c3.generate({
            bindto: '#'.concat(that.props.id),
            data: {
                type: that.props.chartType,
                json: that.props.data,
                keys: {
                    x: 'created_at',
                    value: ticketCategories
                },
                groups: stackingGroups
            },
            axis: {
                x: {
                    tick: {
                        format: function (x) {return new Date(x*1000).toLocaleDateString(); }
                    }
                }
            },
            bar: {
                width: {
                    ratio: 0.4
                }
            },
            grid: {
              y: {
                  show: false
              }
            },
            zoom: {
                enabled: that.props.zoomable
            },
            legend: {
                position: "right"
            }
        });
        return(
            <div id={this.props.id} className="c3-chart"></div>
        )
    }
});


var ZendeskHistory = React.createClass({
    getInitialState: function() {
        return {
            data: [],
            filteredData: [],
            stackable: true,
            zoomable: false,
            chartType: "area-spline"
        }
    },

    filterTicketsByDate: function() {
        var startDate = $("#start-date").val();
        var endDate = $("#end-date").val();
        this.setState({
            filteredData: this.state.data.filter(function(d) {
                if (startDate && endDate && !startDate.isWhiteString() && !endDate.isWhiteString()) {
                    return d.created_at*1000 >= new Date(startDate).getTime() && d.created_at*1000 <= new Date(endDate).getTime();
                }
                if (startDate && !startDate.isWhiteString()) {
                    return d.created_at*1000 >= new Date(startDate).getTime();
                }
                if (endDate && !endDate.isWhiteString()) {
                    return d.created_at*1000 <=new Date(endDate).getTime();
                }
                return d;
            })
        });
        return false;
    },

    componentDidMount: function() {
        $("#stack-check").attr("checked", true);
        $("#zoom-check").attr("checked", false);
        var that = this;
        $.ajax({
            url: "/api/zendesk_history",
            type: "GET",
            dataType: "json",
            success: function(response) {
                that.setState({data: response.data, filteredData: response.data});
                console.log(response);
            }
        })
    },

    handleStack: function() {
        this.setState({stackable: $('#stack-check').is(':checked')});
    },

    handleZoom: function() {
        this.setState({zoomable: $('#zoom-check').is(':checked')});
    },

    handleClearFilter: function() {
        $("#start-date").val("");
        $("#end-date").val("");
        this.filterTicketsByDate();
    },

    handleChartType: function() {
        this.setState({chartType: $("#chart-type").val()});
    },

    render: function() {
        var chartOptions = ["area-spline", "area-step",  "spline", "step", "area", "line", "bar"].map(function(c){
            return <option value={c}>{c.capitalize() + " Chart"}</option>;
        });

        return (<div>
            <form className="row" onSubmit={this.filterTicketsByDate}>
                <LongDatetimePicker size="2" placeHolder="start date" id="start-date" pickTime={false} format="MM-DD-YYYY"/>
                <LongDatetimePicker size="2" placeHolder="end date" id="end-date" pickTime={false} format="MM-DD-YYYY"/>
                <Col xs={1} sm={1} md={1}>
                    <Button bsSize="large" bsStyle="info" title="Query !" className="btn-circle" type="submit">{<Glyphicon glyph="filter"/>}</Button>
                </Col>
                <Col xs={2} sm={2} md={2}>
                    <Button bsSize="large" bsStyle="info" tilte="Clear Filter" className="btn-circle" onClick={this.handleClearFilter}>{<Glyphicon glyph="remove"/>}</Button>
                </Col>
                <Col xs={2} sm={2} md={2}>
                    <Input type="select" id="chart-type" onChange={this.handleChartType}>{chartOptions}</Input>
                </Col>
                <Col xs={1} sm={1} md={1}>
                    <Input type="checkbox" id="zoom-check" label="Zoomable" onChange={this.handleZoom}/>
                </Col>
                <Col xs={1} sm={1} md={1}>
                    <Input type="checkbox" id="stack-check" label="Stacked" onChange={this.handleStack}/>
                </Col>
            </form>
            <Row>
                <Col xs={12} sm={12} md={12}>
                    <c3Chart data={this.state.filteredData} stackable={this.state.stackable} zoomable={this.state.zoomable} chartType={this.state.chartType}/>
                </Col>
            </Row>
            <p className="chart-remark">Notes: <br/>
                &nbsp;&nbsp;- Legends are clickable to toggle visiblity by group<br/>
                &nbsp;&nbsp;- Filtering is prefered to zooming for finer granularity<br/>
                &nbsp;&nbsp;- Zooming/Dragging may be laggy in certain browsers
            </p>

        </div>)
    }
});
React.renderComponent(<ZendeskHistory />, document.getElementById('zendesk-history'));