var LogFacets = React.createClass({
    getInitialState: function() {
        return {facets: {}, error: "", loading: false, firmwares: []}
    },

    getFirmwares: function(firmwareFromURL) {
        $.ajax({
            url: '/api/firmware/info',
            dataType: 'json',
            type: 'GET',
            success: function (response) {
                console.log(response);
                if (response.error.isWhiteString()) {
                    this.setState({firmwares: response.data.map(function (fw) {
                        return parseInt(fw.version, 10).toString(16).toUpperCase();
                    }).filter(function (hexFw) {
                        return hexFw !== "-1"
                    }).sort()});

                    if (firmwareFromURL){
                        $("#firmware").val(firmwareFromURL);
                    }

                    this.handleSubmit();
                }
            }.bind(this)
        });
    },

    componentDidMount: function() {
        var patternFromURL = getParameterByName("pattern");
        if (patternFromURL.isWhiteString()) {
            return false;
        }
        var dateFromURL = getParameterByName("date");
        var firmwareFromURL = getParameterByName("firmware");

        $("#pattern").val(patternFromURL);
        $("#date-input").val(dateFromURL);

        if(firmwareFromURL) {
            this.getFirmwares(firmwareFromURL);
        }
        else {
            this.getFirmwares();
        }
        return false;
    },

    handleSubmit: function() {
        this.setState({loading: true});
        var pattern = $("#pattern").val().trim();
        var date = $("#date-input").val();
        var firmware = $("#firmware").val();
        history.pushState({}, '', '/log_facets/?pattern=' + pattern + "&date=" + date + "&firmware=" + firmware);
        $.ajax({
            url: '/api/log_facets',
            dataType: 'json',
            data: {
                pattern: pattern,
                date: date,
                middle_fw_version: firmware
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
        var firmwares = this.state.firmwares.map(function(hexFwVersion){
            return <option value={hexFwVersion}>{hexFwVersion}</option>
        });

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
                <Col xs={3}><Input type="select" id="firmware"><option value="">&lt;Optional&gt; Select A Firmware</option>{firmwares}</Input></Col>
                <LongDatetimePicker glyphicon="clock" placeHolder="pick a date" id="date-input" pickTime={false} format="MM-DD-YYYY" size="4" />
                <Col xs={1}><Button type="submit">{submitIcon}</Button></Col>
            </form>
            {alert}
            {facetBySenseID}
        </div>);
    }
});

React.render (<LogFacets/>, document.getElementById("log-facets"));