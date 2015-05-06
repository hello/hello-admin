/** @jsx React.DOM */

var deviceTimezoneMap = {};
var LogTable = React.createClass({
    getInitialState: function() {
        return {timezone: "browser"};
    },

    searchAroundByTs: function(e) {
        clickedTs = new Date($(e.target).text()).getTime();
        $('#start-time').val(dateTimePickerStringFormat(clickedTs - 5*60*1000));
        $('#end-time').val(dateTimePickerStringFormat(clickedTs + 5*60*1000));
        $('#text-input').val("");
        $('#submit').click().focus();
    },

    getDeviceTimezone: function(senseId, eventTs) {
        var deviceTimezone = {
            timezone_offset: -25200000,
            timezone_id: "America/Los_Angeles"
        };
        $.ajax({
            url: "/api/timezone",
            dataType: "json",
            type: 'GET',
            async: false,
            data: {sense_id: senseId, event_ts: eventTs},
            success: function (response) {
                if (response.error.isWhiteString()) {
                    deviceTimezone = response.data;
                }
            }
        });
        return deviceTimezone;
    },

    updateDisplayTimeZone: function() {
        this.setState({timezone: $('#select-timezone').val()});
    },

    render: function(){
        var logTableRows = [], that = this;

        that.props.logs.forEach(function(log){
            var regexList = that.props.showLineBreaks === true ? []
                : [new RegExp('\r', 'g'), new RegExp('\n', 'g')];

            var currentTextInput = $('#text-input').val();
            if (currentTextInput !== "") {
                var textInputRegex = that.props.caseInsensitive === true ?
                    new RegExp(currentTextInput, 'gi') : new RegExp(currentTextInput, 'g');
                regexList.push(textInputRegex);
            }

            highlightedRegex = highlightByRegexForJSX(log.text,
                regexList,
                that.props.highlightColor
            );
            var msg = highlightedRegex.jsxMix,
                matchCount = highlightedRegex.matchCount, // number of matches
                nCount = highlightedRegex.nCount, // number of \n
                rCount = highlightedRegex.rCount, // number of \r
                deviceId = log.docid.split('-')[0];

            var displayTimestamp;
            switch (that.state.timezone) {
                case "browser": displayTimestamp = new Date(log.timestamp * 1000).toString();
                    break;
                case "user":
                    if (Object.keys(deviceTimezoneMap).indexOf(deviceId) > -1) {
                        displayTimestamp = displayDateTimeByTimeZoneOffset(
                            log.timestamp * 1000,
                            deviceTimezoneMap[deviceId].timezone_offset,
                            deviceTimezoneMap[deviceId].timezone_id
                        )
                    }
                    else {
                        var deviceTimezoneFromServer = that.getDeviceTimezone(deviceId, log.timestamp);
                        displayTimestamp = displayDateTimeByTimeZoneOffset(
                            log.timestamp * 1000,
                            deviceTimezoneFromServer.timezone_offset,
                            deviceTimezoneFromServer.timezone_id
                        );
                        deviceTimezoneMap[deviceId] = deviceTimezoneFromServer;
                    }
                    break;
                case "gmt": displayTimestamp = new Date(log.timestamp * 1000).toUTCString();
                    break;
                default: displayTimestamp = new Date(log.timestamp * 1000).toString();
            }
            var ts = [
                <a href={"/users/?omni_input=" + deviceId}><span className="label label-success">{deviceId}</span></a>, <br/>, <br/>,
                <a className="cursor-hand" onClick={that.searchAroundByTs}>{displayTimestamp}</a>, <br/>, <br/>,
                <span>Keyword Count: {matchCount}</span>, <br/>
            ];
            var msgClasses = React.addons.classSet({
                'col-lg-11': true,
                'col-md-11': true,
                'col-xs-11': true,
                'col-sm-11': true,
                'showLineBreaks': that.props.showLineBreaks
            });
            logTableRows.push(<tr>
                <td className="col-lg-1 col-md-1 col-xs-1 col-sm-1">{ts}</td>
                <td className={msgClasses}>{msg}</td>
            </tr>);
        });
        return (
            <table className="table table-condensed table-striped table-bordered">
                <thead><tr>
                    <th className="alert alert-success"><Input onChange={that.updateDisplayTimeZone} id="select-timezone" type="select">
                        <option value="browser">Browser Timezone</option>
                        <option value="user">User Timezone</option>
                        <option value="gmt">GMT</option>
                    </Input></th>
                    <th className="alert alert-warning"><Glyphicon glyph="paperclip"/> Messages</th>
                </tr></thead>
                <tbody>{logTableRows}</tbody>
            </table>
            )
    }
});
var DebugLog = React.createClass({
    getInitialState: function(){
        return {
            logs: [],
            searchAlert: "",
            highlightColor: '#FF0000',
            caseInsensitive: true,
            showLineBreaks: true
        };
    },
    componentDidMount: function() {
        var that = this;
        var maxDocsFromURL = getParameterByName('max_docs');
        var textInputFromURL = getParameterByName('text');
        var devicesInputFromURL = getParameterByName('devices');
        var startFromURL = getParameterByName('start');
        var endFromURL = getParameterByName('end');

        if (startFromURL) {
            $('#start-time').val(startFromURL);
        }

        if (endFromURL) {
            $('#end-time').val(endFromURL);
        }

        if (maxDocsFromURL) {
            $('#sliderValue').text(maxDocsFromURL);
        }
        else {
            maxDocsFromURL = 100;
        }
        if (devicesInputFromURL) {
            $('#devices-input').val(devicesInputFromURL);
        }
        if (textInputFromURL) {
            $('#text-input').val(textInputFromURL);
        }

        if (!(textInputFromURL.isWhiteString() && devicesInputFromURL.isWhiteString())) {
            that.handleSubmit();
        }

        $('.slider').slider({value: Number(maxDocsFromURL)}).on('slide', function(slideEvt){
            $('#sliderValue').text(slideEvt.value);
        });

        $('#case-check').attr('checked', true);
        $('#whitespace-check').attr('checked', true);
        $('#colorpick').spectrum({
            color: "#FF0000",
            clickoutFiresChange: true,
            showPalette: true,
            palette: [
                ['red', 'pink', 'brown'],
                ['orange', 'violet', 'purple'],
                ['indigo', 'teal', 'blue']
            ],
            showAlpha: true,
            change: function(color) {
                that.setState({highlightColor: color.toHexString()});
            }
        });
    },
    handleCaseChange: function() {
        this.setState({caseInsensitive: $('#case-check').is(':checked')});
    },
    handleWhiteSpaceChange: function() {
        this.setState({showLineBreaks: $('#whitespace-check').is(':checked')});
    },
    handleSubmit: function(){
        this.setState({
            logs: [],
            searchAlert: <img src="/static/image/loading.gif" />
        });
        var textInput = $('#text-input').val().trim(),
            devicesInput = $('#devices-input').val().trim(),
            startInputHuman = $('#start-time').val().trim(),
            endInputHuman = $('#end-time').val().trim(),
            startInput = startInputHuman.isWhiteString() ? "": new Date(startInputHuman + " GMT").getTime()/1000,
            endInput = endInputHuman.isWhiteString() ? "": new Date(endInputHuman + " GMT").getTime()/1000;
        $.ajax({
            url: "/api/sense_logs",
            dataType: 'json',
            type: 'GET',
            data: {
                devices: devicesInput,
                text: textInput,
                max_results: $('#sliderValue').text(),
                start_time: startInput,
                end_time: endInput
            },
            success: function(response) {
                history.pushState({}, '', '/sense_logs/?text=' + textInput + '&devices=' + devicesInput + '&max_docs=' + $('#sliderValue').text() + '&start=' + startInputHuman + '&end=' + endInputHuman);
                if (response.error) {
                    this.setState({
                        logs: [],
                        searchAlert: "☹ " + response.error
                    });
                }
                else {
                    var refinedLogs = logsFilter(response.data, startInput, endInput);
                    this.setState({
                        logs: refinedLogs,
                        searchAlert: "found " + refinedLogs.length + " documents"
                    });
                }
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({
                    logs: [],
                    searchAlert: "☹ Query failed"
                });
                console.error(this.props.url, status, err);
            }.bind(this)
        });
        return false;
    },
    render: function(){
        var result = this.state.logs.length === 0 ?
            <div className="docs-count">{this.state.searchAlert}</div>: [
            <div className="docs-count">{this.state.searchAlert}</div>,
            <LogTable
            logs={this.state.logs}
            caseInsensitive={this.state.caseInsensitive}
            showLineBreaks={this.state.showLineBreaks}
            highlightColor={this.state.highlightColor}
            />
        ];

        return (<div>
            <form onSubmit={this.handleSubmit}>
                <Row>
                    <LongDatetimePicker placeHolder="start time(GMT)" id="start-time" size="2" />
                    <LongDatetimePicker placeHolder="end time(GMT)" id="end-time" size="2" />
                    <Col xs={3} sm={3} md={3} lg={3}>
                        <input className="form-control" id="text-input" placeholder='Text e.g UART' />
                    </Col>
                    <Col xs={4} sm={4} md={4} lg={4}>
                        <LongTagsInput id="devices-input" tagClass="label label-info" placeHolder="Devices/Emails (multiple)" />
                    </Col>
                    <Col xs={1} sm={1} md={1} lg={1}>
                        <Button id="submit" bsStyle="success" type="submit"><Glyphicon glyph="search"/></Button>
                    </Col>
                </Row>

                <Row>
                    <Col xs={4} sm={4} md={4} lg={4}>
                        <input type="text" id="colorpick"/>
                    </Col>
                    <Col xs={2} sm={2} md={2} lg={2}>
                        <input id="case-check" type="checkbox" onChange={this.handleCaseChange} /> Case Insensitive
                    </Col>
                    <Col xs={2} sm={2} md={2} lg={2}>
                        <input id="whitespace-check" type="checkbox" onChange={this.handleWhiteSpaceChange} /> Show Linebreaks
                    </Col>
                    <Col xs={4} sm={4} md={4} lg={4}>
                    Max docs: <span id="sliderValue">100</span>&nbsp;&nbsp;&nbsp;
                        <input type="text" className="span2 slider" value="" data-slider-min="1" data-slider-max="150" data-slider-step="1" data-slider-id="RC" id="R" data-slider-tooltip="show" data-slider-handle="square" />
                    </Col>
                </Row>

            </form><br/>
            <p><em>Leaving all inputs blank will query latest documents. Query start and end timestamps are in GMT</em></p>
            {result}
        </div>)
    }
});

React.renderComponent(<DebugLog />, document.getElementById('debug-log'));


function highlightByRegexForJSX(text, regexList, color) {
    // this function return a mix of strings and spans
    // where the spans replace the substrings matching the regex list
    var matchCount = 0;
    var rCount = 0;
    var nCount = 0;
    regexList.forEach(function(r){
        text = text.replace(r, function (matchString) {
            // ^_^ is chosen as a dummy delimiter
            if (r.exec('\n') !== null) {
                return '^_^<b>\\n</b>^_^';
            }
            else if (r.exec('\r') !== null) {
                return '^_^<b>\\r</b>^_^';
            }
            else {
                return '^_^<b>' + matchString + '</b>^_^';
            }
        });
    });
    var mixedArray = [];
    text.split('^_^').forEach(function (t) {
        if (t.slice(0, 3) !== '<b>') {
            mixedArray.push(t);
        }
        else if (t === '<b>\\n</b>') {
            mixedArray.push(<span style={{color: 'blue'}} dangerouslySetInnerHTML={{__html: t}}></span>);
            nCount += 1;
        }
        else if (t === '<b>\\r</b>') {
            mixedArray.push(<span style={{color: '#71A412'}} dangerouslySetInnerHTML={{__html: t}}></span>);
            rCount += 1;
        }
        else if (!new RegExp('<b>\\s*</b>').test(t)){
            mixedArray.push(<span style={{color: color}} dangerouslySetInnerHTML={{__html: t}}></span>);
            matchCount += 1;
        }
    });
    return {
        jsxMix:  mixedArray,
        matchCount: matchCount,
        nCount: nCount,
        rCount: rCount
    };
}

function logsFilter(data, start, end) {
    var filteredByTs = data.filter(function(log){
        if (start && end) {
            return Number(log.timestamp) >= start && Number(log.timestamp) <= end;
        }
        else if(start) {
            return Number(log.timestamp) >= start;
        }
        else if(end) {
            return Number(log.timestamp) <= end;
        }
        else {
            return log;
        }
    });

    return filteredByTs.sort(compareTimestamp);
}

function compareTimestamp(log1, log2) {
    if (log1.timestamp < log2.timestamp) {
        return -1;
    }
    if (log1.timestamp > log2.timestamp) {
        return 1;
    }
    return 0;
}

function displayDateTimeByTimeZoneOffset(ts, tzOffsetMillis, tzId) {
    var omniTimeFormat = d3.time.format('%a %d %b %H:%M %Z');
    var omniTimeFormatWithoutTz = d3.time.format('%a %d %b %H:%M');
    if (tzOffsetMillis && tzId) {
        var adjustedDateTimeString = new Date(ts + tzOffsetMillis).toUTCString().split("GMT")[0];
        var tzOffsetHours =  tzOffsetMillis / 3600000, adjustTimezoneString;
        if (tzOffsetHours >= 0 && tzOffsetHours < 10 ) {
            adjustTimezoneString = "0" + tzOffsetHours.toString() + "00 " + tzId;
        }
        else if (tzOffsetHours < 0 && tzOffsetHours > -10) {
            adjustTimezoneString = "-0" + Math.abs(tzOffsetHours).toString() + "00 " + tzId;
        }
        else {
            adjustTimezoneString = tzOffsetHours.toString() + "00 " + tzId;
        }
        return omniTimeFormatWithoutTz(new Date(adjustedDateTimeString)) +  " " + adjustTimezoneString;
    }

    return omniTimeFormat(new Date(ts));
}

function dateTimePickerStringFormat(ts) {
    return d3.time.format("%m-%d-%Y %H:%M:%S")(new Date(new Date(ts).toUTCString().split(" GMT")[0]));
}
