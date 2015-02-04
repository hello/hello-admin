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
            console.log(segments);

            segments.forEach(function(segment) {
                var date = <h2 className="event-date"><LongLabel bsStyle={labelColor(segment.event_type)} content={segment.id}/> {getLocalDateFromUTCEpoch(segment.timestamp/1000, false)}</h2>;

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
                            <a href={"/debug_log/?devices=" + currentEmailInput + "&start=" +  start + "&end=" + end + "&max_docs=100"}
                               target="_blank" className="cd-read-more">See debug log</a>
                            {message}
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
                console.log(response);
                that.setState({data: response.data});
                $('.dial').val(response.data[0].score).trigger('change');
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
        var negMessages = this.state.data[0].insights.filter(function(i){return i.condition == "WARNING" || i.conditionClass == "ALERT";}).map(function(i){return i.message}).join("<br/><br/>");
        var negInsights = (negMessages.length === 0) ? null:
            <Alert bsStyle="warning"><span className="insights" dangerouslySetInnerHTML={{__html: negMessages}}/></Alert>;

        var posMessages = this.state.data[0].insights.filter(function(i){return i.condition == "IDEAL"}).map(function(i){return i.message}).join("<br/>");
        var posInsights = (posMessages.length === 0) ? null:
            <Alert bsStyle="success"><span className="insights" dangerouslySetInnerHTML={{__html: posMessages}}/></Alert>;

        return(<code className="nonscript">
            <form onSubmit={this.handleSubmit} className="row">
                <LongDatetimePicker size="3" placeHolder="date" id="date-input" pickTime={false} format="MM-DD-YYYY" defaultDate={yesterday} />
                <Col xs={3} md={3}>
                    <Input id="email-input" type="text" addonBefore={<Glyphicon glyph="user"/>} placeholder="user email" />
                </Col>
                <Col xs={2} md={2}>
                    <Button bsStyle="info" type="submit">{<Glyphicon glyph="search"/>}</Button>
                </Col>
                <Col xs={3} md={3}>
                    <Input id="filter-input" addonBefore={<Glyphicon glyph="filter"/>} type="select" onChange={this.handleFilter}>
                        <option value="events" selected>Events only</option>
                        <option value="SUNRISE">Sunrise only</option>
                        <option value="WAKE_UP">Wake-Up only</option>
                        <option value="MOTION">Motion only</option>
                        <option value="SLEEP">Sleep only</option>
                        <option value="LIGHTS_OUT">Lights out only</option>
                        <option value="LIGHT">Light only</option>
                        <option value="IN_BED">In bed only</option>
                        <option value="SLEEPING">Sleeping only</option>
                        <option value="OUT_OF_BED">Out of bed only</option>
                        <option value="all">All data</option>
                    </Input>
                </Col>
            </form>
            <Row id="insights-info">
                <Col xs={3} sm={3} md={3} lg={3} xl={3} xsOffset={2} mdOffset={2} smOffset={2} lgOffset={2} xlOffset={2}>{negInsights}</Col>
                <Col id="score-bar" xs={2} sm={2} md={2} lg={2} xl={2}>
                    <LongCircularBar score={this.state.data[0].score} />
                </Col>
                <Col xs={3} md={3} sm={3} lg={3} xl={3}>{posInsights}</Col>
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
        OUT_OF_BED: "label-out-of-bed"
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
        OUT_OF_BED: "out_of_bed.svg"
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
        OUT_OF_BED: "timeline-out-of-bed"
    };
    return assignBackground[eventType] || "timeline-no-event";
}

function filterEvents(segments, type) {
    return segments.filter(function(s){
        if (type === "events") {
            return s.event_type !== "";
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