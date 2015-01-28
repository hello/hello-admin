/** @jsx React.DOM */

var jFileUpload = React.createClass({
    getInitialState: function() {
        return {alert: ""}
    },
    componentDidMount: function() {
        var url = "/pill_bin_upload", that = this, postRequestData = {}, thisDevice;
        var thisProgressBar = $('.progress-bar');
        $('#fileupload').fileupload({
            url: url,
            replaceFileInput: true,
            dataType: 'json',
            done: function (e, data) {
                console.log(data);
                $.each(data.result.files, function (index, file) {
                    thisDevice = file.pill_id;
                    that.setState({alert: "Successfully decrypted key for pill " + thisDevice});
                    postRequestData['device_id'] = thisDevice;
                    postRequestData['public_key'] = file.pill_key;
                    postRequestData['remark'] = $('#pill-remark-input').val();
                });
                $.ajax({
                    url: "api/pill_key_provision",
                    type: "POST",
                    dataType: 'json',
                    data: postRequestData,
                    success: function(response) {
                        console.log(response);
                        if (response.error === "") {
                            that.setState({alert: "Successfully stored key for pill " + thisDevice});
                        }
                        else {
                                that.setState({alert: "Error: " + response.error});
                        }
                        setTimeout(function(){thisProgressBar.css('width','0%');}, 1000);
                    }
                });

            },
            progressall: function (e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                thisProgressBar.css('width',progress + '%');
            }
        }).prop('disabled', !$.support.fileInput)
            .parent().addClass($.support.fileInput ? undefined : 'disabled');

    },
    render: function() {
         var alert = (this.state.alert === "") ? null:
            <Alert bsStyle="info">{this.state.alert}</Alert>;
        return(<Col xs={4} sm={4} md={4} xsOffset={2} smOffset={2} mdOffset={2}>
            <h3>Pill Key Provision</h3><hr className="fancy-line"/><br/>
            <p> Select ONE file by dragging here or browsing !</p><br/>
            <span className="btn btn-success fileinput-button">
                <i className="glyphicon glyphicon-plus"></i>
                <span> Browse ...</span>
                <input id="fileupload" type="file" name="files[]" multiple />
            </span>
            <br/>
            <br/>
            <div id="progress" className="progress">
                <div className="progress-bar progress-bar-success"></div>
            </div>
            <Input id="pill-remark-input" type="textarea" placeholder="Leave a remark (optional)"/>
            {alert}
            <br/>
        </Col>)
    }
});
React.renderComponent(<jFileUpload />, document.getElementById('pill-key-provision'));

function prepareMetadata(viewer, remark) {
    var metadata = {
        viewer: viewer,
        remark: remark,
        extraInfo: {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            viewedAt: new Date().toLocaleString()
        }
    };
    console.log(metadata);
    return JSON.stringify(metadata);
}