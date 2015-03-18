function GraphikBarChart(svg, config, layout, data, x, y) {
    var dataMax = Math.max.apply(Math, data.map(function (d) { return d.value }))
    var tickInterval = config.tickInterval || Math.ceil(dataMax / 4)
    var tickNumber = Math.floor(dataMax / tickInterval)
    if (tickNumber > 50) { // too many ticks, ignore
        tickInterval = Math.ceil(dataMax / 4)
        tickNumber = Math.floor(dataMax / tickInterval)
    }
    var tickNumberPadded = dataMax - tickInterval * tickNumber < tickInterval * 0.1 ? tickNumber : tickNumber + 1
    var tickMaximum = (tickNumberPadded * tickInterval) + (tickInterval * 0.5)
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
