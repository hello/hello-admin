/** @jsx React.DOM */


var LogTable = React.createClass({
   render: function(){
       var logTableRows = [], that = this;
       that.props.logs.forEach(function(log){
            var currentInput = $('#search-input').val();
            var regex = that.props.caseInsensitive === true ?
                        new RegExp(currentInput, 'gi'): new RegExp(currentInput, 'g');
            var regexList = that.props.showLineBreaks === true ? [regex]
                :[regex, new RegExp('\r', 'g'), new RegExp('\n', 'g')];
            highlightedRegex =  highlightByRegexForJSX(log.text,
                regexList,
                that.props.highlightColor
            );
            msg = highlightedRegex.jsxMix;
            matchCount = highlightedRegex.matchCount;
            nCount = highlightedRegex.nCount;
            rCount = highlightedRegex.rCount;

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
            placeholder: " for example: Uploading UART",
            mode: "text",
            highlightColor: '#FF0000',
            caseInsensitive: true,
            showLineBreaks: false
        };
    },
    componentDidMount: function() {
        var that = this;
        that.refs.searchBy.getDOMNode().value = 'text';
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
    handleModeChange: function() {
        if (this.refs.searchBy.getDOMNode().value === 'device_id') {
            this.setState({
                placeholder: '  for example: D05FB81BE1E0',
                mode:'device_id'
            });
        }
        else if (this.refs.searchBy.getDOMNode().value === 'text') {
            this.setState({
                placeholder: '  for example: Uploading UART',
                mode:'text'
            });
        }
    },
    handleSubmit: function(){
        var searchInput = this.refs.searchInput.getDOMNode().value,
            searchBy = this.refs.searchBy.getDOMNode().value;
        $.ajax({
          url: "/api/debug_log",
          dataType: 'json',
          type: 'GET',
          data: {
              search_by: searchBy,
              search_input: searchInput
          },
          success: function(response) {
            if (response.error) {
                this.setState({
                    logs: [],
                    searchAlert: "☹ " + response.error
                });
            }
            else {
                this.setState({
                    logs: response.data.results,
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
        var glyphClasses = React.addons.classSet({
            'glyphicon': true,
            'glyphicon-pencil': this.state.mode === 'text',
            'glyphicon-barcode': this.state.mode === 'device_id'
        });
        return (<div>
            <form className="row" onSubmit={this.handleSubmit}>
                <div className="col-lg-1 col-md-1 col-xs-1">
                    <input type="text" id="colorpick"/>
                </div>
                <div className="col-lg-1 col-md-1 col-xs-1">
                    <input id="case-check" type="checkbox" onChange={this.handleCaseChange} /> Case Insensitive
                </div>
                 <div className="col-lg-1 col-md-1 col-xs-1">
                    <input id="whitespace-check" type="checkbox" onChange={this.handleWhiteSpaceChange} /> Show Linebreaks
                </div>
                <div className="col-lg-3 col-md-3 col-xs-3">
                    <div className="icon-addon addon-md">
                        <select id="mode" className="form-control" ref="searchBy" onChange={this.handleModeChange}>
                            <option value="device_id">&nbsp;&nbsp;&nbsp;&nbsp; Search by Device ID</option>
                            <option value="text">&nbsp;&nbsp;&nbsp;&nbsp; Search by Text Phrase</option>
                        </select>
                        <label for="mode" className="glyphicon glyphicon-star-empty"></label>
                    </div>
                </div>
                <div className="col-lg-4 col-md-4 col-xs-4 input-group input-group-md">
                  <div className="icon-addon addon-md">
                    <input id="search-input" className="form-control" ref="searchInput" placeholder={this.state.placeholder} />
                    <label for="search-input" className={glyphClasses}></label>
                  </div>
                  <span className="input-group-btn">
                    <button className="btn btn-success" type="submit"><span className="glyphicon glyphicon-search"></span></button>
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
    var textSplit = text;
    regexList.forEach(function(r){
        textSplit = textSplit.replace(r, function (matchString) {
            if (r.exec('\n') !== null) {
                return '^_^<b>\\n</b>^_^';
            }
            else if (r.exec('\r') !== null) {
                return '^_^<b>\\r</b>^_^';
            }
            else {
                return '^_^<b>' + matchString + '</b>^_^';  // ^_^ as dummy delimiter
            }
        });
    });
    var mixedArray = [];
    textSplit.split('^_^').forEach(function (t) {
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
            console.log(t, matchCount);
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