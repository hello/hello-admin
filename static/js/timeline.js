/** @jsx React.DOM */

var d = new Date();
d.setDate(d.getDate() - 1);
var yesterday = d3.time.format("%m-%d-%Y")(d);

var TimelineContent = React.createClass({
    render: function() {
        var blocks = [];
        if (this.props.data.length > 0) {
            var segments = this.props.filterStatus !== "all" ?
                filterEvents(this.props.data[0].segments, this.props.filterStatus)
                : this.props.data[0].segments;
            var hoursMessage = this.props.data[0].message;

            blocks.push(<h1 id="hours-message">{hoursMessage}</h1>);

            segments.forEach(function(segment) {
                var date = <h2 className="event-date"><LongLabel bsStyle={labelColor(segment.event_type)} content={segment.id}/> {new Date(segment.timestamp + segment.offset_millis).toUTCString().replace("GMT", "  (User local timezone offset is " + (segment.offset_millis/3600000).toString() + " hours)")}</h2>;

                var message = <span className="cd-date">Message: <span className="event-message">{segment.message || "No message!"}</span></span>;

                var duration = <p>Duration: <span>{segment.duration}</span></p>;

                var sensors = (!segment.sensors || segment.sensors.length === 0) ?
                    null:
                    <p>Sensors: <span>{segment.sensors}</span></p>;

                var sleepDepth = <p>Sleep depth: <span>{segment.sleep_depth}</span></p>;

                var sound = (!segment.sound || segment.sound === null) ?
                    null:
                    <p>Sound: <span>{segment.sound}</span></p>;

                var svgIcon = "/static/css/svg/" + timelineSVG(segment.event_type);
                var currentEmailInput = $('#email-input').val();
                var currentDateInput = $('#date-input').val().replace(/\-/g, '/');
                var start = currentDateInput + " 12:00:01 AM";
                var end = currentDateInput + " 11:59:59 PM";
                blocks.push(
                    <div className="cd-timeline-block">
                        <div className={"cd-timeline-img " + timelineBackground(segment.event_type)}>
                            <img src={svgIcon} alt="Picture"/>
                        </div>

                        <div className="cd-timeline-content">
                            {date}
                            {duration}
                            {sensors}
                            {sleepDepth}
                            {sound}
                            <a href={"/sense_logs/?devices=" + currentEmailInput + "&start=" +  start + "&end=" + end + "&max_docs=100"}
                               target="_blank" className="cd-read-more">See debug log</a>
                            {message}
                        </div>
                    </div>
                );
            });
        }

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
            data: [{
                message: "",
                score: 0,
                insights: [],
                statistics: {},
                date: "",
                segments: []
            }],
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

    updateScore: function() {
        $(".dial").val(27).trigger('change');
    },

    submitWithInputsfromURL: function() {
        var emailInputFromURL = getParameterByName('email');
        var dateInputFromURL = getParameterByName('date');
        if (emailInputFromURL.isWhiteString() || dateInputFromURL.isWhiteString()) {
            return false;
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
        history.pushState({}, '', '/timeline/?email=' + email + '&date=' + date);
    },

    handleSubmit: function() {
        if (this.isAuthorized() === true) {
            this.retrieveTimelineData();
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
            type: 'GET',
            data: requestData,
            dataType: 'json',
            success: function(response) {
                console.log(response);
                if (response.error.isWhiteString()) {
                    that.setState({data: response.data, alert: ""});
                    $('.dial').val(response.data[0].score).trigger('change');
                    that.pushHistory(emailInput, dateInput);
                }
                else {
                    that.setState({
                        alert: response.error,
                        data: [{
                            message: "",
                            score: 0,
                            insights: [],
                            statistics: {},
                            date: "",
                            segments: []
                        }]
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

    render: function() {
        var that = this;
        var timelineContent =
            (this.state.data[0] && this.state.data[0].segments && this.state.data[0].segments.length === 0) ? null:
            <TimelineContent data={this.state.data} filterStatus={this.state.filterStatus}/>;

        var insights = this.state.data[0].insights.map(function(i){return i.message}).join("<br/>");
        var insightsPanel = insights.length === 0 ? null :
            <Alert bsStyle="warning"><span className="insights" dangerouslySetInnerHTML={{__html: insights}}/></Alert>;
        var stats = this.state.data[0].statistics && this.state.data[0].statistics !== {} ? Object.keys(this.state.data[0].statistics).map(function(k){return k + " : " + that.state.data[0].statistics[k]}).join("<br/>"): that.state.data[0].message;
        var statsPanel = stats.length === 0 ? null :
            <Alert bsStyle="success"><span className="insights" dangerouslySetInnerHTML={{__html: stats}}/></Alert>;
        var alertPanel = that.state.alert === "" ? null : <Alert byStyle="danger">{that.state.alert}</Alert>;
        var scoreBar = that.state.data[0].score !== 0 ? <Col id="score-bar" xs={2} sm={2} md={2} lg={2} xl={2}>
                    <LongCircularBar score={this.state.data[0].score} />
                </Col>: null;
        return(<code className="nonscript">
            <form onSubmit={this.handleSubmit} className="row">
                <LongDatetimePicker size="2" placeHolder="date" id="date-input" pickTime={false} format="MM-DD-YYYY" defaultDate={yesterday} />
                <Col xs={3} md={3}>
                    <Input id="email-input" type="text" addonBefore={<Glyphicon glyph="user"/>} placeholder="user email" />
                </Col>
                <Col xs={2} md={2}>
                    <Button bsStyle="info" type="submit">{<Glyphicon glyph="search"/>}</Button>
                </Col>
                <Col xs={3} md={3}>
                    <Input id="filter-input" addonBefore={<Glyphicon glyph="filter"/>} type="select" onChange={this.handleFilter}>
                        <option value="key_events" selected>Key events only</option>
                        <option value="SUNRISE">Sunrise only</option>
                        <option value="MOTION">Motion only</option>
                        <option value="LIGHTS_OUT">Lights out only</option>
                        <option value="LIGHT">Light only</option>
                        <option value="SLEEPING">Sleeping only</option>
                        <option value="all">All raw data</option>
                    </Input>
                </Col>
                <Col xs={1} sm={1} md={1} lg={1} xl={1}>
                    <Button bsStyle="default" onClick={this.invalidateCache}><Glyphicon glyph="remove"/> Cache</Button>
                </Col>
            </form>
            {alertPanel}
            <Row id="insights-info">
                <Col xs={3} sm={3} md={3} lg={3} xl={3} xsOffset={2} mdOffset={2} smOffset={2} lgOffset={2} xlOffset={2}>{statsPanel}</Col>
                {scoreBar}
                <Col xs={4} md={4} sm={4} lg={4} xl={4}>{insightsPanel}</Col>
            </Row>
            {timelineContent}
        </code>)
    }
});


React.renderComponent(<TimelineMaestro />, document.getElementById('timeline-canvas'));

function labelColor(eventType) {
    var assignColor = {
        SUNRISE: "label-sunrise",
        WAKE_UP: "label-wakeup",
        MOTION: "label-motion",
        SLEEP: "label-sleep",
        LIGHTS_OUT: "label-lights-out",
        LIGHT: "label-light",
        IN_BED: "label-in-bed",
        SLEEPING: "label-sleeping",
        OUT_OF_BED: "label-out-of-bed",
        ALARM: "label-alarm"
    };
    return assignColor[eventType] || "label-no-event";
}

function timelineSVG(eventType) {
    var assignSVG = {
        SUNRISE: "sunrise.svg",
        WAKE_UP: "wake_up.svg",
        MOTION: "motion.svg",
        SLEEP: "sleep.svg",
        LIGHTS_OUT: "lights_out.svg",
        LIGHT: "light.svg",
        IN_BED: "in_bed.svg",
        SLEEPING: "sleeping.svg",
        OUT_OF_BED: "out_of_bed.svg",
        ALARM: "alarm.svg"
    };
    return assignSVG[eventType] || "unknown.svg";
}

function timelineBackground(eventType) {
    var assignBackground = {
        SUNRISE: "timeline-sunrise",
        WAKE_UP: "timeline-wakeup",
        MOTION: "timeline-motion",
        SLEEP: "timeline-sleep",
        LIGHTS_OUT: "timeline-lights-out",
        LIGHT: "timeline-light",
        IN_BED: "timeline-in-bed",
        SLEEPING: "timeline-sleeping",
        OUT_OF_BED: "timeline-out-of-bed",
        ALARM: "timeline-alarm"
    };
    return assignBackground[eventType] || "timeline-no-event";
}

function filterEvents(segments, type) {
    return segments.filter(function(s){
        if (type === "key_events"){
            return  ["LIGHTS_OUT", "IN_BED", "SLEEP", "WAKE_UP", "OUT_OF_BED", "ALARM", "MOTION"].indexOf(s.event_type) > -1
        }
        else {
            return s.event_type === type;
        }
    });
}

function reformatDate(dateString) {
    var dateComponents = dateString.split("-");
    var year = dateComponents[2];
    var month = dateComponents[0];
    var date = dateComponents[1];
    return [year, month, date].join("-");
}

function extractAlert(insight) {
    return insight.condition == "ALERT" || insight.conditionClass == "WARNING";
}

function extractIdeal(insight) {
    return insight.condition === "IDEAL";
}