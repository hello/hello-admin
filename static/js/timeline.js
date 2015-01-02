/** @jsx React.DOM */

var TimelineContent = React.createClass({
    render: function() {
        var blocks = [];
        if (this.props.data.length > 0) {
            var segments = this.props.filterStatus !== "all" ?
                filterEvents(this.props.data[0].segments, this.props.filterStatus)
                : this.props.data[0].segments;
            console.log(segments);

            segments.forEach(function(segment) {
                var event = (!segment.event_type || segment.event_type.isWhiteString() === true) ?
                    <h2><LongLabel bsStyle={labelColor(segment.event_type)} content={segment.id}/> No event</h2>
                    : <h2><LongLabel bsStyle={labelColor(segment.event_type)} content={segment.id}/> {segment.event_type}</h2>;

                var message = (!segment.message || segment.message.isWhiteString() === true) ?
                    null
                    : <p>Message: <span>{segment.message}</span></p>;

                var duration = <p>Duration: <span>{segment.duration}</span></p>;

                var sensors = (!segment.sensors || segment.sensors.length === 0) ?
                    null:
                    <p>Sensors: <span>{segment.sensors}</span></p>;

                var sleepDepth = <p>Sleep depth: <span>{segment.sleep_depth}</span></p>;

                var sound = (!segment.sound || segment.sound === null) ?
                    null:
                    <p>Sound: <span>{segment.sound}</span></p>;

                var date = <span className="cd-date">{getLocalDateFromUTCEpoch(segment.timestamp/1000, false)}</span>;
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
                            {event}
                            {message}
                            {duration}
                            {sensors}
                            {sleepDepth}
                            {sound}
                            <a href={"/debug_log/?devices=" + currentEmailInput + "&start=" +  start + "&end=" + end + "&max_docs=100"}
                               target="_blank" className="cd-read-more">See debug log</a>
                            {date}
                        </div>
                    </div>
                );
            });
        }
        return (<div className="col-xl-6 col-xl-offset-3 col-lg-8 col-lg-offset-2 col-md-8 col-md-offset-2 col-sm-12 col-xs-12">
            <section id="cd-timeline" class="cd-container">
                {blocks}
            </section>
        </div>)
    }
});
var TimelineMaestro = React.createClass({
    getInitialState: function() {
        return {
            data: [{
                message: "",
                score: 0,
                insights: [],
                date: "",
                segments: []
            }],
            filterStatus: "events"
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
    },

    pushHistory: function(email, date) {
        history.pushState({}, '', '/timeline/?email=' + email + '&date=' + date);
    },

    handleSubmit: function() {
        var that = this;
        var emailInput = $('#email-input').val();
        var dateInput = $('#date-input').val();
        var requestData = {
            email: emailInput,
            date: reformatDate(dateInput)
        };

        console.log(requestData);

        if (requestData.email.isWhiteString() || requestData.date.isWhiteString()) {
            return false;
        }

        $.ajax({
            url: "/api/timeline",
            type: 'GET',
            data: requestData,
            dataType: 'json',
            success: function(response) {
                that.setState({data: response.data});
                that.pushHistory(emailInput, dateInput);
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
        var timelineContent = (this.state.data[0].segments.length === 0) ?
            null:
            <TimelineContent data={this.state.data} filterStatus={this.state.filterStatus}/>;
        return(<code className="nonscript">
            <form onSubmit={this.handleSubmit} className="row">
                <LongDatetimePicker size="3" placeHolder="date" id="date-input" pickTime={false} format="MM-DD-YYYY" defaultDate="12-21-2014" />
                <Col xs={3} md={3}>
                    <Input id="email-input" type="text" addonBefore={<Glyphicon glyph="user"/>} placeholder="user email" />
                </Col>
                <Col xs={2} md={2}>
                    <Button bsStyle="info" type="submit">{<Glyphicon glyph="search"/>}</Button>
                </Col>
                <Col xs={3} md={3}>
                    <Input id="filter-input" addonBefore={<Glyphicon glyph="filter"/>} type="select" onChange={this.handleFilter}>
                        <option value="events" selected>Events only</option>
                        <option value="sunrise">Sunrise only</option>
                        <option value="wakeup">Wake-Up only</option>
                        <option value="motion">Motion only</option>
                        <option value="sleep">Sleep only</option>
                        <option value="lights_out">Lights out only</option>
                        <option value="all">All data</option>
                    </Input>
                </Col>
            </form>
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
        LIGHTS_OUT: "label-lights-out"
    };
    return assignColor[eventType] || "label-no-event";
}

function timelineSVG(eventType) {
    var assignSVG = {
        SUNRISE: "sunrise.svg",
        WAKE_UP: "wake_up.svg",
        MOTION: "motion.svg",
        SLEEP: "sleep.svg",
        LIGHTS_OUT: "lights_out.svg"
    };
    return assignSVG[eventType] || "unknown.svg";
}

function timelineBackground(eventType) {
    var assignBackground = {
        SUNRISE: "timeline-sunrise",
        WAKE_UP: "timeline-wakeup",
        MOTION: "timeline-motion",
        SLEEP: "timeline-sleep",
        LIGHTS_OUT: "timeline-lights-out"
    };
    return assignBackground[eventType] || "timeline-no-event";
}

function filterEvents(segments, type) {
    var mapType = {
        sunrise: "SUNRISE",
        wakeup: "WAKE_UP",
        motion: "MOTION",
        sleep: "SLEEP",
        lights_out: "LIGHTS_OUT"
    };
    return segments.filter(function(s){
        if (type === "events") {
            return s.event_type !== "";
        }
        else {
            return s.event_type === mapType[type];
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

