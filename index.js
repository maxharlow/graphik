function Graphik() {

    function setup() {
        request('layout.json', function (layout) {
            var chart = new Chart('#display', layout)
            var controls = document.querySelectorAll('input,textarea')
            for (var i = 0; i < controls.length; i++) controls[i].addEventListener('input', function () {
                update(chart)
            })
            document.querySelector('button.png').addEventListener('click', function () {
                save(chart.toPNG(), filename() + '.png')
            })
            document.querySelector('button.svg').addEventListener('click', function () {
                save(chart.toSVG(), filename() + '.svg')
            })
            document.querySelector('textarea').value = 'Country\tAmount\nUS\t5.6\nNetherlands\t20.4\nUK\t21.3\nBelgium\t81.3\nItaly\t120.6\nFrance\t148.2'
            document.querySelector('input[name=title]').value = 'An example graph'
            document.querySelector('input[name=tickInterval]').value = '25'
            document.querySelector('input[name=credit]').value = 'A news organisation'
            document.querySelector('input[name=source]').value = 'Source: Example data'
            update(chart)
        })
    }

    function update(chart) {
        var data = parse(document.querySelector('textarea').value)
        var config = {
            title: document.querySelector('input[name=title]').value,
            subtitle: document.querySelector('input[name=subtitle]').value,
            tickInterval: document.querySelector('input[name=tickInterval]').value,
            dataPrefix: document.querySelector('input[name=dataPrefix]').value,
            dataSuffix: document.querySelector('input[name=dataSuffix]').value,
            source: document.querySelector('input[name=source]').value,
            credit: document.querySelector('input[name=credit]').value
        }
        chart.draw(data, config)
        filename()
    }

    function parse(value) {
        var data = value.split('\n').map(function (row) {
            return row.split('\t').map(function (value) {
                return isNaN(value) ? value : Number(value)
            })
        })
        var parsed = data.map(function (row) {
            return {
                label: row[0],
                value: row[1]
            }
        })
        var headers = parsed.splice(0, 1)
        return parsed
    }

    function filename() {
        return document.querySelector('input[name=title]').value.replace(/\W+/g, '-').replace(/-$/, '').toLowerCase()
    }

    function save(data, filename) {
        var anchor = document.createElement('a')
        anchor.setAttribute('href', data)
        anchor.setAttribute('download', filename)
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
    }

    function request(uri, callback) {
        var http = new XMLHttpRequest()
        http.open('GET', uri, true)
        http.onload = function () {
            callback(JSON.parse(this.responseText))
        }
        http.send()
    }
    
    setup()

}

addEventListener('DOMContentLoaded', Graphik)
