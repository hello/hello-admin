/** @jsx React.DOM */

var FileExporter = React.createClass({
    getDefaultProps: function(){
        return {
            fileContent: "",
            icon: "cloud-download",
            buttonName: "JSON",
            fileName: "export.json",
            dataType: "data:application/json;charset=utf-8,",
            needStringify: true
        }
    },
    render: function(){
        var content = this.props.needStringify ? encodeURI(JSON.stringify(this.props.fileContent)) : encodeURI(this.props.fileContent);
        return <a className="export" download={this.props.fileName} target="_blank"
                href={this.props.dataType + content}>
                <Glyphicon glyph={this.props.icon}/> {this.props.buttonName}
            </a>;
    }
});

