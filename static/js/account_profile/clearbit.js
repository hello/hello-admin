/** @jsx React.DOM */

var ClearbitInfo = React.createClass({
    render: function() {
        var clearbit = this.props.clearbit;
        var clearbitDetail = null;
        if (!$.isEmptyObject(clearbit) && clearbit.error) {
            clearbitDetail = JSON.stringify(clearbit.error);
        }
        else if (clearbit !== [] && !$.isEmptyObject(clearbit)) {
            clearbitDetail = [];
            if (clearbit.employment.domain !== null) {
                clearbitDetail.push(<Table>
                    <thead><tr><th/><th/></tr></thead>
                    <tbody>
                        {clearbit.employment.name ? <tr><td>Employer</td><td>{clearbit.employment.name}</td></tr> : null}
                        {clearbit.employment.domain ? <tr><td>Domain</td><td>{clearbit.employment.domain}</td></tr> : null}
                        {clearbit.employment.title ? <tr><td>Title</td><td>{clearbit.employment.title}</td></tr> : null}
                        <tr><td/><td/></tr>
                    </tbody>
                </Table>);
            }
            if (clearbit.github.handle !== null) {
                clearbitDetail.push(<Table>
                    <thead><tr><th/><th/></tr></thead>
                    <tbody>
                        {clearbit.github.handle ? <tr><td>Github</td><td><a target="_blank" href={"https://github.com/" + clearbit.github.handle}>{clearbit.github.handle}</a></td></tr> : null}
                        {clearbit.github.followers ? <tr><td>Followers</td><td>{numberWithCommas(clearbit.github.followers)}</td></tr> : null}
                        {clearbit.github.company ? <tr><td>Company</td><td>{clearbit.github.company}</td></tr> : null}
                        {clearbit.github.blog ? <tr><td>Blog</td><td>{clearbit.github.blog}</td></tr> : null}
                        <tr><td/><td/></tr>
                    </tbody>
                </Table>);
            }
            if (clearbit.twitter.handle !== null) {
                clearbitDetail.push(<Table>
                    <thead><tr><th/><th/></tr></thead>
                    <tbody>
                        {clearbit.twitter.handle ? <tr><td>Twitter</td><td><a target="_blank" href={"https://twitter.com/" + clearbit.twitter.handle}>{clearbit.twitter.handle}</a></td></tr> : null}
                        {clearbit.twitter.followers ? <tr><td>Followers</td><td>{numberWithCommas(clearbit.twitter.followers)}</td></tr> : null}
                        {clearbit.twitter.site ? <tr><td>Company</td><td>{clearbit.twitter.site}</td></tr> : null}
                        {clearbit.twitter.blog ? <tr><td>Blog</td><td>{clearbit.twitter.blog}</td></tr> : null}
                        <tr><td/><td/></tr>
                    </tbody>
                </Table>);
            }
            if (clearbit.linkedin.handle !== null) {
                clearbitDetail.push(<Table>
                    <thead><tr><th/><th/></tr></thead>
                    <tbody>
                        {clearbit.linkedin.handle ? <tr><td>Linkedin</td><td><a target="_blank" href={"https://linkedin.com/" + clearbit.linkedin.handle}>{clearbit.linkedin.handle}</a></td></tr> : null}
                        <tr><td/><td/></tr>
                    </tbody>
                </Table>);
            }
            if (clearbit.angellist.handle !== null) {
                clearbitDetail.push(<Table>
                    <thead><tr><th/><th/></tr></thead>
                    <tbody>
                        {clearbit.angellist.handle ? <tr><td>AngelList</td><td><a target="_blank" href={"https://angel.co/" + clearbit.angellist.handle}>{clearbit.angellist.handle}</a></td></tr> : null}
                        {clearbit.angellist.followers ? <tr><td>Followers</td><td>{numberWithCommas(clearbit.angellist.followers)}</td></tr> : null}
                        {clearbit.angellist.bio ? <tr><td>Bio</td><td>{clearbit.angellist.bio}</td></tr> : null}
                        {clearbit.angellist.blog ? <tr><td>Blog</td><td>{clearbit.angellist.blog}</td></tr> : null}
                        {clearbit.angellist.site ? <tr><td>Site</td><td>{clearbit.angellist.site}</td></tr> : null}
                    </tbody>
                </Table>);
            }
            if (clearbit.geo.city !== null) {
                clearbitDetail.push(<Table>
                    <thead><tr><th/><th/></tr></thead>
                    <tbody>
                        {clearbit.geo.lat && clearbit.geo.lng ? <tr><td>Location</td><td><a target="_blank" href={"https://www.google.com/maps/@" + clearbit.geo.lat + "," + clearbit.geo.lng}>{clearbit.geo.lat + "," + clearbit.geo.lng}</a></td></tr> : null}
                        {clearbit.geo.city ? <tr><td>City</td><td>{clearbit.geo.city}</td></tr> : null}
                        {clearbit.geo.state ? <tr><td>State</td><td>{clearbit.geo.state}</td></tr> : null}
                    </tbody>
                </Table>);
            }
        }
        return <div>
            {clearbitDetail !== null && clearbitDetail.length === 0 ? "not found" : clearbitDetail}
        </div>
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

    render: function() {
        return <div>
            <Button bsSize="xsmall" onClick={this.loadClearbitProfileByEmail}>Reveal</Button><br/>
            <ClearbitInfo clearbit={this.state.clearbit} />
        </div>
    }
});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}