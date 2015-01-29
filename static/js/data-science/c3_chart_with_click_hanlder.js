/** @jsx React.DOM */

var LabelDataForm =  React.createClass({
    handleLabel: function() {
        var that = this;
        var postData = JSON.parse($('#modal-post').val());
        postData.label = $('#label-input').val();
        var labeledData = JSON.stringify(postData);
        $.ajax({
            url: "/api/label_data",
            dataType: 'json',
            type: 'POST',
            data: labeledData,
            success: function(response) {
                console.log(response);
                that.props.onRequestHide();
                if (response.status === 204) {
                    that.props.parent.setState({labelStatus: "Successfully labelled " + labeledData});
                }
                else {
                    that.props.parent.setState({labelStatus: "Failed to label " + labeledData + "\nError: "  + response.error});
                }
            }
        });
    },
    render: function() {
        return this.transferPropsTo(
            <Modal pra title="Label data">
                <div className="modal-body">
                    <Input id="label-input" type="select">
                        <option value="none">Select a label</option>
                        <option value="make_bed">Make Bed</option>
                        <option value="went_to_bed">Went To Bed</option>
                        <option value="fall_asleep">Fall Asleep</option>
                        <option value="awake">Awake</option>
                        <option value="out_of_bed">Out Of Bed</option>
                        <option value="awake_in_bed">Awake In Bed</option>
                        <option value="sound_disturbance">Sound Disturbance</option>
                        <option value="got_up_at_night">Got Up At Night</option>
                        <option value="other_disturbance">Other Disturbance</option>
                    </Input>
                </div>
                <div className="modal-footer">
                    <Button onClick={this.handleLabel}>POST <Glyphicon glyph="send"/></Button>
                    <Button onClick={this.props.onRequestHide}>Close</Button>
                    <p/>
                </div>
            </Modal>
        );
    }
});

var C3BaseChartWithClickHandler = React.createClass({
    getInitialState: function() {
        return {
            labelStatus: ""
        }
    },
    getDefaultProps: function() {
        return {
            id: "c3-chart",
            data: [],
            chartType: "spline",
            stackable: false,
            xAttr: "datetime",
            tzOffsetAttr: "offset_millis",
            axis: {
                x: {
                    tick: {
//                        format: function (x) { return d3.time.format('%b %d %H:%M')(new Date(x)); }
                        format: function (x) {return x}
                    },
                    label: {
                        text: "x-axis",
                        position: 'outer-center'
                    }
                },
                y: {
                    label: {
                        text: "y-axis",
                        position: 'outer-middle'
                    }
                },
                y2: {
                    show: false,
                    label: {
                        text: "y2-axis",
                        position: 'outer-middle'
                    }
                }
            },
            bar:  {
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
                enabled: false
            },
            legend: {
                position: "right"
            },
            colors: {}
        }
    },
    render: function() {
        var that = this, categories = [], stackingGroups = [];
        if (that.props.data !== [] && that.props.data.last()) {
            categories = ['value'];
            stackingGroups = that.props.stackable === true ? [categories] : [];
        }
        c3.generate({
            bindto: '#'.concat(that.props.id),
            data: {
                type: that.props.chartType,
                json: that.props.data,
                keys: {
                    x: that.props.xAttr || 'datetime',
                    value: categories
                },
                groups: stackingGroups,
                colors: that.props.colors,
                onclick: function() {
                    console.log(arguments);
                    console.log(that.props.data[arguments[0].index]);
                    var clickedDataPoint = that.props.data[arguments[0].index];
                    postData = {
                        "email": $('#email-input').val(),
                        "night": d3.time.format('%Y-%m-%d')(new Date(clickedDataPoint[that.props.xAttr])),
                        "ts_utc": clickedDataPoint[that.props.xAttr],
                        "tz_offset": clickedDataPoint[that.props.tzOffsetAttr]
                    };
                    $('#modal-post').val(JSON.stringify(postData));
                    $('#modal-trigger').click();

                },
                selection: {
                    draggable: true
                },
                ondragstart: function() {alert('dragstart');},
                ondragend: function() {alert('dragend');}
            },
            axis: that.props.axis,
            bar: that.props.bar,
            grid: that.props.grid,
            zoom: that.props.zoom,
            legend: that.props.legend
        });
        var alert = that.state.labelStatus.isWhiteString() ? null : <Alert>{that.state.labelStatus}</Alert>;
        return(<div>
            <ModalTrigger modal={<LabelDataForm parent={that} />}>
                <Button id="modal-trigger" bsStyle="primary">Label Data</Button>
            </ModalTrigger>
            <Input id="modal-post" type="text"/>
            <div id={this.props.id} className="c3-chart"></div>
            {alert}
        </div>)
    }
});