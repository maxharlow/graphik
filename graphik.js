function Graphik() {

    function setup() {
        request('vendor-layout.json', function (layout) {
            var chart = new GraphikChart('#display', layout)
            var controls = document.querySelectorAll('input,textarea')
            for (var i = 0; i < controls.length; i++) controls[i].addEventListener('input', function () {
                update(chart)
            })
            document.querySelector('.transpose').addEventListener('click', function () {
                var textarea = document.querySelector('textarea[name=input]')
                textarea.value = transpose(textarea.value)
                update(chart)
            })
            document.querySelector('button.png').addEventListener('click', function () {
                save(chart.toPNG(), 'png')
            })
            document.querySelector('button.svg').addEventListener('click', function () {
                save(chart.toSVG(), 'svg')
            })
            document.querySelector('button.showadvanced').addEventListener('click', function () {
                var advanced = document.querySelector('.advanced')
                if (advanced.style.display === 'block') {
                    advanced.style.display = 'none'
                    this.innerHTML = this.innerHTML.replace('Hide', 'Show')
                }
                else {
                    advanced.style.display = 'block'
                    this.innerHTML = this.innerHTML.replace('Show', 'Hide')
                }
            })
            document.querySelector('textarea[name=input]').value = '\tAmount\nUS\t5.6\nSpain\t20.4\nUK\t21.3\nBelgium\t81.3\nItaly\t120.6\nFrance\t148.2'
            update(chart)
        })
    }

    function update(chart) {
        var data = parse(document.querySelector('textarea[name=input]').value)
        var config = {
            title: document.querySelector('input[name=title]').value,
            subtitle: document.querySelector('input[name=subtitle]').value,
            tickInterval: document.querySelector('input[name=tickInterval]').value,
            dataPrefix: document.querySelector('input[name=dataPrefix]').value,
            dataSuffix: document.querySelector('input[name=dataSuffix]').value,
            notes: document.querySelector('input[name=notes]').value,
            source: document.querySelector('input[name=source]').value,
            credit: document.querySelector('input[name=credit]').value,
            customScript: document.querySelector('textarea[name=customScript]').value
        }
        chart.draw(data, config)
    }

    function extract(input) {
        var data = input.split('\n').map(function (row) {
            return row.split('\t')
        })
        return data.filter(function (row) {
            return row.filter(function (value) { return value !== '' }).length > 0
        })
    }

    function parse(input) {
        var data = extract(input)
        var columns = data.splice(0, 1)[0]
        var key = columns.splice(0, 1)[0]
        var rows = data.map(function (row) {
            return row.splice(0, 1)[0]
        })
        var values = data.map(function (row) {
            return row.map(function (value) {
                return isNaN(value) ? value : Number(value)
            })
        })
        return {
            key: key,
            columns: columns,
            rows: rows,
            values: values
        }
    }

    function transpose(input) {
        var data = extract(input)
        var newData = []
        for (var i = 0; i < data[0].length; i++) {
            var newRow = []
            for (var j = 0; j < data.length; j++) {
                newRow.push(data[j][i])
            }
            newData.push(newRow)
        }
        return newData.map(function (row) { return row.join('\t') }).join('\n')
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
