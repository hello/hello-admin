var RecentAccounts = React.createClass({
    getInitialState: function() {
        return {
            data: [], filteredData: [], error: "", limit: 500,
            columns: [
                {name: "id", title: <Glyphicon glyph="barcode"/>, width: 90},
                {name: "accountEmail", title: <Glyphicon glyph="envelope"/>},
                {name: "name", title: <Glyphicon glyph="user"/>, width: 145},
                {name: "lastModified", title: <Glyphicon glyph="time"/>, width: 115}
            ],
            loading: false
        };
    },
    loadRecentAccounts: function() {
        this.setState({loading: true, data: [], filteredData: [], error: ""});
        $.ajax({
            url: '/api/recent_users',
            dataType: 'json',
            data: {limit: this.state.limit},
            type: 'GET',
            success: function(response) {
                if (response.error.isWhiteString()) {
                    var mappedData = mapAccountInfo(response.data);
                    this.setState({error: "", data: mappedData, filteredData: mappedData, loading: false});
                }
                else {
                    this.setState({data: [], filteredData: [], error: response.error, loading: false});
                }
            }.bind(this)
        });
        return false;
    },
    componentDidMount: function() {
        this.loadRecentAccounts();
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
            case "id": this.setState({sortInfo: sortInfo, data: sortInfo[0].dir === 1 ? this.state.data.sort(compareId) : this.state.data.sort(compareId).reverse()}); break;
            case "name": this.setState({sortInfo: sortInfo, data: sortInfo[0].dir === 1 ? this.state.data.sort(compareName) : this.state.data.sort(compareName).reverse()}); break;
            case "accountEmail": this.setState({sortInfo: sortInfo, data: sortInfo[0].dir === 1 ? this.state.data.sort(compareEmail) : this.state.data.sort(compareEmail).reverse()}); break;
            case "lastModified": this.setState({sortInfo: sortInfo, data: sortInfo[0].dir === 1 ? this.state.data.sort(compareLastModified) : this.state.data.sort(compareLastModified).reverse()}); break;
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
            if (name === "accountEmail") {name = "email";}
    		filteredData = filteredData.filter(function(item){
                return (item[name].toString()).toLowerCase().indexOf(columnFilter)  > -1;
    		});
        });
        console.log(filteredData);
        this.setState({filteredData: filteredData});
	},
    reload: function(){
		this.refs.grid.reload()
	},
    render: function(){
		return <Col xs={7}>
            <h3>Recently Modified</h3>
            <DataGrid
                ref="grid"
                idProperty='id'
                dataSource={this.state.filteredData}
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
	}
});

var AccountBreakdown = React.createClass({
    getInitialState: function() {
        return {loading: false, data: [], error: "", limit: 30}
    },
    componentDidMount: function() {
        this.loadAccountCountsByCreatedDate();
    },

    loadAccountCountsByCreatedDate: function() {
        this.setState({loading: true, data: [], error: ""});
        $.ajax({
            url: '/api/account_breakdown',
            dataType: 'json',
            type: 'GET',
            success: function(response) {
                if (response.error.isWhiteString()) {
                    this.setState({error: "", data: response.data.slice(0, this.state.limit), loading: false});
                }
                else {
                    this.setState({data: [], error: response.error, loading: false});
                }
            }.bind(this)
        });
        return false;
    },
    generateGraph: function() {
        c3.generate({
            bindto: "#breakdown-chart",
            data: {
                type: "bar",
                json: this.state.data,
                keys: {
                    x: "createdDate",
                    value: ["count"]
                },
                colors: {
                    count: "#7DF9FF"
                },
                color: function (color, d) {
                    return d.id && d.id === 'count' ? d3.rgb(color).darker(d.value / 300) : color;
                }
            },
            axis: {
                x: {
                    tick: {
                        format: function (x) {
                            return d3.time.format("%b %d")(new Date(x));
                        }
                    }
                },
                rotated: true
            },
            bar: {
                width: {
                    ratio: 0.5
                }
            },
            grid: {
              y: {
                  show: false
              }
            },
            zoom: {
                enabled: true
            },
            legend: {
                position: "right",
                show: false
            }
        });
    },
    render: function() {
        this.generateGraph();
        return (<Col xs={5}>
            <h3>New Accounts History</h3>
            <div id="breakdown-chart" className="c3-chart"></div>
        </Col>);
    }
});

React.render(<RecentAccounts/>, document.getElementById("recent-accounts"));
React.render(<AccountBreakdown/>, document.getElementById("account-breakdown"));


function mapAccountInfo(data) {
    return data.map(function(d){
        d.lastModified = d3.time.format("%b %d %H:%M")(new Date(d.last_modified));
        d.accountEmail = <a target="_blank" href={"/account_profile/?account_input="+ d.email}>{d.email}</a>;
        return d;
    });
}

function compareId(e1, e2) {
    return e1.id - e2.id;
}

function compareName(e1, e2) {
    if (e1.name < e2.name) {
        return -1;
    }
    if (e1.name > e2.name) {
        return 1;
    }
    return 0;
}

function compareEmail(e1, e2) {
    if (e1.email < e2.email) {
        return -1;
    }
    if (e1.email > e2.email) {
        return 1;
    }
    return 0;
}

function compareLastModified(e1, e2) {
    return e1.last_modified - e2.last_modified;
}