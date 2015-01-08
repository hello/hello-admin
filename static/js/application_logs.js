/** @jsx React.DOM */

var today = new Date();
var last14days = new Date();
last14days.setDate(last14days.getDate() - 14);

var datepickerFormat = d3.time.format("%m/%d/%Y %I:%M:%S %p");
var todayInDatepickerFormat = datepickerFormat(today);
var last14daysInDatepickerFormat = datepickerFormat(last14days);

var LogTable = React.createClass({
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
                rCount = highlightedRegex.rCount; // number of \r

            var origin = log.docid.split('-').slice(0, log.docid.split('-').length - 1).join('-');

            var ts = [
                <LongLabel bsStyle={labelOriginColor(origin)} content={origin}/>, <br/>, <br/>,
                getLocalDateFromUTCEpoch(Number(log.timestamp)), <br/>, <br/>,
                <em>%s Count: {matchCount}</em>, <br/>,
                <em>\n Count: {nCount}</em>, <br/>,
                <em>\r Count: {rCount}</em>
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
                <th className="alert alert-success"><span className="glyphicon glyphicon-time"> Time</span></th>
                <th className="alert alert-warning"><span className="glyphicon glyphicon-paperclip"> Messages</span></th>
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
        var levelsInputFromURL = getParameterByName('levels');
        var originsInputFromURL = getParameterByName('origins');
        var versionsInputFromURL = getParameterByName('versions');
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
          maxDocsFromURL = 20;
        }
        if (levelsInputFromURL) {
          $('#levels-input').val(levelsInputFromURL);
        }
        if (originsInputFromURL) {
          $('#origins-input').val(originsInputFromURL);
        }
        if (versionsInputFromURL) {
          $('#versions-input').val(versionsInputFromURL);
        }
        if (textInputFromURL) {
          $('#text-input').val(textInputFromURL);
        }

        if (levelsInputFromURL || textInputFromURL)
          that.handleSubmit();

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
        var textInput = $('#text-input').val(),
            levelsInput = $('#levels-input').val(),
            originsInput = $('#origins-input').val(),
            versionsInput = $('#versions-input').val(),
            startInput = getUTCEpochFromLocalTime($('#start-time').val()),
            endInput = getUTCEpochFromLocalTime($('#end-time').val());
        $.ajax({
          url: "/api/application_logs",
          dataType: 'json',
          type: 'GET',
          data: {
              levels: levelsInput,
              origins: originsInput,
              versions: versionsInput,
              text: textInput,
              max_results: $('#sliderValue').text(),
              start_time: startInput,
              end_time: endInput
          },
          success: function(response) {
            history.pushState({}, '', '/application_logs/?text=' + textInput + '&levels=' + levelsInput + '&origins=' + originsInput + '&versions=' + versionsInput + '&max_docs=' + $('#sliderValue').text() + '&start=' + $('#start-time').val() + '&end=' + $('#end-time').val());
            if (response.error) {
                this.setState({
                    logs: [],
                    searchAlert: "☹ " + response.error
                });
            }
            else {
                refinedLogs = logsFilter(response.data, startInput, endInput);
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
        var result = this.state.logs.length === 0 ? [
            <div className="docs-count">{this.state.searchAlert}</div>]: [
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
                <LongDatetimePicker placeHolder="start time" id="start-time" size="3" defaultDate={last14daysInDatepickerFormat} maxDate={todayInDatepickerFormat}  />
                <LongDatetimePicker placeHolder="end time" id="end-time" size="3" defaultDate={todayInDatepickerFormat} maxDate={todayInDatepickerFormat} />
                <Col xs={3} sm={3} md={3} lg={3}>
                  <input className="form-control" id="text-input" placeholder='Text e.g: DiffInSeconds' />
                </Col>
                <Col xs={2} sm={2} md={2} lg={2}>
                    <input id="case-check" type="checkbox" onChange={this.handleCaseChange} /> Case Insensitive
                </Col>
                <Col xs={2} sm={2} md={2} lg={2}>
                    <input id="whitespace-check" type="checkbox" onChange={this.handleWhiteSpaceChange} /> Show Linebreaks
                </Col>
              </Row>
              <Row id="filters">
                <Col xs={3} sm={3} md={3} lg={3}>
                  <LongTagsInput id="levels-input" tagClass="label label-info" placeHolder="Levels e.g: INFO, DEBUG" />
                </Col>
                <Col xs={3} sm={3} md={3} lg={3}>
                  <LongTagsInput id="origins-input" tagClass="label label-info" placeHolder="Origins e.g: suripu-app" />
                </Col>
                <Col xs={3} sm={3} md={3} lg={3}>
                  <LongTagsInput id="versions-input" tagClass="label label-info" placeHolder="Versions e.g: 0.1.321" />
                </Col>
                <Col xs={2} sm={2} md={2} lg={2}>
                    <span id="slider-narration">Max docs per filter</span>: <span id="sliderValue">20</span>
                    <input type="text" className="span2 slider" value="" data-slider-min="1" data-slider-max="150" data-slider-step="1" data-slider-id="RC" id="R" data-slider-tooltip="show" data-slider-handle="square" />
                </Col>
                <Col xs={1} sm={1} md={1} lg={1}>
                  <Button bsStyle="info" bsSize="large" className="btn-circle" type="submit"><Glyphicon glyph="search"/></Button>
                </Col>
              </Row>
            </form><br/>
            {result}
        </div>)
    }
});

React.renderComponent(<DebugLog />, document.getElementById('application-logs'));


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
            mixedArray.push(<span className="key-span" style={{color: color}} dangerouslySetInnerHTML={{__html: t}}></span>);
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
    var filtered_logs = data.filter(function(log){
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
    return filtered_logs.sort(compareTimestamp);
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

function labelOriginColor(origin) {
    return "label-".concat(origin);
}
