/** @jsx React.DOM */

var d = new Date();
d.setDate(d.getDate() - 1);
var yesterday = d3.time.format("%m-%d-%Y")(d);

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
        console.log(this.props.filterStatus);
        var events = this.props.filterStatus !== "all" ?
            filterEvents(this.props.data.events, this.props.filterStatus)
            : this.props.data.events;
        var hoursMessage = debunkMarkdown(this.props.data.message);

        blocks.push(
            <div className="cd-timeline-summary">
                <div id="sleep-summary"><ModalTrigger modal={<SleepSummaryModal metrics={this.props.data.metrics} message={debunkMarkdown(this.props.data.message)} />}>
                    <a className="cursor-hand">Sleep Summary</a>
                </ModalTrigger></div>
                <hr/>
                <div id="hours-message">{hoursMessage}</div>
            </div>
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

            var svgIcon = "/static/image/timeline_events/" + timelinePNG(event.event_type);
            var currentEmailInput = $('#email-input').val();
            var start = d3.time.format("%m/%d/%Y %H:%M:%S")(new Date(new Date(event.timestamp - 5*60*1000).toUTCString().split("GMT")[0]));
            var end = d3.time.format("%m/%d/%Y %H:%M:%S")(new Date(new Date(event.timestamp + 5*60*1000).toUTCString().split("GMT")[0]));
            blocks.push(
                <div className="cd-timeline-block">
                    <div className={"cd-timeline-img " + timelineBackground(event.event_type)}>
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
                score_condition: "UNAVAILABLE",
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

    invalidateCache: function() {
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
            url: "/api/timeline",
            type: 'POST',
            data: requestData,
            dataType: 'json',
            success: function(response) {
                if (response.data === true) {
                    location.reload();
                }
            },
            error: function(e) {
                console.log(e);
            }
        });
        return false;
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
                console.log("algo", response);
                if (response.error.isWhiteString()) {
                    this.setState({algorithm: "Algorithm: " + response.data.algorithm});
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
        if (this.isAuthorized() === true) {
            this.retrieveTimelineData();
            this.getTimelineAlgorithm();
        }
        return false;
    },

    isAuthorized: function() {
        var that = this;
        // TODO: see pseudocode below
        // if user belongs to priority group:
        //    get_or_create admin-data-viewer (ADMIN_READ scope) token to see data
        // else:
        //    get_or_create timeline-viewer token (SLEEP_TIMELINE scope) to see data for that user only
        return true;
    },

    retrieveTimelineData: function() {
        var that = this;
        var emailInput = $('#email-input').val().trim();
        var dateInput = $('#date-input').val();

        var requestData = {
            email: emailInput,
            date: reformatDate(dateInput)
        };
        console.log('requestData', requestData);
        if (requestData.email.isWhiteString() || requestData.date.isWhiteString()) {
            return false;
        }

        that.setState(that.getInitialState());
        that.setState({alert: "Loading ..."});

        $.ajax({
            url: "/api/timeline_v2",
            type: 'GET',
            data: requestData,
            dataType: 'json',
            success: function(response) {
                console.log(response);
                if (response.error.isWhiteString()) {
                    that.setState({data: response.data, alert: ""});
                    $('.dial').val(response.data.score).trigger('change');
                    that.pushHistory(emailInput, dateInput);
                }
                else {
                    that.setState({
                        alert: response.error,
                        data: that.getInitialState().data
                    });
                }
            }.bind(that),
            error: function(e) {
                console.log(e);
            }.bind(that)
        });
        return false;
    },

    handleFilter: function() {
        this.setState({filterStatus: $('#filter-input').val()});
    },

    handleCanary: function() {
        this.retrieveTimelineData();
    },

    render: function() {
        var that = this;
        var timelineContent =
            (this.state.data.events.length === 0) ? null:
            <TimelineContent data={this.state.data} filterStatus={this.state.filterStatus}/>;

        var alertPanel = that.state.alert === "" ? null : <Alert byStyle="danger">{that.state.alert}</Alert>;
        var scoreBar = that.state.data.score !== -1 ? <Col id="score-bar" xs={12}>
                    <LongCircularBar score={this.state.data.score} />
                </Col>: null;
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
                        <option value="IN_BED">IN BED</option>
                        <option value="GENERIC_MOTION">GENERIC MOTION</option>
                        <option value="PARTNER_MOTION">PARTNER MOTION</option>
                        <option value="GENERIC_SOUND">GENERIC SOUND</option>
                        <option value="LIGHT">LIGHT</option>
                        <option value="LIGHTS_OUT">LIGHTS OUT</option>
                        <option value="GOT_IN_BED">GOT IN BED</option>
                        <option value="FELL_ASLEEP">FELL ASLEEP</option>
                        <option value="GOT_OUT_OF_BED">GOT OUT OF BED</option>
                        <option value="WOKE_UP">WOKE UP</option>
                        <option value="ALARM_RANG">ALARM RANG</option>
                    </Input>
                </Col>
                <Col xs={2}>
                    <Button><FileExporter fileContent={this.state.data} fileName="timeline"/></Button>
                </Col>
            </form>
            {alertPanel}
            <div>
                {this.state.algorithm}
            </div>
            {scoreBar}
            {timelineContent}
        </div>)
    }
});


React.renderComponent(<TimelineMaestro />, document.getElementById('timeline-canvas'));

function labelColor(eventType) {
    var assignColor = {
        IN_BED: "label-in-bed",
        GENERIC_MOTION: "label-generic-motion",
        PARTNER_MOTION: "label-partner-motion",
        GENERIC_SOUND: "label-generic-sound",
        SNORED: "label-snored",
        SLEEP_TALKED: "label-sleep-talked",
        LIGHT: "label-light",
        LIGHTS_OUT: "label-lights-out",
        SUNSET: "label-sunset",
        SUNRISE: "label-sunrise",
        GOT_IN_BED: "label-got-in-bed",
        FELL_ASLEEP: "label-fell-asleep",
        GOT_OUT_OF_BED: "label-got-out-of-bed",
        WOKE_UP: "label-woke-up",
        ALARM_RANG: "label-alarm-rang",
        UNKNOWN: "label-unknown"
    };
    return assignColor[eventType] || "label-no-event";
}

function timelinePNG(eventType) {
    var assignPNG = {
        IN_BED: "got_in_bed.png",
        GENERIC_MOTION: "generic_motion.png",
        PARTNER_MOTION: "partner_motion.png",
        GENERIC_SOUND: "generic_sound.png",
        SNORED: "unknown.png",
        SLEEP_TALKED: "unknown.png",
        LIGHT: "light.png",
        LIGHTS_OUT: "lights_out.png",
        SUNSET: "sunset.png",
        SUNRISE: "sunrise.png",
        GOT_IN_BED: "got_in_bed.png",
        FELL_ASLEEP: "fell_asleep.png",
        GOT_OUT_OF_BED: "got_out_of_bed.png",
        WOKE_UP: "woke_up.png",
        ALARM_RANG: "alarm_rang.png",
        UNKNOWN: "unknown.png"
    };
    return assignPNG[eventType] || "unknown.png";
}

function timelineBackground(eventType) {
    var assignBackground = {
        IN_BED: "timeline-in-bed",
        GENERIC_MOTION: "timeline-generic-motion",
        PARTNER_MOTION: "timeline-partner-motion",
        GENERIC_SOUND: "timeline-generic-sound",
        SNORED: "timeline-snored",
        SLEEP_TALKED: "timeline-sleep-talked",
        LIGHT: "timeline-light",
        LIGHTS_OUT: "timeline-lights-out",
        SUNSET: "timeline-sunset",
        SUNRISE: "timeline-sunrise",
        GOT_IN_BED: "timeline-got-in-bed",
        FELL_ASLEEP: "timeline-fell-asleep",
        GOT_OUT_OF_BED: "timeline-got-out-of-bed",
        WOKE_UP: "timeline-woke-up",
        ALARM_RANG: "timeline-alarm-rang",
        UNKNOWN: "timeline-unknown"
    };
    return assignBackground[eventType] || "timeline-unknown";
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
