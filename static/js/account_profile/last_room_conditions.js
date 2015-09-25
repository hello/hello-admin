var LastRoomConditionsTile = React.createClass({
    render: function() {
        var nowDateTime = d3.time.format("%m/%d/%Y %H:%M:%S")(new Date());
        var temperatureData = this.props.lastRoomConditionsResponse.data.temperature;
        var humidityData = this.props.lastRoomConditionsResponse.data.humidity;
        var lightData = this.props.lastRoomConditionsResponse.data.light;
        var soundData = this.props.lastRoomConditionsResponse.data.sound;
        var particulatesData = this.props.lastRoomConditionsResponse.data.particulates;

        var inlineLoading = [<td><img className="loading-inline" src="/static/image/loading.gif" /></td>, <td/>];
        var latestTemperature = temperatureData && !$.isEmptyObject(temperatureData) && temperatureData.value != undefined ?
            [<td>{temperatureData.value.toFixed(2)}</td>, <td>{"°" + temperatureData.unit.toUpperCase()}</td>]
            : inlineLoading;

        var latestHumidity = humidityData && !$.isEmptyObject(humidityData) && humidityData.value != undefined ?
            [<td>{humidityData.value.toFixed(2)}</td>, <td>{humidityData.unit}</td>]
            : inlineLoading;

        var latestLight = lightData && !$.isEmptyObject(lightData) && lightData.value != undefined ?
            [<td>{lightData.value.toFixed(2)}</td>, <td>{lightData.unit}</td>]
            : inlineLoading;

        var latestSound = soundData && !$.isEmptyObject(soundData) && soundData.value != undefined?
            [<td>{soundData.value.toFixed(2)}</td>, <td>{soundData.unit}</td>]
            : inlineLoading;

        var latestParticulates = particulatesData && !$.isEmptyObject(particulatesData) && particulatesData.value != undefined?
            [<td>{particulatesData.value.toFixed(2)}</td>, <td>µg/m³</td>]    // AQI is wrongfully returned in favor of mobile client usage, force it to be µg/m³
            : inlineLoading;

        var lastReadingTs = temperatureData && !$.isEmptyObject(temperatureData) ?
            new Date(temperatureData.last_updated_utc).toUTCString() : null;

        var linkToRoomConditionsHistory = this.props.email ?
            <p><a target="_blank" href={"/room_conditions/?email=" + this.props.email + "&until=" + nowDateTime}>Last "Day" (not necessarily 24 hours)</a></p>
            : null;

        return <div>
            <p>Last Reading: {lastReadingTs}</p><br/>
            <Table>
                <thead></thead>
                <tbody>
                    <tr><td>Temperature</td>{latestTemperature}</tr>
                    <tr><td>Humidity</td>{latestHumidity}</tr>
                    <tr><td>Light</td>{latestLight}</tr>
                    <tr><td>Sound</td>{latestSound}</tr>
                    <tr><td>Particulates</td>{latestParticulates}</tr>
                    <tr><td/><td/><td/></tr>
                </tbody>
            </Table>
            {linkToRoomConditionsHistory}
        </div>
    }
});
