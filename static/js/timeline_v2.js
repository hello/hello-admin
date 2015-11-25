/** @jsx React.DOM */

var d = new Date();
d.setDate(d.getDate() - 1);
var yesterday = d3.time.format("%m-%d-%Y")(d);

var SLEEP_EVENTS = [
    "GENERIC_MOTION",
    "PARTNER_MOTION",
    "GENERIC_SOUND",
    "LIGHT",
    "LIGHTS_OUT",
    "GOT_IN_BED",
    "FELL_ASLEEP",
    "GOT_OUT_OF_BED",
    "WOKE_UP",
    "ALARM_RANG"
];

var SleepSummaryModal = React.createClass({
    render: function() {
        return <Modal animation={true}>
            <div className='modal-body'>
                <div className="modal-title">Sleep Summary</div>
                <div className="modal-subtitle">{this.props.message}</div>
                <br/>
                <Table>
                    <tbody>{
                        this.props.metrics.map(function(m){
                            var value, unit;
                            if (m.name === "time_to_sleep") {
                                value = m.value;
                                unit = "m";
                            }
                            else if (m.name === "times_awake") {
                                value = m.value;
                                unit = "";
                            }
                            else if (m.name === "total_sleep" || m.name === "sound_sleep") {
                                value = (m.value / 60).toFixed(1);
                                unit = "h"
                            }
                            else if (m.name === "fell_asleep" || m.name === "woke_up") {
                                value = new Date(m.value).toString();
                                unit = "";
                            }
                            else {
                                var conditionFriendlies = {
                                    IDEAL: "just right",
                                    WARNING: "not ideal",
                                    ALERT: "uncomfortable"
                                };
                                value = conditionFriendlies[m.condition] || "--";
                                unit = "";
                            }

                            return <tr>
                                <td className="modal-condition-name">{m.name.replace(/_/g, " ")}</td>
                                <td className={"modal-condition-" + m.condition.toLowerCase()}><span>{value}</span> <span>{unit}</span></td>
                            </tr>
                        })

                    }<tr><td/><td/></tr></tbody>
                </Table>
            </div>
            <div className='modal-footer'>
                <Button className="btn-round" onClick={this.props.onRequestHide}>X</Button>
            </div>
        </Modal>;
    }
});

var TimelineContent = React.createClass({
    render: function() {
        var blocks = [];
        var events = this.props.filterStatus !== "all" ?
            filterEvents(this.props.data.events, this.props.filterStatus)
            : this.props.data.events;
        var hoursMessage = debunkMarkdown(this.props.data.message);

        blocks.push(
            <ModalTrigger modal={<SleepSummaryModal metrics={this.props.data.metrics} message={debunkMarkdown(this.props.data.message)} />}>
                <div className="cd-timeline-summary cursor-hand">
                    <div id="sleep-summary">
                        <a>Sleep Summary</a>
                    </div>
                    <hr/>
                    <div className="summary-message">{hoursMessage}</div>
                    <div className="summary-message">{this.props.algorithm}</div>
                </div>
            </ModalTrigger>
        );

        events.forEach(function(event, i) {
            var date = <div className="event-date">{new Date(event.timestamp + event.timezone_offset).toUTCString().replace("GMT", "  (User local timezone offset is " + (event.timezone_offset/3600000).toString() + " hours)")}</div>;

            var message = <span className="cd-date"><span className="event-message"> Message: {event.message}</span></span>;

            var eventType = <p className="event-type">Event Type: <em>{event.event_type}</em></p>;

            var duration = <p className="event-duration">Duration: <span>{event.duration_millis}</span></p>;

            var sleepDepth = <p className="event-sleep-depth">Sleep Depth: <span>{event.sleep_depth}</span></p>;

            var sensors = (!event.sensors || event.sensors.length === 0) ?
                null:
                <p>Sensors: <span>{event.sensors}</span></p>;

            var sound = (!event.sound || event.sound === null) ?
                null:
                <p>Sound: <span>{event.sound}</span></p>;

            var svgIcon = "/static/image/timeline_events/" + getTimelinePNG(event.event_type);
            blocks.push(
                <div className="cd-timeline-block">
                    <div className="cd-timeline-img">
                        <img src={svgIcon} alt="Picture"/>
                    </div>

                    <div className="cd-timeline-content">
                        {date}
                        {eventType}
                        {duration}
                        {sensors}
                        {sleepDepth}
                        {sound}
                        {message}
                    </div>
                </div>
            );
        });
        return (<Col xl={6} xlOffset={3} lg={8} lgOffset={2} md={8} mdOffset={2} sm={12} xs={12}>
            <section id="cd-timeline" class="cd-container">
                {blocks}
            </section>
        </Col>)
    }
});
var TimelineMaestro = React.createClass({
    getInitialState: function() {
        return {
            data: {
                events: [],
                score_condition: "",
                date: "2015-09-04",
                score: -1,
                message: "There was no sleep data recorded for this night.",
                metrics: [],
                algorithm: ""
            },
            filterStatus: "key_events",
            alert: ""
        };
    },

    populateTimeline: function() {
        var $timeline_block = $('.cd-timeline-block');

        //hide timeline blocks which are outside the viewport
        $timeline_block.each(function(){
            if($(this).offset().top > $(window).scrollTop()+$(window).height()*0.75) {
                $(this).find('.cd-timeline-img, .cd-timeline-content').addClass('is-hidden');
            }
        });

        //on scolling, show/animate timeline blocks when enter the viewport
        $(window).on('scroll', function(){
            $timeline_block.each(function(){
                if( $(this).offset().top <= $(window).scrollTop()+$(window).height()*0.75 && $(this).find('.cd-timeline-img').hasClass('is-hidden') ) {
                    $(this).find('.cd-timeline-img, .cd-timeline-content').removeClass('is-hidden').addClass('bounce-in');
                }
            });
        });
    },

    getTimelineAlgorithm: function() {
        var emailInput = $('#email-input').val();
        var dateInput = $('#date-input').val();
        var requestData = {
            email: emailInput,
            date: reformatDate(dateInput)
        };

        if (requestData.email.isWhiteString() || requestData.date.isWhiteString()) {
            return false;
        }

        $.ajax({
            url: "/api/timeline_algorithm",
            type: 'GET',
            data: requestData,
            dataType: 'json',
            success: function(response) {
                if (response.error.isWhiteString()) {
                    this.setState({algorithm: "Applied algorithm was " + response.data.algorithm});
                }
            }.bind(this),
            error: function(e) {
                console.log(e);
            }.bind(this)
        });
        return false;
    },

    updateScore: function() {
        $(".dial").val(27).trigger('change');
    },

    submitWithInputsfromURL: function() {
        var emailInputFromURL = getParameterByName('email');
        var dateInputFromURL = getParameterByName('date');
        if (emailInputFromURL.isWhiteString()) {
            return false;
        }
        if (dateInputFromURL.isWhiteString()) {
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate()-1);
            dateInputFromURL = d3.time.format("%m-%d-%Y")(yesterday);
        }
        $('#email-input').val(emailInputFromURL);
        $('#date-input').val(dateInputFromURL);

        this.handleSubmit();
    },

    componentDidMount: function() {
        this.populateTimeline();
        this.submitWithInputsfromURL();
        $('.dial').knob(
            {
                "min":0,
                "max":100,
                "width": "80",
                "readOnly": true,
                "thickness": ".2",
                "bgColor": "green"
            }
        );
    },

    pushHistory: function(email, date) {
        history.pushState({}, '', '/timeline_v2/?email=' + email + '&date=' + date);
    },

    handleSubmit: function() {
        this.retrieveTimelineData();
        this.getTimelineAlgorithm();
        return false;
    },

    retrieveTimelineData: function() {
        var emailInput = $('#email-input').val().trim();
        var dateInput = $('#date-input').val();

        var requestData = {
            email: emailInput,
            date: reformatDate(dateInput)
        };
        if (requestData.email.isWhiteString() || requestData.date.isWhiteString()) {
            return false;
        }

        this.setState(this.getInitialState());
        this.setState({alert: "Loading ..."});

        $.ajax({
            url: "/api/timeline_v2",
            type: 'GET',
            data: requestData,
            dataType: 'json',
            success: function(response) {
                console.log(response);
                if (response.error.isWhiteString()) {
                    this.setState({data: response.data, alert: ""});
                    $('.dial').val(response.data.score).trigger('change');
                    this.pushHistory(emailInput, dateInput);
                }
                else {
                    this.setState({
                        alert: response.error,
                        data: this.getInitialState().data
                    });
                }
            }.bind(this),
            error: function(e) {
                console.log(e);
            }.bind(this)
        });
        return false;
    },

    handleFilter: function() {
        this.setState({filterStatus: $('#filter-input').val()});
    },

    handleCanary: function() {
        this.retrieveTimelineData();
    },

    getScoreBar: function() {
        switch(this.state.data.score_condition) {
            case this.getInitialState().data.score_condition:
                return null;
            case "UNAVAILABLE":
                return <Alert>{this.state.data.message}</Alert>;
            case "INCOMPLETE":
                return <Alert>{this.state.data.message}</Alert>;
            default:
                return <Col id="score-bar" xs={12}>
                    <LongCircularBar score={this.state.data.score} />
                </Col>;
        }
    },

    render: function() {
        var timelineContent =
            (this.state.data.events.length === 0) ? null:
            <TimelineContent data={this.state.data} filterStatus={this.state.filterStatus} algorithm={this.state.algorithm}/>;

        var alertPanel = this.state.alert === "" ? null : <Alert byStyle="danger">{this.state.alert}</Alert>;

        return(<div>
            <form onSubmit={this.handleSubmit} className="row">
                <LongDatetimePicker size="2" placeHolder="date" id="date-input" pickTime={false} format="MM-DD-YYYY" defaultDate={yesterday} />
                <Col xs={3} md={3}>
                    <Input id="email-input" type="text" addonBefore={<Glyphicon glyph="user"/>} placeholder="user email" />
                </Col>
                <Col xs={1} md={1}>
                    <Button bsStyle="info" type="submit">{<Glyphicon glyph="search"/>}</Button>
                </Col>
                <Col xs={3} md={3}>
                    <Input id="filter-input" addonBefore={<Glyphicon glyph="filter"/>} type="select" onChange={this.handleFilter}>
                        <option value="key_events">Key Events</option>
                        <option value="all">All Events</option>
                        {SLEEP_EVENTS.map(function(se){
                            return <option value={se}>{se.replace(/_/g, " ")}</option>;
                        })}   
                    </Input>
                </Col>
                <Col xs={2}>
                    <Button><FileExporter fileContent={this.state.data} fileName="timeline"/></Button>
                </Col>
            </form>
            {alertPanel}
            {this.getScoreBar()}
            {timelineContent}
        </div>)
    }
});


React.renderComponent(<TimelineMaestro />, document.getElementById('timeline-canvas'));

function getTimelinePNG(eventType) {
    return eventType.toLowerCase() + ".png" || "unknown.png";
}

function filterEvents(events, type) {
    if (type === "key_events") {
        return events.filter(function(s){
            return s.event_type !== "IN_BED";
        })
    }
    return events.filter(function(s){
        return s.event_type === type;
    });
}

function reformatDate(dateString) {
    var dateComponents = dateString.split("-");
    var year = dateComponents[2];
    var month = dateComponents[0];
    var date = dateComponents[1];
    return [year, month, date].join("-");
}

function debunkMarkdown(md) {
    var partials = md.match(/(.*?)(\*\*)(.*?)(\*\*)(.*?),(.*)/);
    if (!partials) {
        return <span/>
    }
    return <span>{partials[1]}<span className="stress">{partials[3]}</span>{partials[5] + ", " + partials[6]}</span>;
}