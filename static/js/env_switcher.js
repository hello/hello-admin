/** @jsx React.DOM */
var Header = React.createClass({
    render: function() {
        var cx = React.addons.classSet;
        var envProd, envDev;
        if (document.URL === "https://hello-admin.appspot.com/") {
            envProd = cx({
                activeEnv: true,
                env: true
            });
            envDev = cx({
                activeEnv: false,
                env: true
            });
        }
        else {
            envProd = cx({
                activeEnv: false,
                env: true
            });
            envDev = cx({
                activeEnv: true,
                env: true
            });
        }
        return (<div>
            <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1">
            <a className={envProd} href="https://hello-admin.appspot.com/"> Prod-Env </a>
        </div>
        <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1">
            <a className={envDev} href="https://dev-dot-hello-admin.appspot.com/"> Dev-Env </a>
        </div>
        </div>)
    }
});
React.renderComponent(<Header/>, document.getElementById("env-switcher"));
