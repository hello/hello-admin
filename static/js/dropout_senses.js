var DropoutSensesMaster = React.createClass({
   render: function() {
      return <div>
         <form onSubmit={this.handleSubmit}>
            <LongDatetimePicker size={3} glyphicon="clock" placeHolder="start time utc" id="start"/>
            <LongDatetimePicker size={3} glyphicon="clock" placeHolder="end time utc" id="end"/>
            <Col xs={1}>
               <Button type="submit"><Glyphicon glyph="search"/></Button>
            </Col>
         </form>
      </div>
   }
});

React.render(<DropoutSensesMaster />, document.getElementById("dropout-senses"));