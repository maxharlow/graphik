function GraphikChart(display, layout) {

    this.draw = function (data, config) {
        d3.select(display).select('svg').remove()
        var svg = d3.select(display).append('svg')

        var header = drawHeader(svg, config, layout.padding.left, layout.padding.top)
        var chart = drawBar(svg, config, data, layout.padding.left, layout.padding.top + header.node().getBBox().height + layout.padding.prechart)
        var footer = drawFooter(svg, config, layout.padding.left, layout.padding.top + header.node().getBBox().height + layout.padding.prechart + chart.node().getBBox().height + layout.padding.postchart)

        var height = layout.padding.top
            + header.node().getBBox().height
            + layout.padding.prechart
            + chart.node().getBBox().height
            + layout.padding.postchart
            + footer.node().getBBox().height
            + layout.padding.bottom

        svg
            .attr('shape-rendering', 'crispEdges')
            .attr('width', layout.width)
            .attr('height', height)
    }

    function drawHeader(svg, config, x, y) {
        svg.append('rect')
            .attr('id', 'background')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', 'white')

        var header = svg.append('g')
            .attr('id', 'header')
            .attr('transform', 'translate(' + x + ', ' + y + ')')

        var title = header.append('text')
            .attr('id', 'title')
            .attr('dy', '1em')
            .text(config.title)

        if (config.subtitle !== '') {
            var subtitle = header.append('text')
                .attr('id', 'subtitle')
                .attr('dy', '1em')
                .text(config.subtitle)

            subtitle.attr('y', title.node().getBBox().height + layout.padding.intertitle)
        }

        return header
    }

    function drawFooter(svg, config, x, y) {
        var footer = svg.append('g')
            .attr('id', 'footer')
            .attr('transform', 'translate(' + x + ', ' + y + ')')

        var notes = footer.append('text')
            .attr('id', 'notes')
            .attr('dy', '1em')
            .text(config.notes)

        var credit = footer.append('text')
            .attr('id', 'credit')
            .attr('dy', '1em')
            .text(config.credit)

        var source = footer.append('text')
            .attr('id', 'source')
            .attr('dy', '1em')
            .text(config.source)

        source.attr('x', layout.width - layout.padding.left - layout.padding.right - source.node().getBBox().width)

        if (config.credit !== '' || config.source !== '') {
            credit.attr('y', notes.node().getBBox().height + (config.notes === '' ? 0 : layout.padding.prefootline) + layout.padding.postfootline)
            source.attr('y', notes.node().getBBox().height + (config.notes === '' ? 0 : layout.padding.prefootline) + layout.padding.postfootline)
            footer.append('line')
                .attr('id', 'footline')
                .attr('x1', 0)
                .attr('x2', layout.width - layout.padding.left - layout.padding.right)
                .attr('y1', notes.node().getBBox().height + (config.notes === '' ? 0 : layout.padding.prefootline))
                .attr('y2', notes.node().getBBox().height + (config.notes === '' ? 0 : layout.padding.prefootline))
        }

        return footer
    }

    function drawBar(svg, config, data, x, y) {
        var dataMax = Math.max.apply(Math, data.map(function (d) { return d.value }))
        var tickInterval = config.tickInterval || Math.ceil(dataMax / 4)
        var tickNumber = Math.ceil(dataMax / tickInterval)
        var tickMaximum = (tickNumber * tickInterval) + (tickInterval * 0.5)
        var tickValues = d3.range(0, tickMaximum + 1, tickInterval)

	svg.attr('class', 'bar')

        var chart = svg.append('g')
            .attr('id', 'chart')
            .attr('transform', 'translate(' + x + ', ' + y + ')')

        var seriesHeight = (layout.bar.height * data.length) // height of all the bars
	    + ((layout.bar.height * layout.bar.padding.inner) * (data.length)) // height of the inner bar spacing
	    + ((layout.bar.height * layout.bar.padding.outer) * 2) // height of the outer bar spacing

        var yScale = d3.scale.ordinal()
            .domain(d3.range(data.length))
            .rangeBands([0, seriesHeight], layout.bar.padding.inner, layout.bar.padding.outer)

        var yAxis = d3.svg.axis()
            .orient('left')
            .scale(yScale)
            .tickSize(layout.bar.tickSizeY, 0)
            .tickPadding(layout.bar.padding.tickY)
            .tickValues(d3.range(data.length))
            .tickFormat(function (d) { return data[d].label })

        var yAxisElement = chart.append('g')
            .attr('id', 'y-axis')
            .call(yAxis)

        yAxisElement.attr('transform', 'translate(' + yAxisElement.node().getBBox().width + ', ' + 0 + ')')

        var seriesWidth = layout.width - layout.padding.left - yAxisElement.node().getBBox().width - layout.bar.padding.axisY - layout.padding.right

        var xScale = d3.scale.linear()
            .domain([0, tickMaximum])
            .range([0, seriesWidth])

        var xAxis = d3.svg.axis()
            .orient('bottom')
            .scale(xScale)
            .tickSize(layout.bar.tickSizeX, 0)
            .tickPadding(layout.bar.padding.tickX)
            .tickValues(tickValues)
            .tickFormat(function (d) { return config.dataPrefix + d.toLocaleString() + config.dataSuffix })

        chart.append('g')
            .attr('id', 'x-axis')
            .attr('transform', 'translate(' + (yAxisElement.node().getBBox().width + layout.bar.padding.axisY) + ', ' + (seriesHeight + layout.bar.padding.axisX) + ')')
            .call(xAxis)

        chart.append('g')
            .attr('id', 'grid')
            .selectAll('line')
            .data(tickValues.slice(1, tickValues.length))
            .enter()
            .append('line')
            .attr('x1', function (d) { return yAxisElement.node().getBBox().width + xScale(d) })
            .attr('y1', 0)
            .attr('x2', function (d) { return yAxisElement.node().getBBox().width + xScale(d) })
            .attr('y2', seriesHeight)

        var series = chart.append('g')
            .attr('id', 'series')
            .attr('transform', function (_, i) { return 'translate(' + (yAxisElement.node().getBBox().width + layout.bar.padding.axisY) + ',' + 0 + ')' })

        var bars = series.selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .attr('transform', function (_, i) { return 'translate(' + 0 + ',' + yScale(i) + ')' })

        bars.append('rect')
            .attr('width', function (d) { return xScale(d.value) })
            .attr('height', yScale.rangeBand())

        bars.append('text')
            .attr('x', function (d) { return xScale(d.value) + layout.bar.padding.label })
            .attr('y', yScale.rangeBand() / 2)
            .attr('dominant-baseline', 'central')
            .text(function (d) { return config.dataPrefix + d.value.toLocaleString() + config.dataSuffix })

        return chart
    }

    function inlineStyles() {
        var svg = document.querySelector('svg')
        var svgElements = svg.querySelectorAll('*')
        for (var i = 0; i < svgElements.length; i++) {
            var styleList = window.getComputedStyle(svgElements[i])
            var styleListDefaults = window.getComputedStyle(document.body.appendChild(document.createElement(svgElements[i].tagName)))
            var style = ''
            for (var j = 0; j < styleList.length; j++) {
                var key = styleList[j]
                var value = styleList.getPropertyValue(key)
                if (styleListDefaults.getPropertyValue(key) !== value && key.charAt(0) !== '-') style += key + ':' + value + ';'
            }
            svgElements[i].setAttribute('style', style)
        }
    }

    this.toSVG = function () {
        inlineStyles()
        var prelude = '<?xml version="1.0"?>'
        var svg = document.querySelector('svg')
        var svgSerialised = (new XMLSerializer()).serializeToString(svg)
        return URL.createObjectURL(new Blob([prelude + svgSerialised], { 'type': 'image/svg+xml' }))
    }

    this.toPNG = function () {
        inlineStyles()
        var scale = 2 // size up for retina crispness
        var canvas = document.createElement('canvas')
        var canvasContext = canvas.getContext('2d')
        var svg = document.querySelector('svg')
        canvas.width = svg.getBoundingClientRect().width * scale
        canvas.height = svg.getBoundingClientRect().height * scale
        canvasContext.scale(scale, scale)
        canvasContext.drawSvg(svg.parentElement.innerHTML, 0, 0) // uses canvg, replace with image rendering when support is better
        return canvas.toDataURL('image/png')
    }

}
