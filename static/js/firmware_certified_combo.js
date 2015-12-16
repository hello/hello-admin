var NewComboModal = React.createClass({
    handleSubmit: function() {
        var topFw = this.refs.topFw.getDOMNode().value;
        var middleFw = this.refs.middleFw.getDOMNode().value;

        if (!topFw.isWhiteString() && !middleFw.isWhiteString()) {
            var data = this.props.data.slice(0);
            data.push(topFw + "|" + middleFw);
            console.log(data);
            this.props.putFWCertifiedCombo(data);
            this.props.getFWCertifiedCombo();
        }

        return false;
    },
    render: function() {
        return <Modal animation={true}>
            <div className='modal-body'>
                <div className="modal-title">Add New Firmware Combo</div>
                <br/>
                <form onSubmit={this.handleSubmit}>
                    <input className="form-control" ref="topFw" placeholder="top firmware version"/>
                    <br/>
                    <input className="form-control" ref="middleFw" placeholder="middle firmware version"/>
                    <br/>
                    <Button className="submit-new" type="submit">Submit</Button>
                </form>
            </div>
            <div className='modal-footer'>
                <Button className="btn-round btn-fade" onClick={this.props.onRequestHide}>X</Button>
            </div>
        </Modal>;
    }
});

var FirmwareCertifiedCombo = React.createClass({
    getInitialState: function() {
        return {data: [], error: ""};
    },

    getFWCertifiedCombo: function() {
        $.ajax({
            url: "/api/firmware_certified_combo",
            type: "GET",
            success: function(response) {
                console.log(response);
                this.setState(response);
            }.bind(this)
        });
        return false;
    },

    putFWCertifiedCombo: function(combo) {
        $.ajax({
            url: "/api/firmware_certified_combo",
            type: "PUT",
            data: JSON.stringify(combo),
            success: function(response) {
                console.log(response);
            }.bind(this)
        });
        return false;
    },

    componentDidMount: function() {
        this.getFWCertifiedCombo();
    },

    removeElement: function(ele) {
        var updatedData = _.without(this.state.data, ele);
        this.putFWCertifiedCombo(updatedData);
        this.setState({data: updatedData});
    },

    render: function() {
        return <div>
            <ModalTrigger modal={<NewComboModal getFWCertifiedCombo={this.getFWCertifiedCombo} putFWCertifiedCombo={this.putFWCertifiedCombo}/>}>
                <Button><Glyphicon glyph="plus"/> New combination</Button>
            </ModalTrigger>
            <br/>
            <Table>
                <thead><tr>
                    <th>Top Firmware Version</th>
                    <th>Middle Firmware Version</th>
                    <th>Action</th>
                </tr></thead>
                <tbody>{
                    this.state.data.map(function(d){
                        var topFw = d.split("|")[0];
                        var middleFw = d.split("|")[1];
                        return <tr>
                            <td>{topFw}</td>
                            <td>{middleFw}</td>
                            <td><Button onClick={this.removeElement.bind(this, d)}><Glyphicon glyph="trash" /></Button></td>
                        </tr>
                    }.bind(this))
                }</tbody>
            </Table>
            <ModalTrigger modal={<NewComboModal getFWCertifiedCombo={this.getFWCertifiedCombo} putFWCertifiedCombo={this.putFWCertifiedCombo} data={this.state.data}/>}>
                <Button><Glyphicon glyph="plus"/> New combination</Button>
            </ModalTrigger>

        </div>;
    }
});

React.render(<FirmwareCertifiedCombo />, document.getElementById("firmware-certified-combo"));