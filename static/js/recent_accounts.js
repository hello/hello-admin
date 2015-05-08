var RecentAccounts = React.createClass({
    getInitialState: function() {
        return {
            data: [], error: "",
            columns: [
                {name: "id", title: <Glyphicon glyph="barcode"/>, width: 45, textAlign: "center"},
                {name: "email"},
                {name: "name"},
                {name: "gender", width: 60, textAlign: "center"},
                {name: "height", width: 60, textAlign: "center"},
                {name: "weight", width: 60, textAlign: "center"},
                {name: "dob", title: "Date of Birth", textAlign: "center"},
                {name: "lastModified", title: "Last Modified", textAlign: "center"}
            ]
        };
    },
    loadRecentAccounts: function() {
        $.ajax({
            url: '/api/recent_users',
            dataType: 'json',
            data: {limit: 50},
            type: 'GET',
            success: function(response) {
                if (response.error.isWhiteString()) {
                    this.setState({error: "", data: response.data});
                }
                else {
                    this.setState({data: [], error: response.error});
                }
            }.bind(this)
        });
        return false;
    },
    componentDidMount: function() {
        this.loadRecentAccounts();
    },
	render: function(){
        console.log(this.state);
		return <Col xs={9}><DataGrid
			idProperty='id'
			dataSource={this.state.data}
			columns={this.state.columns}
			style={{height: 500}}
			withColumnMenu={true}
            onColumnOrderChange={this.handleColumnOrderChange}
            onColumnResize={this.handleColumnResize}
            style={{height: "50vh"}}
            emptyText={this.state.error}
		/></Col>
	},
    handleSortChange: function(sortInfo){
		//to be written
	},
	handleColumnOrderChange: function (index, dropIndex){
        var columns = this.state.columns;
		var col = columns[index];
		columns.splice(index, 1); //delete from index, 1 item
		columns.splice(dropIndex, 0, col);
		this.setState({columns: columns});
	},
    handleColumnResize: function(firstCol, firstSize, secondCol, secondSize){
	    firstCol.width = firstSize;
	    this.setState({})
	},
    handleFilter: function(column, value, allFilterValues){
		//reset data to original data-array
	    var data = this.state.data;

	    //go over all filters and apply them
    	Object.keys(allFilterValues).forEach(function(name){
    		var columnFilter = (allFilterValues[name] + '').toUpperCase();

    		if (columnFilter == ''){
    			return
    		}

    		data = data.filter(function(item){
    		    if ((item[name] + '').toUpperCase().indexOf(columnFilter) === 0){
    		        return true
    		    }
    		})
    	});

	    this.setState({})
	}
});


function mapKeysToColumns(keys) {
    // useful when the
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

React.render(<RecentAccounts/>, document.getElementById("recent-accounts"));