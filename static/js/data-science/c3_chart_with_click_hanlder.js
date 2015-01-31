/** @jsx React.DOM */

var LabelDataForm =  React.createClass({
    getInitialState: function() {
        return {t1: "", t2: ""}
    },

    componentDidMount: function() {
        this.updateRangeInfo();
    },

    updateRangeInfo: function() {

        var dataSet = this.props.parent.props.data;
        var xAttr = this.props.parent.props.xAttr;
        var durationInMillisecond = Number($('#duration-input').val()) * 60*1000;

        console.log('me', xAttr, durationInMillisecond);

        this.setState({
            t1: d3.time.format('%b %d %H:%M:%S')(new Date(dataSet[this.props.labelStartIndex][xAttr])),
            t2: d3.time.format('%b %d %H:%M:%S')(new Date(dataSet[this.props.labelStartIndex][xAttr] + durationInMillisecond))
        });
    },

    handleLabel: function() {
        var that = this;
        var dataSet = that.props.parent.props.data;
        console.log(dataSet);
        var durationInMillisecond = Number($('#duration-input').val()) * 60*1000;
        var xAttr = that.props.parent.props.xAttr;
        var tzOffsetAttr = that.props.parent.props.tzOffsetAttr;

        var labelledData = dataSet.map(function(d, index){
            /*      This is for labeling massively, not used right now */
            //            if (index >= that.props.labelStartIndex && d[xAttr] <= dataSet[that.props.labelStartIndex][xAttr] + durationInMillisecond) {
            if (index === that.props.labelStartIndex) {
                return {
                    email: $('#email-input').val(),
                    label: $('#label-input').val(),
                    duration_millis: durationInMillisecond,
                    note: $('#notes-input').val(),
                    night: d3.time.format('%Y-%m-%d')(new Date(d[xAttr])),
                    ts_utc: d[xAttr],
                    tz_offset: d[tzOffsetAttr]
                }
            }
        }).filter(function(d){return d !== undefined});
        console.log(labelledData);
        $.ajax({
            url: "/api/label_data",
            dataType: 'json',
            type: 'POST',
            data: JSON.stringify(labelledData),
            success: function(response) {
                console.log(response);
                that.props.onRequestHide();
                if (response.status === 204 || response.status === 200) {
                    that.props.parent.setState({labelStatus: "Successfully labelled \n" + JSON.stringify(labelledData, undefined, 2)});
                }
                else {
                    that.props.parent.setState({labelStatus: "Failed to label \n" + JSON.stringify(labelledData, undefined, 2) + "\nError: "  + response.error});
                }
            }
        });
    },
    render: function() {
        return this.transferPropsTo(
            <Modal pra title={"Label data between " + this.state.t1 + " and " + this.state.t2 + "(Pacific time)"}>
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
                    <Input id="duration-input" type="text" onChange={this.updateRangeInfo} placeholder="Enter duration in minutes"/>
                    <Input id="notes-input" type="text" placeholder="Leave a remark (optional)"/>
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
            labelStatus: "",
            labelStartIndex: 0
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
                    that.setState({labelStartIndex: arguments[0].index});
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
            <ModalTrigger modal={<LabelDataForm parent={that} labelStartIndex={that.state.labelStartIndex} />}>
                <Button id="modal-trigger" bsStyle="primary">Label Data</Button>
            </ModalTrigger>
            <div id={this.props.id} className="c3-chart"></div>
            {alert}
        </div>)
    }
});