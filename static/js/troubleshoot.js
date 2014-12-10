/** @jsx React.DOM */
var TroubleshootTableHeaders = React.createClass({
    render: function() {
        var headers = [];
        if (this.props.data.length > 0) {
          Object.keys(this.props.data[0]).forEach(function(header){
            if (header == "max_ts") {
              header = "Inactive Period"
            }
            headers.push(<th className="alert-success">{header}</th>)
          });
        }

        return (<thead><tr>
            {headers}
        </tr></thead>)
    }
});

var TroubleshootTableBody = React.createClass({
    render: function() {
        var rows = [];
        if (this.props.data.length > 0) {
          this.props.data.forEach(function(device) {
            var cells = [];
            $.each(device, function(attr, val){
              if (attr == "max_ts") {
                val = millisecondsToHumanReadableString(val);
              }
              cells.push(<td>{val}</td>);
            });
            rows.push(<tr>{cells}</tr>);
          });
        }
        return (<tbody>
            {rows}
        </tbody>)
    }
});

var Pagination = React.createClass({
    updatePage: function(newPage) {
        this.props.parent.setState({currentPage: newPage});
    },
    componentDidMount: function() {
        var that = this;
        $('.changePage').click(function(){
           that.updatePage(Number($(this).text()));
        });
        $('.nextPage').click(function(){
            if (that.props.totalPage >= that.props.currentPage + 1) {
                that.updatePage(that.props.currentPage + 1);
            }
        });
        $('.prevPage').click(function(){
            if (that.props.currentPage > 1) {
                that.updatePage(that.props.currentPage - 1);
            }
        });
    },
    render: function() {
        var menuItems = [];
        for (var j = 1; j<=this.props.totalPage; j++){
            menuItems.push(<MenuItem className="changePage" eventKey={j}>{j}</MenuItem>);
        }
        return (
            <Pager>
              <PageItem className="prevPage" previous>&larr; Previous Page</PageItem>
              <DropdownButton title={"Page " + this.props.currentPage + "/" + this.props.totalPage}>
                {menuItems}
              </DropdownButton>
              <PageItem className="nextPage" next>Next Page &rarr;</PageItem>
            </Pager>
        )
    }
});

var TroubleshootMaestro = React.createClass({
    getInitialState: function() {
        return {
            data: [],
            totalPage: 1,
            currentPage: Number(getParameterByName('page')) || 1
        }
    },
    componentDidMount: function() {
        $.ajax({
          url: '/api/troubleshoot',
          dataType: 'json',
          contentType: 'application/json',
          type: 'GET',
          success: function(response) {
            console.log(response);
            this.setState({data: response.data});
          }.bind(this),
          error: function(e) {
            console.error(e);
          }.bind(this)
        });
        $('.tablesorter').tablesorter();
//            sortList: [[2, 1]] // by default sort the 2nd column (days since last seen) DESC
//        });
    },
    render: function() {
        console.log(this.state);
        history.pushState({}, '', '/troubleshoot/?page=' + this.state.currentPage);
        return (<code className="nonscript"><table className="table table-bordered tablesorter">
            <div>Still working mapping device id --> username</div>
            <Pagination parent={this} currentPage={this.state.currentPage} totalPage={this.state.totalPage}/>
            <TroubleshootTableHeaders data={this.state.data}/>
            <TroubleshootTableBody data={this.state.data}/>
        </table></code>)
    }
});

React.renderComponent(<TroubleshootMaestro />, document.getElementById('troubleshoot'));