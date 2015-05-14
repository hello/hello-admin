var OnboardingLogs = React.createClass({
    getInitialState: function() {
        return {
            data: [], filteredData: [], error: "", limit: 10000,
            columns: [
                {name: "ts", title: "Time", width: "100px"},
                {name: "sense_id", title: "Sense", width: "110px"},
                {name: "pill_id", title: "Pill", width: "110px"},
                {name: "account_id", title: "Account", width: "115px"},
                {name: "result", title: "Result", width: "115px"},
                {name: "action", title: "Action", width: "115px"},
                {name: "ip", title: "IP", width: "100px"},
                {name: "info", title: "Info"}
            ],
            loading: false,
            onboardingInfo: null
        };
    },

    loadOnboardingLogsByResult: function() {
        this.setState({loading: true, data: [], filteredData: [], error: ""});
        var result = $("#result").val();
        var startTime = $("#start-time").val();
        var endTime = $("#end-time").val();
        history.pushState({}, '', '/onboarding_logs/?result=' + result + '&start=' + startTime + '&end=' + endTime);
        $.ajax({
            url: "/api/onboarding_logs_by_result",
            dataType: 'json',
            type: 'GET',
            async: false,
            data: {
                result: result,
                start_millis: startTime ? new Date(startTime).getTime() : "",
                end_millis: endTime ? new Date(endTime).getTime() : ""
            },
            success: function(response) {
                console.log(response);
                if (response.error.isWhiteString()) {
                    var mappedData = manipulateData(response.data);
                    this.setState({error: "", data: mappedData, filteredData: mappedData, loading: false});
                }
                else {
                    this.setState({data: [], filteredData: [], error: response.error, loading: false});
                }
            }.bind(this)
        });
        return false;
    },

    loadOnboardingLogsBySenseId: function() {
        this.setState({loading: true, data: [], filteredData: [], error: ""});
        var senseId = $("#sense-id").val();
        var count = $("#count").val();
        console.log(senseId, count);
        history.pushState({}, '', '/onboarding_logs/?sense_id=' + senseId + '&count=' + count);
        $.ajax({
            url: "/api/onboarding_logs_by_sense_id",
            dataType: 'json',
            type: 'GET',
            async: false,
            data: {
                sense_id: senseId,
                count: count
            },
            success: function(response) {
                console.log(response);
                if (response.error.isWhiteString()) {
                    var mappedData = manipulateData(response.data);
                    this.setState({error: "", data: mappedData, filteredData: mappedData, loading: false});
                }
                else {
                    this.setState({data: [], filteredData: [], error: response.error, loading: false});
                }
            }.bind(this)
        });
        return false;
    },

    submitWithInputsFromURL: function() {
        var resultFromURL = getParameterByName("result");
        var startTimeFromURL = getParameterByName("start");
        var endTimeFromURL = getParameterByName("end");

        var senseIdFromURL = getParameterByName("sense_id");
        var countFromURL = getParameterByName("count");

        if (resultFromURL) {
            $("#result").val(resultFromURL);
            $("#start-time").val(startTimeFromURL);
            $("#end-time").val(endTimeFromURL);
            this.loadOnboardingLogsByResult();
        }
        else if (senseIdFromURL) {
            $("#sense-id").val(senseIdFromURL);
            $("#count").val(countFromURL);
            this.loadOnboardingLogsBySenseId();
        }
        else {
            return false;
        }
    },

    componentDidMount: function() {
        var filters = $(".z-show-filter");
        filters.children().remove();
        filters.append('<button><span class="glyphicon glyphicon-filter"></span>');
        this.submitWithInputsFromURL();
    },

    componentDidUpdate: function() {
        var that = this;
        $(".z-row .z-cell:nth-child(2)").click(function(){$("#sense-id").val($(this).find(".z-text").text());});
//        $(".z-row .z-cell:nth-child(8)").click(function(){that.setState({onboardingInfo: ($(this).find(".z-text").text())});});
    },

    handleSortChange: function(sortInfo){
        if (sortInfo.length === 0){
            this.setState({sortInfo: sortInfo});
            return null;
        }
        switch(sortInfo[0].name){
            case "info": this.setState({sortInfo: sortInfo, data: sortInfo[0].dir === 1 ? this.state.data.sort(compareInfo) : this.state.data.sort(compareInfo).reverse()}); break;
            case "ip": this.setState({sortInfo: sortInfo, data: sortInfo[0].dir === 1 ? this.state.data.sort(compareIP) : this.state.data.sort(compareIP).reverse()}); break;
            case "action": this.setState({sortInfo: sortInfo, data: sortInfo[0].dir === 1 ? this.state.data.sort(compareAction) : this.state.data.sort(compareAction).reverse()}); break;
            case "result": this.setState({sortInfo: sortInfo, data: sortInfo[0].dir === 1 ? this.state.data.sort(compareResult) : this.state.data.sort(compareResult).reverse()}); break;
            case "account_id": this.setState({sortInfo: sortInfo, data: sortInfo[0].dir === 1 ? this.state.data.sort(compareAccountId) : this.state.data.sort(compareAccountId).reverse()}); break;
            case "sense_id": this.setState({sortInfo: sortInfo, data: sortInfo[0].dir === 1 ? this.state.data.sort(compareSenseId) : this.state.data.sort(compareSenseId).reverse()}); break;
            case "pill_id": this.setState({sortInfo: sortInfo, data: sortInfo[0].dir === 1 ? this.state.data.sort(comparePillId) : this.state.data.sort(comparePillId).reverse()}); break;
            case "ts": this.setState({sortInfo: sortInfo, data: sortInfo[0].dir === 1 ? this.state.data.sort(compareTimestamp) : this.state.data.sort(compareTimestamp).reverse()}); break;
            default: return null;
        }
	},
    handleColumnResize: function(firstCol, firstSize, secondCol, secondSize){
	    this.setState({})
	},
    handleFilter: function(column, value, allFilterValues){
	    var filteredData = this.state.data;
    	Object.keys(allFilterValues).forEach(function(name){
    		var columnFilter = (allFilterValues[name].toString()).toLowerCase();
    		if (columnFilter == ''){
    			return
    		}
    		filteredData = filteredData.filter(function(item){
                return (item[name] ? item[name].toString() : "").toLowerCase().indexOf(columnFilter)  > -1;
    		});
        });
        this.setState({filteredData: filteredData});
	},
    reload: function(){
		this.refs.grid.reload()
	},
    render: function(){
		return <div>
            <h3>Onboarding Logs</h3>
            <hr className="fancy-line"/>
            <form className="row" onSubmit={this.loadOnboardingLogsByResult}>
                <Col xs={2}><Input type="select" id="result">
                    <option value="START">START</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="FAILED">FAILED</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="EXIT">EXIT</option>
                </Input></Col>
                <LongDatetimePicker placeHolder="start time" id="start-time" size="3" />
                <LongDatetimePicker placeHolder="end time" id="end-time" size="3" />
                <Col xs={1}><Button type="submit"><Glyphicon glyph="search"/></Button></Col>
            </form>
            <form className="row" onSubmit={this.loadOnboardingLogsBySenseId}>
                <Col xs={2}><Input type="text" id="sense-id" placeholder="Sense ID" /></Col>
                <Col xs={2}><Input type="number" id="count" placeholder="Count" /></Col>
                <Col xs={1}><Button type="submit"><Glyphicon glyph="search"/></Button></Col>
                <Col xs={7}><div><em>{this.state.onboardingInfo}</em></div></Col>
            </form>
            <Row>
                <Col xs={12}>
                    <DataGrid
                        ref="grid"
                        idProperty='id'
                        dataSource={this.state.filteredData}
                        columns={this.state.columns}
                        style={{height: 500}}
                        withColumnMenu={true}
                        onColumnResize={this.handleColumnResize}
                        onSortChange={this.handleSortChange}
                        style={{height: "67vh", border: "1px solid rgb(194, 194, 245)"}}
                        emptyText={this.state.error}
                        showCellBorders={false}
                        loading={this.state.loading}
                        loadMaskOverHeader={false}
                        onFilter={this.handleFilter}
                        liveFilter={true}
                        sortInfo={this.state.sortInfo}
                    />
                </Col>
            </Row>
        </div>
	}
});

React.render(<OnboardingLogs />, document.getElementById("onboarding-logs"));

function manipulateData(data) {
    return data.map(function(d){
        d.ts = d3.time.format("%b %d %H:%M")(new Date(d.ts_millis));
        return d;
    });
}

function compareNumber(e1, e2, attr) {
    return e1[attr] - e2[attr];
}

function compareString(e1, e2, attr) {
    if (e1[attr] < e2[attr]) {
        return -1;
    }
    if (e1[attr] > e2[attr]) {
        return 1;
    }
    return 0;
}

function compareAccountId(e1, e2) {
    return compareNumber(e1, e2, "account_id");
}

function compareSenseId(e1, e2) {
    return compareString(e1, e2, "sense_id");
}

function comparePillId(e1, e2) {
    return compareString(e1, e2, "pill_id");
}

function compareAction(e1, e2) {
    return compareString(e1, e2, "action");
}

function compareResult(e1, e2) {
    return compareString(e1, e2, "result");
}

function compareInfo(e1, e2) {
    return compareString(e1, e2, "info");
}

function compareTimestamp(e1, e2) {
    return compareNumber(e1, e2, "ts_millis");
}

function compareIP(e1, e2) {
    return evalIp(e1.ip) - evalIp(e2.ip);
}

function evalIp(ipString) {
    var ipSplit = ipString.split(".");
    return Number(ipSplit[0])*256*256*256 + Number(ipSplit[1])*256*256 + Number(ipSplit[2])*256 + Number(ipSplit[3]);
}
