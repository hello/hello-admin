var OnboardingLogs = React.createClass({
    getInitialState: function() {
        return {
            data: [], filteredData: [], error: "", limit: 10000, selectedId: 1,
            columns: [
                {name: "ts", title: "Time", width: "100px"},
                {name: "sense_id", title: "Sense", width: "110px"},
                {name: "pill_id", title: "Pill", width: "110px"},
                {name: "account_id", title: <img className="loading-inline" src="/static/svg/sleep.svg" />, width: "80px"},
                {name: "result", title: "Result", width: "90px"},
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

    loadOnboardingLogsBySenseIdOrEmail: function() {
        var senseId = $("#sense-id").val();
        var count = $("#count").val();
        if (senseId.indexOf("@") > -1){
            this.loadOnboardingLogsByEmail(senseId, count);
        }
        else {
            this.loadOnboardingLogsBySenseId(senseId, count);
        }
        return false;
    },

    loadOnboardingLogsBySenseId: function(senseId, count) {
        this.setState({loading: true, data: [], filteredData: [], error: ""});
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

    loadOnboardingLogsByEmail: function(email, count) {
        this.setState({loading: true, data: [], filteredData: [], error: ""});
        history.pushState({}, '', '/onboarding_logs/?email=' + email + '&count=' + count);
        $.ajax({
            url: "/api/onboarding_logs_by_email",
            dataType: 'json',
            type: 'GET',
            async: false,
            data: {
                email: email,
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
        var emailFromURL = getParameterByName("email");
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
            this.loadOnboardingLogsBySenseIdOrEmail();
        }
        else if (emailFromURL) {
            $("#sense-id").val(emailFromURL);
            $("#count").val(countFromURL);
            this.loadOnboardingLogsBySenseIdOrEmail();
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
//        $(".z-row .z-cell:nth-child(2)").click(function(){$("#sense-id").val($(this).find(".z-text").text());});
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

    onSelectionChange: function(newSelectedId, data){
        this.setState({selectedId: newSelectedId, onboardingInfo: <Alert bsSize="xs">{data.info}</Alert>});
        $("#sense-id").val(data.sense_id);
	},

    render: function(){
		return <div>
            <form className="col-xs-12 in" onSubmit={this.loadOnboardingLogsByResult}>
                <Col xs={12} sm={6} smOffset={3} lg={3} lgOffset={0}><Input type="select" id="result">
                    <option value="START">START</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="FAILED">FAILED</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="EXIT">EXIT</option>
                </Input></Col>

                <Col xs={12} sm={6} smOffset={3} lg={3} lgOffset={0}>
                    <LongDatetimePickerWithoutSize placeHolder="start (last week)" id="start-time"/>
                </Col>

                <Col xs={12} sm={6} smOffset={3} lg={3} lgOffset={0}>
                    <LongDatetimePickerWithoutSize placeHolder="end (now)" id="end-time"/>
                </Col>

                <Col xs={12} sm={6} smOffset={3} lg={3} lgOffset={0}><Button className="submit" type="submit"><Glyphicon glyph="search"/></Button></Col>
            </form>
            or
            <form className="col-xs-12 in" onSubmit={this.loadOnboardingLogsBySenseIdOrEmail}>
                <Col xs={12} sm={6} smOffset={3} lg={3} lgOffset={0}><Input type="text" id="sense-id" placeholder="Sense ID / Email" /></Col>
                <Col xs={12} sm={6} smOffset={3} lg={3} lgOffset={0}><Input type="number" id="count" placeholder="limit" /></Col>
                <Col xs={12} sm={6} smOffset={3} lg={3} lgOffset={0}><Button className="submit" type="submit"><Glyphicon glyph="search"/></Button></Col>
            </form>

            <Col xs={12}>{this.state.onboardingInfo}</Col>

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
                selected={this.state.selectedId}
                onSelectionChange={this.onSelectionChange}
            />
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
