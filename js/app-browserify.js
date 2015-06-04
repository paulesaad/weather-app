"use strict";
require("es5-shim")
require("babel/register")

var Promise = require('es6-promise').Promise
var $ = require('jquery')
var key = 'b368ef0dc47a771e46425a036ab6def1'

var GPS = new Promise((res, rej) => {
    // if gps successful, resolve with coordinates
    // else reject with error
    
    navigator.geolocation.getCurrentPosition(
        (gpsData) => res({
            lat: gpsData.coords.latitude,
            lon: gpsData.coords.longitude
        }), (error) => rej(error.message)
    )
})

GPS.then((ll) => {

    function qs(selector) {
        return document.querySelector(selector)
    }

    function qsAll(selector) {
        return document.querySelectorAll(selector)
    }

    var address = `Houston, TX`
    var googurl = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}`
    var y = $.getJSON(googurl).then((r) => {
        console.log(r)
    })


    var url = `https://api.forecast.io/forecast/${key}/${ll.lat},${ll.lon}?callback=?`

    var x = $.getJSON(url).then((r) => {

        //Topbar Data
        var weatheralert = !!r.alerts ? `<em>ALERTS:</em> <strong>${r.alerts[0].title}</strong> --> ${r.alerts[0].description.toLowerCase()}` : `<em>Alerts:</em> <strong>None</strong> - You're in the clear!`
        qs("#ticker").innerHTML = weatheralert


        //Quick weather data (weather currently)
        var current_data = r.currently,
            temp_current = current_data.temperature,
            appTemp_current = current_data.apparentTemperature,
            precProb_current = current_data.precipProbability * 100,
            summary_current = current_data.summary,
            visibility = current_data.visibility,
            humidity_current = current_data.humidity * 100,
            wind_current = current_data.windSpeed

        qs(".current").innerHTML += `<span>Summary for the day --> ${summary_current}</span>`
        qs(".current").innerHTML += `<span>Now --> ${Math.round(temp_current)}\xB0</span>`
        qs(".current").innerHTML += `<span>Feels Like --> ${Math.round(appTemp_current)}\xB0</span>`
        qs(".current").innerHTML += `<span>Chance of rain --> ${Math.round(precProb_current)}%</span>`
        qs(".current").innerHTML += `<span>Wind --> ${wind_current} mph</span>`
        qs(".current").innerHTML += `<span>Visibility --> ${visibility} mi</span>`
        qs(".current").innerHTML += `<span>Humidity --> ${humidity_current}%</span>`


        var weather_icon_src_generator = function(dataOnDay) {
            if (dataOnDay.cloudCover < .3) {
                return `../../images/sunny.svg`
            } else if (dataOnDay.cloudCover > .3 && dataOnDay.cloudCover < .5) {
                return `../../images/partlysunny.svg`
            } else if (dataOnDay.cloudCover > 0.5 && dataOnDay.precipProbability < 0.5) {
                return `../../images/cloudy.svg`
            } else {
                return `../../images/rainy.svg`
            }
        }

        //Daily forecast data
        function displayDayX(dayX) {
            var daily_data = r.daily.data[dayX], //array
                highLow = `${Math.round(daily_data.temperatureMax)}\xB0/${Math.round(daily_data.temperatureMin)}\xB0`,
                feelsLike = `Feels like: ${Math.round(daily_data.apparentTemperatureMax)}\xB0/${Math.round(daily_data.apparentTemperatureMin)}\xB0`,
                chance_of_precipitation = `Chance of precipitation: ${Math.round(daily_data.precipProbability*100)}%`,
                summary = `${daily_data.summary}`,
                weather_icon_src = weather_icon_src_generator(daily_data)

            qs(".daily img").src = weather_icon_src
            qs("#hiLo").innerHTML = highLow
            qs("#apparentHiLo").innerHTML = feelsLike
            qs("#chancePrecip").innerHTML = chance_of_precipitation
            qs("#overview").innerHTML = summary
        }

        displayDayX(0)

        //Weekly Forecast data
        var week_summary = r.daily.summary
        qs(".through_the_week p").innerHTML = week_summary

        var weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        var days = [0, 1, 2, 3, 4, 5, 6, 7]

        function getDay_of_week(day) {
            return weekdays[((new Date().getDay() - 1) + day) % 7]
        }


        days.forEach((day) => {
            var week_data = r.daily.data[day],
                week_highLow = `${Math.round(week_data.temperatureMax)}\xB0/${Math.round(week_data.temperatureMin)}\xB0`,
                week_weather_icon_src = `${weather_icon_src_generator(week_data)}`

            qs(`.dayoftheweek:nth-of-type(${day+1}) span:first-child`).innerHTML = getDay_of_week(day)
            qs(`.dayoftheweek:nth-of-type(${day+1}) img`).src = week_weather_icon_src
            qs(`.dayoftheweek:nth-of-type(${day+1}) span:nth-of-type(2)`).innerHTML = week_highLow
        })

        var daysOfWeekEls = qsAll('.dayoftheweek')
        for (var i = 0; i < daysOfWeekEls.length; i++) {
            daysOfWeekEls[i].addEventListener('click', function() {
                displayDayX(parseInt(this.getAttribute('data-day')))
                    // qs("h5").innerHTML = `${getDay_of_week(parseInt(this.getAttribute('data-day')))}'s Forecast`
                    // console.log((parseInt(this.getAttribute('data-day'))))
            })
        }

    })

})
