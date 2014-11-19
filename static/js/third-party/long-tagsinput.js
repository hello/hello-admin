/** @jsx React.DOM */
// this file serves as a reusable tagsinput component in JSX (react friendly)

var LongTagsInput = React.createClass({
   getDefaultProps: function () {
       return {
           tagClass: "label label-default",
           placeHolder: "add more!",
           confirmKeys: [13, 9, 32, 188]
       }
   },
   componentDidMount: function(){
       var that = this;
       $.getScript("/static/js/third-party/bootstrap-tagsinput.js").done(function () {
         var thisTagsInput = $(that.refs.longtagsinput.getDOMNode());
         thisTagsInput.tagsinput({
             tagClass: that.props.tagClass,
             confirmKeys: that.props.confirmKeys
         });
         var generatedTagsInputDiv = thisTagsInput.next('div.bootstrap-tagsinput');
         generatedTagsInputDiv.children('input').attr("placeholder", that.props.placeHolder)
         .focusin(function(){
             generatedTagsInputDiv.addClass('long-tagsinput-highlight');
         })
         .focusout(function(){
             generatedTagsInputDiv.removeClass('long-tagsinput-highlight');
         });
       });
   },
   render: function() {
       return (
           <input ref="longtagsinput" id={this.props.id} className="longTagsInput form-control"/>
       )
   }
});