function Chart(display, layout) {

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

        var credit = footer.append('text')
            .attr('id', 'credit')
            .text(config.credit)

        credit.attr('y', credit.node().getBBox().height)
	
        var source = footer.append('text')
            .attr('id', 'credit')
            .text(config.source)

        source.attr('x', layout.width - layout.padding.left - layout.padding.right - source.node().getBBox().width)
	source.attr('y', credit.node().getBBox().height)

        return footer
    }

    function drawBar(svg, config, data, x, y) {
        var dataMax = Math.max.apply(Math, data.map(function (d) { return d.value }))
	var tickNumber = Math.ceil(dataMax / config.tickInterval)
        var tickRequired = tickNumber * config.tickInterval
	var tickExtras = (Math.abs(tickRequired - dataMax) < config.tickInterval / 4 ? 1 : 0) * config.tickInterval
	var tickMaximum = tickRequired + tickExtras
        var tickValues = d3.range(0, tickMaximum + 1, config.tickInterval)

        var chart = svg.append('g')
            .attr('id', 'chart')
            .attr('transform', 'translate(' + x + ', ' + y + ')')

        var seriesHeight = (layout.bar.height * data.length) + ((layout.bar.height * layout.bar.padding.inner) * (data.length - 1)) + (layout.bar.padding.outer * 2)
        
        var yScale = d3.scale.ordinal()
            .domain(d3.range(data.length))
            .rangeRoundBands([0, seriesHeight], layout.bar.padding.inner, layout.bar.padding.outer)

        var yAxis = d3.svg.axis() // todo no tick lines?
            .orient('left')
            .scale(yScale)
            .tickSize(1)
            .tickPadding(layout.bar.padding.tickY)
            .tickValues(d3.range(data.length))
            .tickFormat(function (d) { return data[d].label })

        var yAxisElement = chart.append('g')
            .attr('id', 'y-axis')
            .call(yAxis)

        yAxisElement.attr('transform', 'translate(' + yAxisElement.node().getBBox().width + ', ' + 0 + ')')
        
        var seriesWidth = layout.width - layout.padding.left - yAxisElement.node().getBBox().width - layout.padding.right

        var xScale = d3.scale.linear()
            .domain([0, tickMaximum])
            .range([0, seriesWidth])

        var xAxis = d3.svg.axis()
            .orient('bottom')
            .scale(xScale)
            .tickSize(1)
            .tickPadding(layout.bar.padding.tickX)
            .tickValues(tickValues)
            .tickFormat(function (d) { return config.dataPrefix + d + config.dataSuffix })

        chart.append('g')
            .attr('id', 'x-axis')
            .attr('transform', 'translate(' + yAxisElement.node().getBBox().width + ', ' + seriesHeight + ')')
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
            .attr('transform', function (_, i) { return 'translate(' + yAxisElement.node().getBBox().width + ',' + 0 + ')' })

        var bars = series.selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .attr('transform', function (_, i) { return 'translate(' + 0 + ',' + yScale(i) + ')' })

        bars.append('rect')
            .attr('width', function (d) { return xScale(d.value) })
            .attr('height', layout.bar.height)

        bars.append('text')
            .attr('x', function (d) { return xScale(d.value) + layout.bar.padding.label })
            .attr('y', layout.bar.height / 2)
            .attr('dominant-baseline', 'central')
            .text(function (d) { return config.dataPrefix + d.value + config.dataSuffix })
	
        return chart
    }

    this.toSVG = function () {
        var svg = document.querySelector('svg')
        var svgSerialised = (new XMLSerializer()).serializeToString(svg)
        return 'data:image/svg+xml;base64,' + window.btoa(svgSerialised)
    }

    this.toPNG = function () {
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
