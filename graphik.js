function Graphik() {

    function setup() {
        request('vendor-layout.json', function (layout) {
            var chart = new GraphikChart('#display', layout)
            var controls = document.querySelectorAll('input,textarea')
            for (var i = 0; i < controls.length; i++) controls[i].addEventListener('input', function () {
                update(chart)
            })
            document.querySelector('button.png').addEventListener('click', function () {
                save(chart.toPNG(), 'png')
            })
            document.querySelector('button.svg').addEventListener('click', function () {
                save(chart.toSVG(), 'svg')
            })
            document.querySelector('textarea').value = 'Country\tAmount\nUS\t5.6\nNetherlands\t20.4\nUK\t21.3\nBelgium\t81.3\nItaly\t120.6\nFrance\t148.2'
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
            notes: document.querySelector('input[name=notes]').value,
            source: document.querySelector('input[name=source]').value,
            credit: document.querySelector('input[name=credit]').value
        }
        chart.draw(data, config)
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
        var filtered = parsed.filter(function (row) {
            return row.value !== undefined
        })
        var headers = filtered.splice(0, 1) // ignore these, for now
        return filtered
    }

    function save(data, extension) {
        var filename = document.querySelector('input[name=title]').value.replace(/\s+/g, '-').replace(/[^A-Za-z0-9\-]/g, '').toLowerCase() || 'untitled'
        var anchor = document.createElement('a')
        anchor.setAttribute('href', data)
        anchor.setAttribute('download', filename + '.' + extension)
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
