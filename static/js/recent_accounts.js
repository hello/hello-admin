var RecentAccounts = React.createClass({
    getInitialState: function() {
        return {
            data: [], filteredData: [], error: "", limit: 500,
            columns: [
                {name: "id", title: <Glyphicon glyph="barcode"/>, width: 60, textAlign: "center"},
                {name: "email", title: <Glyphicon glyph="envelope"/>},
                {name: "name", title: <Glyphicon glyph="user"/>},
                {name: "last_modified", title: <Glyphicon glyph="time"/>, width: 120}
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
    },
    handleSortChange: function(sortInfo){
        console.log(sortInfo);
	},
	handleColumnOrderChange: function (index, dropIndex){
        var columns = this.state.columns;
		var col = columns[index];
		columns.splice(index, 1);
		columns.splice(dropIndex, 0, col);
		this.setState({columns: columns});
	},
    handleColumnResize: function(firstCol, firstSize, secondCol, secondSize){
	    firstCol.width = firstSize;
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
                return (item[name].toString()).toLowerCase().indexOf(columnFilter)  > -1;
    		});
        }.bind(this));
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
                onColumnOrderChange={this.handleColumnOrderChange}
                onColumnResize={this.handleColumnResize}
                onSortChange={this.handleSortChange}
                style={{height: "85vh", border: "1px solid rgb(194, 194, 245)"}}
                emptyText={this.state.error}
                showCellBorders={true}
                loading={this.state.loading}
                loadMaskOverHeader={false}
                onFilter={this.handleFilter}
                liveFilter={true}
            />
        </Col>
	}
});

var AccountBreakdown = React.createClass({
    getInitialState: function() {
        return {loading: false, data: [], error: ""}
    },
    componentDidMount: function() {
        this.loadAccountCountsByCreatedDate();
        this.generateGraph();
    },
    loadAccountCountsByCreatedDate: function() {
        this.setState({loading: true, data: [], error: ""});
        $.ajax({
            url: '/api/account_breakdown',
            dataType: 'json',
            data: {limit: 50},
            type: 'GET',
            success: function(response) {
                if (response.error.isWhiteString()) {
                    this.setState({error: "", data: response.data.reverse().slice(0,30), loading: false});
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
                }
            },
            axis: {
                x: {
                    tick: {
                        format: function (x) {
                            return d3.time.format("%d %b %Y")(new Date(x));
                        }
                    }
                },
                rotated: true
            },
            bar: {
                width: {
                    ratio: 0.1
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
        d.last_modified = d3.time.format("%b %d %H:%M")(new Date(d.last_modified));
        return d;
    });
}

function mapKeysToColumns(keys) {
    var aliases = {
        id: "#"
    };
    var widths = {
        id: 50
    };
    return keys.map(function(k){
        var columnDetail = {name: k};
        if (aliases[k]){
            columnDetail.title = aliases[k]
        }
        if (widths[k]) {
            columnDetail.width = widths[k]
        }
        return columnDetail;
    })
}

