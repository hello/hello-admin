/** @jsx React.DOM */

var FileExporter = React.createClass({
    getDefaultProps: function(){
        return {
            fileContent: "",
            icon: "cloud-download",
            buttonName: "JSON",
            fileName: "export.json"
        }
    },
    render: function(){
        return <a className="export" download={this.props.fileName} target="_blank"
                href={"data:application/json;charset=utf-8," + encodeURI(JSON.stringify(this.props.fileContent))}>
                <Glyphicon glyph={this.props.icon}/> {this.props.buttonName}
            </a>;
    }
});

