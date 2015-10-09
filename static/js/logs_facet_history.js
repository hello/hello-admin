var LogFacetsHistory = React.createClass({
    getInitialState: function() {
        return {data: [] , error: "", loading: false, counts: {}};
    },

    handleSubmit: function() {
        this.setState({loading: true});
        $.ajax({
            url: '/api/logs_facet_history',
            dataType: 'json',
            data: {
                date: $("#" + this.props.dateId).val()
            },
            type: 'GET',
            success: function(response) {
                if (response.error.isWhiteString()) {
                    this.setState({data: response.data, error: "", loading: false, counts: getCounts(response.data)});
                }
                else {
                    this.setState({data: [], error: response.error, loading: false, counts: {}});
                }

            }.bind(this)
        });
        return false;
    },

    render: function() {
        console.log(this.state.counts);

        var results = this.state.data.length === 0 ? null :
            <Table>
                <thead>
                    <tr>
                        <th>FW(Hex)</th>
                        <th>FW(Man)</th>
                        {getPatterns(this.state.data).map(function(p){return <th>{p}</th>;})}
                    </tr>
                </thead>
                <tbody>
                    {createMatrixFromCounts(this.state.counts)}
                </tbody>
            </Table>;

        return (<div>
            <form onSubmit={this.handleSubmit}>
                <LongDatetimePicker size={3} glyphicon="clock" placeHolder="pick a date" id={this.props.dateId} pickTime={false} format="MM-DD-YYYY" size="4" />
                <Col xs={2}><Button type="submit">Go</Button></Col>
            </form>
            {results}
        </div>);
    }
});


var LogFacetsHistoryMaestro = React.createClass({
    render: function() {
        return <div>
            <Col xs={12}><LogFacetsHistory dateId="date1"/></Col>
            <Col xs={12}>vs</Col>
            <Col xs={12}><LogFacetsHistory dateId="date2"/></Col>
        </div>
    }
});
React.render(<LogFacetsHistoryMaestro dateId="date1" />, document.getElementById("logs-facet-history"));

function getPatterns(data) {
    return _.uniq(data.map(function(d){return d.pattern;}).sort());
}

function getMiddleFWVersions(data) {
    return _.uniq(data.map(function(d){return d.middle_fw_version;}).sort());
}

function getCounts(data) {
    console.log(data);
    var patterns = getPatterns(data);
    var middleFWVersions = getMiddleFWVersions(data);
    var counts = {};
    middleFWVersions.forEach(function(fw){
        counts[fw] = {};
        patterns.forEach(function(p){
            var possibleMatch = data.filter(function(d){return d.pattern === p && d.middle_fw_version === fw});
            counts[fw][p] = possibleMatch.length > 0 ? possibleMatch[0].count : 0;
        }.bind(this));
    }.bind(this));
    return counts;
}

function createMatrixFromCounts(counts) {
    var middleFwVersions = Object.keys(counts);
    var fwHexToManMap = translateFirmwares(middleFwVersions);
    return middleFwVersions.map(function(fw) {
        return <tr>
            <td>{fw}</td>
            <td>{fwHexToManMap[fw] || "--"}</td>
            {Object.keys(counts[fw]).map(function(p) {
                return <td>{counts[fw][p]}</td>;
            })}
        </tr>
    });
}

function translateFirmwares(firmwareHexList) {
    var fwTranslation = {};
    $.ajax({
        url: '/api/firmware_unhash',
        dataType: 'json',
        data: JSON.stringify(firmwareHexList),
        type: "POST",
        async: false,
        success: function(response) {
            console.log('rr', response);
            fwTranslation = response.data;
        }.bind(this)
    });
    return fwTranslation;
}