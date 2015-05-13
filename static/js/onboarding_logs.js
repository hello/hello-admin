var OnboardingLogs = React.createClass({
    getInitialState: function() {
        return {
            data: [], error: "", limit: 10000,
            columns: [
                {name: "ts_millis", title: "Timestamp", width: "100px"},
                {name: "sense_id", title: "Sense", width: "110px"},
                {name: "pill_id", title: "Pill", width: "110px"},
                {name: "account_id", title: "Account", width: "100px"},
                {name: "result", title: "Result", width: "100px"},
                {name: "action", title: "Action", width: "100px"},
                {name: "ip", title: "IP Address", width: "100px"},
                {name: "info", title: "Info"}
            ],
            loading: false
        };
    },

    loadOnboardingLogsByResult: function() {
        var that = this;
        $.ajax({
            url: "/api/onboarding_logs_by_result",
            dataType: 'json',
            type: 'GET',
            async: false,
            data: {
                result: $("#result").val(),
                start_millis: new Date($("#start-time").val()).getTime(),
                end_millis: new Date($("#end-time").val()).getTime()
            },
            success: function(response) {
                console.log(response);
                if (response.error.isWhiteString()) {
                    that.setState({data: manipulateData(response.data)})
                }
            }
        });
        return false;
    },

    loadOnboardingLogsBySenseId: function() {
        var that = this;
        $.ajax({
            url: "/api/onboarding_logs_by_sense_id",
            dataType: 'json',
            type: 'GET',
            async: false,
            data: {
                sense_id: $("#sense-id").val(),
                count: $("#count").val()
            },
            success: function(response) {
                console.log(response);
                if (response.error.isWhiteString()) {
                    that.setState({data: manipulateData(response.data)})
                }
            }
        });
        return false;
    },

    componentDidMount: function() {
        var filters = $(".z-show-filter");
        filters.children().remove();
        filters.append('<button><span class="glyphicon glyphicon-filter"></span>');
    },

    handleSortChange: function(sortInfo){
        if (sortInfo.length === 0){
            this.setState({sortInfo: sortInfo});
            return null;
        }
        switch(sortInfo[0].name){
            case "ts_millis": this.setState({sortInfo: sortInfo, data: sortInfo[0].dir === 1 ? this.state.data.sort(compareId) : this.state.data.sort(compareId).reverse()}); break;
            case "name": this.setState({sortInfo: sortnfo, data: sortInfo[0].dir === 1 ? this.state.data.sort(compareName) : this.state.data.sort(compareName).reverse()}); break;
            case "accountEmail": this.setState({sortInfo: sortInfo, data: sortInfo[0].dir === 1 ? this.state.data.sort(compareEmail) : this.state.data.sort(compareEmail).reverse()}); break;
            case "ts_millis": this.setState({sortInfo: sortInfo, data: sortInfo[0].dir === 1 ? this.state.data.sort(compareLastModified) : this.state.data.sort(compareLastModified).reverse()}); break;
            default: return null;
        }
	},
	handleColumnOrderChange: function (index, dropIndex){
        var columns = this.state.columns;
		var col = columns[index];
		columns.splice(index, 1);
		columns.splice(dropIndex, 0, col);
		this.setState({columns: columns});
	},
    handleColumnResize: function(firstCol, firstSize, secondCol, secondSize){
	    this.setState({})
	},
    handleFilter: function(column, value, allFilterValues){
	    var filteredData = this.state.data;
    	Object.keys(allFilterValues).forEach(function(name){
            console.log(allFilterValues);
    		var columnFilter = (allFilterValues[name].toString()).toLowerCase();
    		if (columnFilter == ''){
    			return
    		}
    		filteredData = filteredData.filter(function(item){
                return (item[name].toString()).toLowerCase().indexOf(columnFilter)  > -1;
    		});
        });
        console.log(filteredData);
        this.setState({data: filteredData});
	},
    reload: function(){
		this.refs.grid.reload()
	},
    render: function(){
		return <div>
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
                <Col xs={2}><Input type="text" id="sense-id"/></Col>
                <Col xs={2}><Input type="text" id="count"/></Col>
                <Col xs={1}><Button type="submit"><Glyphicon glyph="search"/></Button></Col>
            </form>
            <Row>
                <Col xs={12}>
                    <h3>Onboarding Logs</h3>
                    <hr className="fancy-line"/>
                    <DataGrid
                        ref="grid"
                        idProperty='id'
                        dataSource={this.state.data}
                        columns={this.state.columns}
                        style={{height: 500}}
                        withColumnMenu={true}
                        onColumnResize={this.handleColumnResize}
                        onSortChange={this.handleSortChange}
                        style={{height: "81vh", border: "1px solid rgb(194, 194, 245)"}}
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
        d.ts_millis = d3.time.format("%b %d %H:%M")(new Date(d.ts_millis));
        return d;
    });
}