/** @jsx React.DOM */
// this file serves as a reusable tagsinput component in JSX (react friendly)

var LongLabel = React.createClass({
   getDefaultProps: function () {
       return {
           bsStyle: "",
           content: ""
       }
   },

   render: function() {
       var labelClasses = {label: true};
       if (this.props.bsStyle !== "") {
           labelClasses[this.props.bsStyle] = true
       }
       else {
           labelClasses["label-default"] = true
       }
       var classSet =  React.addons.classSet(labelClasses);
       return (
           <span className={classSet}>{this.props.content}</span>
       )
   }
});