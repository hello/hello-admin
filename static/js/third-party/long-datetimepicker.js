/** @jsx React.DOM */

var LongDatetimePicker = React.createClass({
    getDefaultProps: function() {
        return {
            id: "datetimepicker",
            placeHolder: "datetimepicker",
            minDate: "1/1/1970",
            maxDate: "12/12/3000",
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
            daysOfWeekDisabled:[]
        }
    },
    componentDidMount: function() {
        var settings = {}, that = this;
        Object.keys(that.props).forEach(function(attr){
          if (attr !== "id" && attr !== "placeHolder") {
            settings[attr] = that.props[attr];
          }
        });
        $('#'+this.props.id).datetimepicker(settings);
    },
    render: function() {
        return (
          <div className="col-xs-3 col-sm-3 col-md-3 col-lg-3">
              <p className="icon-addon addon-md">
                <input id={this.props.id} className="form-control" placeholder={this.props.placeHolder}/>
                <label className="glyphicon glyphicon-calendar"></label>
              </p>
          </div>
        )
    }
});