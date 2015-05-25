function Graphik() {

    function setup() {
        request('vendor-layout.json', function (layout) {
            var chart = new GraphikChart('#display', layout)
            var controls = document.querySelectorAll('input,textarea')
            for (var i = 0; i < controls.length; i++) controls[i].addEventListener('input', function () {
                update(chart)
            })
            setupOpenButton(chart)
            document.querySelector('.transpose').addEventListener('click', function () {
                var textarea = document.querySelector('textarea[name=input]')
                textarea.value = transposeData(textarea.value)
                update(chart)
            })
            document.querySelector('button.png').addEventListener('click', function () {
                save(getData(), getConfig())
                download(chart.toPNG(), 'png')
            })
            document.querySelector('button.svg').addEventListener('click', function () {
                save(getData(), getConfig())
                download(chart.toSVG(), 'svg')
            })
            document.querySelector('button.show-advanced').addEventListener('click', function () {
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

    function setupOpenButton(chart) {
        document.addEventListener('click', function (e) {
            var openButton = document.querySelector('.open')
            var openList = document.querySelector('.open-list')
            if (openList && e.target.className !== 'delete') {
                openList.remove()
                openButton.classList.remove('toggled')
            }
        })
        document.querySelector('.open').addEventListener('click', function (e) {
            if (document.querySelector('.open-list')) return
            e.stopPropagation()
            e.target.classList.add('toggled')
            var openList = document.createElement('ol')
            openList.className = 'open-list'
            savedItems().forEach(function (saved) {
                var savedItem = document.createElement('li')
                var savedItemTitle = document.createElement('div')
                savedItemTitle.className = 'title'
                savedItemTitle.innerHTML = saved.config.title || '(untitled)'
                var savedItemTitleDate = document.createElement('span')
                savedItemTitleDate.className = 'date'
                savedItemTitleDate.innerHTML = new Date(saved.date).toLocaleString()
                savedItemTitle.appendChild(savedItemTitleDate)
                savedItem.appendChild(savedItemTitle)
                var savedItemDelete = document.createElement('div')
                savedItemDelete.className = 'delete'
                savedItemDelete.innerHTML = '&#10006;'
                savedItemDelete.addEventListener('click', function (e) {
                    e.target.parentNode.remove()
                    remove(saved.filename)
                    if (savedItems().length === 0) {
                        var emptyMessage = document.createElement('li')
                        emptyMessage.className = 'empty-message'
                        emptyMessage.innerHTML = 'No saved charts.'
                        openList.appendChild(emptyMessage)
                    }
                })
                savedItem.appendChild(savedItemDelete)
                savedItem.addEventListener('click', function (e) {
                    if (e.target.className === 'delete') return
                    var savedChart = open(saved.filename)
                    setData(savedChart.data)
                    setConfig(savedChart.config)
                    update(chart)
                })
                openList.appendChild(savedItem)
            })
            if (savedItems().length === 0) {
                var emptyMessage = document.createElement('li')
                emptyMessage.className = 'empty-message'
                emptyMessage.innerHTML = 'No saved charts.'
                openList.appendChild(emptyMessage)
            }
            this.parentNode.insertBefore(openList, this.nextSibling)
        })
    }

    function getData() {
        return document.querySelector('textarea[name=input]').value
    }

    function setData (data) {
        document.querySelector('textarea[name=input]').value = data
    }

    function getConfig() {
        return {
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
    }

    function setConfig(config) {
        document.querySelector('input[name=title]').value = config.title
        document.querySelector('input[name=subtitle]').value = config.subtitle
        document.querySelector('input[name=tickInterval]').value = config.tickInterval
        document.querySelector('input[name=dataPrefix]').value = config.dataPrefix
        document.querySelector('input[name=dataSuffix]').value = config.dataSuffix
        document.querySelector('input[name=notes]').value = config.notes
        document.querySelector('input[name=source]').value = config.source
        document.querySelector('input[name=credit]').value = config.credit
        document.querySelector('textarea[name=customScript]').value = config.customScript
    }

    function update(chart) {
        chart.draw(parseData(getData()), getConfig())
    }

    function extractData(input) {
        var data = input.split('\n').map(function (row) {
            return row.split('\t')
        })
        return data.filter(function (row) {
            return row.filter(function (value) { return value !== '' }).length > 0
        })
    }

    function parseData(input) {
        var data = extractData(input)
        var columns = data.splice(0, 1)[0]
        var key = columns.splice(0, 1)[0]
        var rows = data.map(function (row) {
            return row.splice(0, 1)[0]
        })
        var values = data.map(function (row) {
            return row.map(function (value) {
                var valueNumerical = value.replace(/[^0-9\.\-]+/g, '')
                return isNaN(valueNumerical) ? value : Number(valueNumerical)
            })
        })
        return {
            key: key,
            columns: columns,
            rows: rows,
            values: values
        }
    }

    function transposeData(input) {
        var data = extractData(input)
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

    function download(data, extension) {
        var anchor = document.createElement('a')
        anchor.setAttribute('href', data)
        anchor.setAttribute('download', filename() + '.' + extension)
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
    }

    function save(data, config) {
        var item = {
            filename: filename(),
            date: new Date(),
            data: data,
            config: config
        }
        localStorage['saved'] = JSON.stringify(savedItems().concat(item))
    }

    function savedItems() {
        return JSON.parse(localStorage['saved'] || '[]')
    }

    function open(filename) {
        return savedItems().find(function (chart) {
            return chart.filename === filename
        })
    }

    function remove(filename) {
        var items = savedItems().filter(function (chart) {
            return chart.filename !== filename
        })
        localStorage['saved'] = JSON.stringify(items)
    }

    function filename() {
        return document.querySelector('input[name=title]').value.replace(/\s+/g, '-').replace(/[^A-Za-z0-9\-]/g, '').toLowerCase() || 'untitled-' + new Date().getTime()
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
