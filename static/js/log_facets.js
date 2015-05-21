var LogFacets = React.createClass({
    getInitialState: function() {
        return {facets: {}, error: "", loading: false}
    },
    componentDidMount: function() {
        var patternFromURL = getParameterByName("pattern");
        if (patternFromURL.isWhiteString()) {
            return false;
        }
        var startTimeFromURL = getParameterByName("start");
        var endTimeFromURL = getParameterByName("end");

        $("#pattern").val(patternFromURL);
        $("#start-time").val(startTimeFromURL);
        $("#end-time").val(endTimeFromURL);

        this.handleSubmit();
    },
    handleSubmit: function() {
        this.setState({loading: true});
        var pattern = $("#pattern").val().trim();
        var startTime = $("#start-time").val();
        var endTime = $("#end-time").val();
        history.pushState({}, '', '/log_facets/?pattern=' + pattern + "&start=" + startTime + "&end=" + endTime);
        $.ajax({
            url: '/api/log_facets',
            dataType: 'json',
            data: {
                pattern: pattern,
                start_ts: !startTime.isWhiteString() ? new Date(startTime).getTime()/1000 : "",
                end_ts: !startTime.isWhiteString() ? new Date(endTime).getTime()/1000 : ""
            },
            type: 'GET',
            success: function(response) {
                console.log(response);
                if (response.error.isWhiteString()) {
                    this.setState({facets: response.data, error: "", loading: false});
                }
                else {
                    this.setState({facets: {}, error: response.error, loading: false});
                }
            }.bind(this)
        });
        return false;
    },
    render: function() {
        var facetBySenseIdData = this.state.facets.device_id;
        var submitIcon = this.state.loading === false ? <Glyphicon glyph="search"/>
            : <img className="loader" src="/static/image/loading.gif" />;
        var alert = this.state.error.isWhiteString() ? null:
            <Alert bsStyle="danger">{this.state.error}</Alert>;

        var facetBySenseID = $.isEmptyObject(facetBySenseIdData) || $.isEmptyObject(facetBySenseIdData)  ?
            null :
            <Table>
                <thead><tr>
                        <th className="alert-success">{"Sense ID (Σ = " +  Object.keys(facetBySenseIdData).length + ")"}</th>
                        <th className="alert-success">{"#Documents (Σ = " + _.values(facetBySenseIdData).reduce(function(u,v){ return u + v;}) + ")"}</th>
                </tr></thead>
                <tbody>{
                    Object.keys(facetBySenseIdData)
                        .sort(function(x, y){return facetBySenseIdData[y] - facetBySenseIdData[x]})
                        .map(function(senseId){
                            return <tr>
                                <td><a target="_blank" href={"/account_profile/?type=sense_id&input=" + senseId}>{senseId}</a></td>
                                <td>{facetBySenseIdData[senseId]}</td>
                            </tr>;
                        })
                    }</tbody>
            </Table>;

        return (<div>
            <form className="row" onSubmit={this.handleSubmit}>
                <Col xs={3}><Input type="text" id="pattern" placeholder="alphabetical string" /></Col>
                <LongDatetimePicker glyphicon="clock" placeHolder="start, default: May 15 noon PDT" id="start-time" size="4" />
                <LongDatetimePicker glyphicon="clock" placeHolder="end, default: now PDT" id="end-time" size="4" />
                <Col xs={1}><Button type="submit">{submitIcon}</Button></Col>
            </form>
            {alert}
            {facetBySenseID}
        </div>);
    }
});

React.render (<LogFacets/>, document.getElementById("log-facets"));