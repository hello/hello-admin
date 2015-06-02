/** @jsx React.DOM */

var LongDatetimePicker = React.createClass({
    getDefaultProps: function() {
        return {
            id: "datetimepicker",
            reference: "datetimepicker",
            placeHolder: "datetimepicker",
            size: "3",
            minDate: "1/1/1970",
            maxDate: "12/12/3000",
            format : 'MM/DD/YYYY HH:mm:ss',
            pickDate: true,                 //en/disables the date picker
            pickTime: true,                 //en/disables the time picker
            useMinutes: true,               //en/disables the minutes picker
            useSeconds: true,               //en/disables the seconds picker
            useCurrent: true,               //when true, picker will set the value to the current date/time
            minuteStepping: 1,               //set the minute stepping
            showToday: true,                 //shows the today indicator
            language: "en",                  //sets language locale
            defaultDate: "",                 //sets a default date, accepts js dates, strings and moment objects
            disabledDates: [],               //an array of dates that cannot be selected
            enabledDates: [],                //an array of dates that can be selected
            icons: {
                time: 'glyphicon glyphicon-time',
                date: 'glyphicon glyphicon-calendar',
                up:   'glyphicon glyphicon-chevron-up',
                down: 'glyphicon glyphicon-chevron-down'
            },
            useStrict: false,               //use "strict" when validating dates
            sideBySide: true,              //show the date and time picker side by side
            daysOfWeekDisabled:[],
            glyphicon: "calendar"
        }
    },
    componentDidMount: function() {
        var settings = {}, that = this;
        Object.keys(that.props).forEach(function(attr){
          if (attr !== "id" && attr !== "placeHolder" && attr != "size") {
            settings[attr] = that.props[attr];
          }
        });
        $('#'+this.props.id).datetimepicker(settings);
    },

    render: function() {
        var s = this.props.size, input;
        if (this.props.format) {
          input = <input id={this.props.id} ref={this.props.reference} className="form-control" placeholder={this.props.placeHolder} data-date-format={this.props.format}/>;
        }
        else {
          input = <input id={this.props.id} ref={this.props.reference} className="form-control" placeholder={this.props.placeHolder} />
        }
        return (

          <div className={"col-xs-" + s + " col-sm-" + s + " col-md-" + s + " col-lg-" + s}>
              <p className="icon-addon addon-md">
                {input}
                <label className={"glyphicon glyphicon-" + this.props.glyphicon}></label>
              </p>
          </div>
        )
    }
});