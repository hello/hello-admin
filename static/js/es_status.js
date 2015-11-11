var DISK_CAP_SIZE = 64; //Gb;

var ESStatus = React.createClass({
    getInitialState: function() {
        return {
            data: [],
            totalDocsCount: 0,
            totalSize: 0,
            zoomable: false,
            chartType: "bar",
            alert: <Alert>Loading</Alert>
        }
    },

    loadData: function() {
        this.setState(this.getInitialState());
        $.ajax({
            url: "/api/es_status",
            type: "GET",
            dataType: "json",
            success: function(response) {
                console.log(response);
                if (response.error.isWhiteString()){
                    var data = extractIndicesInfo(response.data);
                    this.setState({
                        data: data, alert: null,
                        totalDocsCount: data.map(function(z){return z.docsCount;}).reduce(function(x,y){return x+y;}),
                        totalSize: data.map(function(z){return z.size;}).reduce(function(x,y){return x+y;})
                    });
                }
                else {
                    this.setState({alert: <Alert>{response.error}</Alert>, totalDocsCount: 0, totalSize: 0});
                }
            }.bind(this)
        });
    },

    componentDidMount: function() {
        this.loadData();
    },

    generateGraph: function() {
        var that = this;
        c3.generate({
            bindto: "#es-status-graph",
            data: {
                type: "bar",
                json: this.state.data,
                keys: {
                    x: "indexName",
                    value: ["docsCount", "size"]
                },
                colors: {
                    count: "#7DF9FF"
                }
            },
            axis: {
                x: {
                    type : 'category',
                    tick: {
                        format: function (i) {
                            console.log(i);
                            return d3.time.format.utc('%b %d, %Y')(new Date(that.state.data[i].indexName.split("sense-logs-")[1]));
                        }
                    },
                    label: {
                        text: 'DATE',
                        position: "outer center"
                    }

                },
                rotated: false
            },
            bar: {
                width: {
                    ratio: 0.2
                }
            },
            grid: {
              y: {
                  show: false
              }
            },
            zoom: {
                enabled: this.state.zoomable
            },
            legend: {
                position: "right",
                show: true
            },
            tooltip: {
                format: {
                    title: function (i) {
                        return that.state.data[i].indexName;
                    },
                    value: function (value) {
                        return numberWithCommas(value);
                    }
                }
            }
        });
    },

    render: function() {
        this.generateGraph();
        return (<div>
            <h3>ES Index Status</h3>
            {this.state.alert}
            <Col xs={3} xsOffset={1}>&Sigma;docs = {numberWithCommas(this.state.totalDocsCount)}</Col>
            <Col xs={3} xsOffset={7}>&Sigma;bytes = {numberWithCommas(this.state.totalSize)} ({(this.state.totalSize/(DISK_CAP_SIZE*Math.pow(10, 7))).toFixed(2)}%)</Col>
            <div id="es-status-graph" className="c3-chart"></div>

        </div>)
    }
});
React.render(<ESStatus />, document.getElementById("es-status"));
var extractIndicesInfo = function(data) {
    return Object.keys(data.indices)
        .filter(function(indexName){
            return indexName.startsWith("sense-logs") && !indexName.endsWith("fallback");
        })
        .map(function(indexName){
            return{
                indexName: indexName,
                docsCount: data.indices[indexName].docs.max_doc,
                size: data.indices[indexName].index.size_in_bytes
            }
        })
        .sort(function(d1, d2){
             return new Date(d1.indexName.split("sense-logs-")[1]).getTime()
                  - new Date(d2.indexName.split("sense-logs-")[1]).getTime();
        });
};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}