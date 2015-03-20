/** @jsx React.DOM */
var Header = React.createClass({
    render: function() {
        var cx = React.addons.classSet;
        var envProd, envDev, localSwitcher=null, prodSwitcher=null, devSwitcher=null;
        if (document.URL.startsWith("http://localhost")) {
            envLocal = cx({
                activeEnv: true,
                env: true
            })
            localSwitcher =  <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1">
                <a className={envLocal} href={document.URL}> Local-Env </a>
            </div>;
        }
        else {
            if (!document.URL.startsWith("https://dev")) {
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
            prodSwitcher = <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1">
                <a className={envProd} href="https://hello-admin.appspot.com/"> Prod-Env </a>
            </div>;
            devSwitcher =  <div className="col-xs-1 col-sm-1 col-md-1 col-lg-1">
                <a className={envDev} href="https://dev-dot-hello-admin.appspot.com/"> Dev-Env </a>
            </div>;
        }
        return (<div>
            {localSwitcher}
            {prodSwitcher}
            {devSwitcher}
        </div>)
    }
});
React.renderComponent(<Header/>, document.getElementById("env-switcher"));
