var Card = React.createClass({
    getDefaultProps: function() {
        return {img: "svg/sleep.svg"}
    },
    render: function() {
        return <div className={"card card-" + this.props.title.toLowerCase().replace(/\s/g, "-")}>
            <div className="card-title">
                <Row>
                    <Col xs={2} className="card-icon-wrapper">
                        <img className="card-icon" src={"/static/" + this.props.img}/>
                    </Col>
                    <Col xs={8} className="card-name">
                        {this.props.title}
                    </Col>
                </Row>
            </div>
            <br/>
            <div className="card-content">
                {this.props.content}
            </div>
        </div>
    }
});

var InsightGenericCard = React.createClass({
    getInitialState: function() {
        return {insightsGeneric: []};
    },

    componentDidMount: function() {
        this.getInsightsGeneric(this.props.category);
    },

    getInsightsGeneric: function(category) {
        $.ajax({
            url: "/api/insights_generic",
            data: {category: category, email: $("#email-input").val()},
            dataType: 'json',
            type: "GET",
            success: function (response) {
                this.setState({insightsGeneric: response.data});
            }.bind(this)
        });
        return false;
    },

    render: function() {
        var genericContent = this.state.insightsGeneric[0];
        if (!genericContent) {
            return null;
        }
        return <Modal>
            <div className='modal-header'>
                <div className="modal-title">{genericContent.title} <Button className="btn-round btn-borderless btn-fade" onClick={this.props.onRequestHide}>X</Button></div>
                <div className="modal-subtitle">{genericContent.category}</div>
            </div>
            <div className='modal-body'>
                {genericContent.image_url ? <img className="modal-img" src={genericContent.image_url}/> : null}
                {debunkMarkdown(genericContent.text)}
            </div>
            <div className='modal-footer'>
                <Button className="btn-round btn-fade" onClick={this.props.onRequestHide}>X</Button>
            </div>
        </Modal>;
    }
});

var InsightsMaster = React.createClass({
    getInitialState: function() {
        return {insights: [], error: "", ready: false};
    },

    componentDidMount: function() {
        var emailInputFromURL = getParameterByName("email");
        console.log(emailInputFromURL);
        if (emailInputFromURL) {
            this.refs.emailInput.getDOMNode().value = emailInputFromURL;
            this.getInsights(emailInputFromURL);
        }
    },

    getInsights: function() {
        this.setState(this.getInitialState());
        history.pushState({}, '', '/insights/?email=' + this.refs.emailInput.getDOMNode().value.trim());
        $.ajax({
            url: "/api/insights",
            data: {email: this.refs.emailInput.getDOMNode().value.trim()},
            dataType: 'json',
            type: "GET",
            success: function (response) {
                this.setState({insights: response.data, error: response.error, ready: true});
            }.bind(this)
        });
        return false;
    },

    render: function() {
        var resultCards = this.state.ready === true && this.state.insights.length === 0 ?
            <Alert>Not found! {this.state.error}</Alert> :
            <Col xs={12} md={10} mdOffset={1} md={8} mdOffset={2} lg={6} lgOffset={3} xl={4} xlOffset={4}>{
                this.state.insights.map(function(d){
                    var infoPreview = !d.info_preview ? null: <div>
                        <hr className="splitter"/>
                        <ModalTrigger modal={<InsightGenericCard category={d.category} />}>
                            <Row className="cursor-hand card-info-preview">
                                <Col xs={11}>{d.info_preview}</Col>
                                <Col xs={1}><Glyphicon className="glyphicon-preview" bsSize="small" glyph="menu-right"/></Col>
                            </Row>
                        </ModalTrigger>
                        </div>;

                    var content = <div>
                            <div className="card-age">generated {millisecondsToHumanReadableString(new Date().getTime() - d.timestamp)} ago</div>
                            <hr className="splitter"/>
                            <div className="card-message">{debunkMarkdown(d.message)}</div>
                            {infoPreview}
                        </div>;

                    return <Col xs={12}>
                        <Card title={d.title} content={content} />
                    </Col>;
                }.bind(this))
            }</Col>;
        return <div>
            <Col xs={12} md={10} mdOffset={1} md={8} mdOffset={2} lg={6} lgOffset={3} xl={4} xlOffset={4}><form onSubmit={this.getInsights}>
                <Col xs={12}>
                    <div className="icon-addon addon-md">
                        <input className="form-control" type="text" placeholder="enter email" id="email-input" ref="emailInput"/>
                        <Glyphicon className="cursor-hand" id="submit" glyph="search" type="submit" onClick={this.getInsights} />
                        <span className="input-pre"><Glyphicon glyph="envelope" /></span>
                    </div>
                </Col>
            </form></Col>
            {resultCards}
        </div>
    }
});

React.render(<InsightsMaster />, document.getElementById("insights"));

function debunkMarkdown(md) {
    var partials = md.match(/(.*?)(\*\*)(.*?)(\*\*)(.*)/);
    if (!partials) {
        return md;
    }
    return <span>{partials[1]}<span className="stress">{partials[3]}</span>{partials[5]}</span>;
}
