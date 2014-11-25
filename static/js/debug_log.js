/** @jsx React.DOM */

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

            var ts = [
                <span className="label label-default">{log.docid.split('-')[0]}</span>, <br/>, <br/>,
                new Date(Number(log.docid.split('-')[1])).toLocaleString(), <br/>, <br/>,
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
            showLineBreaks: false
        };
    },
    componentDidMount: function() {
        var that = this;
        var maxDocsFromURL = getParameterByName('max_docs');
        var textInputFromURL = getParameterByName('text');
        var devicesInputFromURL = getParameterByName('devices');

        if (maxDocsFromURL) {
          $('#sliderValue').text(maxDocsFromURL);
        }
        else {
          maxDocsFromURL = 20;
        }
        if (devicesInputFromURL) {
          $('#devices-input').val(devicesInputFromURL);
        }
        if (textInputFromURL) {
          $('#text-input').val(textInputFromURL);
        }

        if (devicesInputFromURL || textInputFromURL)
          that.handleSubmit();

        $('.slider').slider({value: Number(maxDocsFromURL)}).on('slide', function(slideEvt){
            $('#sliderValue').text(slideEvt.value);
        });

        $('#case-check').attr('checked', true);
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
            devicesInput = $('#devices-input').val();
        $.ajax({
          url: "/api/debug_log",
          dataType: 'json',
          type: 'GET',
          data: {
              devices: devicesInput,
              text: textInput,
              max_results: $('#sliderValue').text()
          },
          success: function(response) {
            history.pushState({}, '', '/debug_log/?text=' + textInput + '&devices=' + devicesInput + '&max_docs=' + $('#sliderValue').text());
            if (response.error) {
                this.setState({
                    logs: [],
                    searchAlert: "☹ " + response.error
                });
            }
            else {
                this.setState({
                    logs: response.data.results.reverse(),
                    searchAlert: "found " + response.data.results.length + " documents"
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
            <form className="row" onSubmit={this.handleSubmit}>
                <div className="col-lg-1 col-md-1 col-xs-1">
                  <span id="sliderText">Max docs: </span><span id="sliderValue">20</span>
                  <input type="text" className="span2 slider" value="" data-slider-min="5" data-slider-max="101" data-slider-step="1" data-slider-id="RC" id="R" data-slider-tooltip="show" data-slider-handle="square" />
                </div>
                <div className="col-lg-1 col-md-1 col-xs-1" id="colorpickContainer">
                    <input type="text" id="colorpick"/>
                </div>
                <div className="col-lg-1 col-md-1 col-xs-1">
                    <input id="case-check" type="checkbox" onChange={this.handleCaseChange} /> Case Insensitive
                </div>
                 <div className="col-lg-1 col-md-1 col-xs-1">
                    <input id="whitespace-check" type="checkbox" onChange={this.handleWhiteSpaceChange} /> Show Linebreaks
                </div>

                <div className="col-lg-3 col-md-3 col-xs-3">
                    <LongTagsInput id="devices-input" tagClass="label label-info" placeHolder="Devices(multiple) e.g 5xy, 5yz" />
                </div>
                <div className="col-lg-3 col-md-3 col-xs-3 input-group input-group-md">
                  <div className="icon-addon addon-md">
                    <input id="text-input" className="form-control" ref="textInput" placeholder='Text e.g UART' />
                    <label for="text-input" className="glyphicon glyphicon-pencil"></label>
                  </div>
                  <span className="input-group-btn">
                    <button className="btn btn-success" onClick={this.handleSubmit}><span className="glyphicon glyphicon-search"></span></button>
                  </span>
                </div>
            </form><br/>
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