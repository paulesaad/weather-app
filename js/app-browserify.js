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

    var url = `https://api.forecast.io/forecast/${key}/${ll.lat},${ll.lon}?callback=?`

    var x = $.getJSON(url).then((r) => {

        //Topbar Data
        var weatheralert = !!r.alerts ? `<em>ALERTS:</em> <strong>${r.alerts[0].title}</strong> --> ${r.alerts[0].description.toLowerCase()}` : `<em>Alerts:</em> <strong>None</strong> - You're in the clear!`
        qs("#ticker").innerHTML = weatheralert


        //Quick weather data
        var current_data = r.currently //object
        var temp_current = current_data.temperature
        var appTemp_current = current_data.apparentTemperature
        var precProb_current = `${current_data.precipProbability*100}%`
        var summary_current = current_data.summary
        var visibility = current_data.visibility
        var humidity_current = current_data.humidity

        qs(".current").innerHTML += temp_current
        qs(".current").innerHTML += appTemp_current
        qs(".current").innerHTML += precProb_current
        qs(".current").innerHTML += summary_current
        qs(".current").innerHTML += visibility
        qs(".current").innerHTML += humidity_current


        //Daily forecast data
        var daily_data = r.daily.data[0] //array
        var highLow = `${Math.round(daily_data.temperatureMax)}\xB0/${Math.round(daily_data.temperatureMin)}\xB0`
        var feelsLike = `Feels like: ${Math.round(daily_data.apparentTemperatureMax)}\xB0/${Math.round(daily_data.apparentTemperatureMin)}\xB0`
        var chance_of_precipitation = `Chance of precipitation: ${daily_data.precipProbability*100}%`
        var summary = `${daily_data.summary}`
        var weather_icon_url = function(dailydata) {
            if (dailydata.cloudCover < .3) {
                return `../../images/sunny.svg`
            } else if (dailydata.cloudCover > .3 && dailydata.cloudCover < .5) {
                return `../../images/partlysunny.svg`
            } else if (dailydata.cloudCover > 0.5 && dailydata.precipProbability < 0.5) {
                return `../../images/cloudy.svg`
            } else {
                return `../../images/rainy.svg`
            }
        }
        var weather_icon_tag = `<img src="${weather_icon_url(daily_data)}">`

        qs(".daily").innerHTML = weather_icon_tag + `${qs(".daily").innerHTML}`
        qs("#hiLo").innerHTML = highLow
        qs("#apparentHiLo").innerHTML = feelsLike
        qs("#chancePrecip").innerHTML = chance_of_precipitation
        qs("#overview").innerHTML = summary

        //Weekly Forecast data
        var week_summary = r.daily.summary
        qs(".through_the_week p").innerHTML = week_summary

        var weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        var days = [0, 1, 2, 3, 4, 5, 6, 7]
        days.forEach((day) => {
            var week_data = r.daily.data[day]
            var week_highLow = `${Math.round(week_data.temperatureMax)}\xB0/${Math.round(week_data.temperatureMin)}\xB0`
            var week_weather_icon_tag = `<img src="${weather_icon_url(week_data)}">`
            // qs(".through_the_week div:nth-of-type(day+1) ").innerHTML = week_highLow
            // qs().innerHTML = week_highLow

        })


    })

})






















//Routing using hashchange

// var GithubRouter = Backbone.Router.extend({
//     routes: {
//         'home': 'home'
//         'weather/:lat/:lng' :
//     },
//     drawProfile: function(user){
//         new GithubClient(user).createProfile()
//     },
//     initialize: function(){
//         Backbone.history.start()
//     }
// })
// var router = new GithubRouter()

// var node = document.querySelector('form')

// node.addEventListener('submit', (e) => {
//     e.preventDefault()
//  window.location.hash = node.querySelector('input').value
// })
