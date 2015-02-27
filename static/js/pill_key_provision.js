/** @jsx React.DOM */

var jFileUpload = React.createClass({
    getInitialState: function() {
        return {alert: []}
    },
    componentDidMount: function() {
        var url = "/pill_bin_upload", that = this;
        var thisProgressBar = $('.progress-bar');

        $('#fileupload').fileupload({
            url: url,
            replaceFileInput: true,
            dataType: 'json',
            done: function (e, data) {
                $.each(data.result.files, function (index, file) {
                    if (file.pill_id !== null) {
                        var postRequestData = {};
                        console.log(file.pill_id, file.pill_key);
//                        that.setState({alert: "Successfully decrypted key for pill " + file.pill_id});
                        postRequestData['device_id'] = file.pill_id;
                        postRequestData['public_key'] = file.pill_key;
                        postRequestData['remark'] = $('#pill-remark-input').val();

                        $.ajax({
                            url: "api/pill_key_provision",
                            type: "POST",
                            dataType: 'json',
                            data: postRequestData,
                            success: function (response) {
                                console.log(response);
                                if (response.error === "") {
                                    that.setState({alert: that.state.alert.concat({
                                        file: file.name,
                                        pill: file.pill_id,
                                        status: "success",
                                        statusColor: "default"
                                    })});
                                }
                                else {
                                    that.setState({alert: that.state.alert.concat({
                                        file: file.name,
                                        pill: file.pill_id,
                                        status: "decrypted but not stored because " + response.error,
                                        statusColor: "danger"
                                    })});
                                }
                                setTimeout(function () {
                                    thisProgressBar.css('width', '0%');
                                }, 1000);
                            }
                        });
                    }
                    else {
                        that.setState({alert: that.state.alert.concat({
                            file: file.name,
                            pill: "n/a",
                            status: "sha do not match",
                            statusColor: "danger"
                        })});
                    }
                });
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var serverError = XMLHttpRequest.responseText.split("h1>").last().split("<")[0];
                that.setState({alert: serverError});
            },
            progressall: function (e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                thisProgressBar.css('width',progress + '%');
            }
        }).prop('disabled', !$.support.fileInput)
            .parent().addClass($.support.fileInput ? undefined : 'disabled');

    },
    render: function() {
        var alert = null;
        if (this.state.alert.length > 0) {
            alert = <Table bordered id="bulk-pill-provision-results">
                    <thead><tr>
                        <th className="alert-info">File</th>
                        <th className="alert-info">Pill</th>
                        <th className="alert-info">Status</th>
                    </tr></thead>
                    <tbody>
                        {this.state.alert.reverse().map(function(t){return <tr>
                            <td className={t.statusColor}>{t.file}</td>
                            <td className={t.statusColor}> {t.pill === "n/a" ? "n/a":
                                <a href={"/key_store/?device="+t.pill+"&type=pill"} target="_blank">{t.pill}</a>}
                            </td>
                            <td className={t.statusColor}>{t.status}</td>
                        </tr>})}
                    </tbody>
                </Table>;
        }

        return(<Col xs={7} sm={7} md={7} lg={7} xl={7} xsOffset={1} smOffset={1} mdOffset={1} lgOffset={1} xlOffset={1}>
            <h3>Pill Key Provision</h3><hr className="fancy-line"/><br/>
            <p> Select one or multiple files by dragging here or browsing !</p><br/>
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