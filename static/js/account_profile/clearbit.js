/** @jsx React.DOM */

var ClearbitInfo = React.createClass({
    render: function() {
        var clearbit = this.props.clearbit;
        var clearbitDetail = [];
        if (!$.isEmptyObject(clearbit) && clearbit.error) {
            clearbitDetail = JSON.stringify(clearbit.error);
        }
        else if (clearbit !== [] && !$.isEmptyObject(clearbit)) {

            if (clearbit.employment.domain !== null) {
                clearbitDetail.push(clearbit.employment.name ? <tr><td>Employer</td><td>{clearbit.employment.name}</td></tr> : null);
                clearbitDetail.push(clearbit.employment.domain ? <tr><td>Domain</td><td>{clearbit.employment.domain}</td></tr> : null);
                clearbitDetail.push(clearbit.employment.title ? <tr><td>Title</td><td>{clearbit.employment.title}</td></tr> : null);
            }

            if (clearbit.github.handle !== null) {
                clearbitDetail.push(clearbit.github.handle ? <tr><td>Github</td><td><a target="_blank" href={"https://github.com/" + clearbit.github.handle}>{clearbit.github.handle}</a></td></tr> : null);
                clearbitDetail.push(clearbit.github.followers ? <tr><td>Followers</td><td>{numberWithCommas(clearbit.github.followers)}</td></tr> : null);
                clearbitDetail.push(clearbit.github.company ? <tr><td>Company</td><td>{clearbit.github.company}</td></tr> : null);
                clearbitDetail.push(clearbit.github.blog ? <tr><td>Blog</td><td>{clearbit.github.blog}</td></tr> : null);
            }

            if (clearbit.twitter.handle !== null) {
                clearbitDetail.push(clearbit.twitter.handle ? <tr><td>Twitter</td><td><a target="_blank" href={"https://twitter.com/" + clearbit.twitter.handle}>{clearbit.twitter.handle}</a></td></tr> : null);
                clearbitDetail.push(clearbit.twitter.followers ? <tr><td>Followers</td><td>{numberWithCommas(clearbit.twitter.followers)}</td></tr> : null);
                clearbitDetail.push(clearbit.twitter.site ? <tr><td>Company</td><td>{clearbit.twitter.site}</td></tr> : null);
                clearbitDetail.push(clearbit.twitter.blog ? <tr><td>Blog</td><td>{clearbit.twitter.blog}</td></tr> : null);
            }

            if (clearbit.linkedin.handle !== null) {
                clearbitDetail.push(clearbit.linkedin.handle ? <tr><td>Linkedin</td><td><a target="_blank" href={"https://linkedin.com/" + clearbit.linkedin.handle}>{clearbit.linkedin.handle}</a></td></tr> : null);
            }

            if (clearbit.angellist.handle !== null) {
                clearbitDetail.push(clearbit.angellist.handle ? <tr><td>AngelList</td><td><a target="_blank" href={"https://angel.co/" + clearbit.angellist.handle}>{clearbit.angellist.handle}</a></td></tr> : null);
                clearbitDetail.push(clearbit.angellist.followers ? <tr><td>Followers</td><td>{numberWithCommas(clearbit.angellist.followers)}</td></tr> : null);
                clearbitDetail.push(clearbit.angellist.bio ? <tr><td>Bio</td><td>{clearbit.angellist.bio}</td></tr> : null);
                clearbitDetail.push(clearbit.angellist.blog ? <tr><td>Blog</td><td>{clearbit.angellist.blog}</td></tr> : null);
                clearbitDetail.push(clearbit.angellist.site ? <tr><td>Site</td><td>{clearbit.angellist.site}</td></tr> : null);
            }

            if (clearbit.geo.city !== null) {
                clearbitDetail.push(clearbit.geo.lat && clearbit.geo.lng ? <tr><td>Location</td><td><a target="_blank" href={"https://www.google.com/maps/@" + clearbit.geo.lat + "," + clearbit.geo.lng}>{clearbit.geo.lat + "," + clearbit.geo.lng}</a></td></tr> : null);
                clearbitDetail.push(clearbit.geo.city ? <tr><td>City</td><td>{clearbit.geo.city}</td></tr> : null);
                clearbitDetail.push(clearbit.geo.state ? <tr><td>State</td><td>{clearbit.geo.state}</td></tr> : null);
            }
        }

        return <Table>
            <thead/>
            <tbody>
                {clearbitDetail}
            </tbody>
        </Table>
    }
});

var ClearbitTile = React.createClass({
    getInitialState: function() {
        return {
            clearbit: {}
        }
    },
    loadClearbitProfileByEmail : function() {
        var email = this.props.email;
        console.log("email is ", email);
        if (email) {
            $.ajax({
                url: "/api/clearbit/",
                dataType: "json",
                type: 'GET',
                data: {email: email},
                success: function (response) {
                    if (response.error.isWhiteString() || response.error == 'OK'){
                        this.setState({clearbit : response.data});
                        console.log('clearbit', response.data);
                    }
                    else {
                        this.setState({clearbit: {}});
                    }
                }.bind(this)
            });
        }
        else {
            this.setState({clearbit: {}});
        }
    },

    componentDidMount: function() {
        this.loadClearbitProfileByEmail();
    },

    render: function() {
        return <div>
            <br/><br/>
            <ClearbitInfo clearbit={this.state.clearbit} />
        </div>
    }
});

var ClearbitModal = React.createClass({
    render: function() {
        return <Modal animation={true}>
            <div className='modal-header row'>
                <Col xs={10} className="modal-title">Clearbit Information</Col>
                <Col xs={2} className="right-wrapper"><Button bsSize="xsmall" class="modal-close" onClick={this.props.onRequestHide}>x</Button></Col>
            </div>
            <div className='modal-body'>
                <ClearbitTile email={this.props.email} />
            </div>
            <div className='modal-footer'>
                <Button className="btn-round" onClick={this.props.onRequestHide}>X</Button>
            </div>
        </Modal>;
    }
});


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}