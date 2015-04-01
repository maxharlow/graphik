function GraphikBarChart(svg, config, layout, data, x, y) {

    var dataMax = Math.max.apply(Math, data.values.map(function (row) {
        return Math.max.apply(Math, row)
    }))

    var dataGroups = Math.max.apply(Math, data.values.map(function (row) {
        return row.length
    }))

    var tickInterval = config.tickInterval || Math.ceil(dataMax / 4)
    var tickNumber = Math.floor(dataMax / tickInterval)
    if (tickNumber > 50) { // too many ticks, ignore
        tickInterval = Math.ceil(dataMax / 4)
        tickNumber = Math.floor(dataMax / tickInterval)
    }
    var tickNumberPadded = dataMax - tickInterval * tickNumber < tickInterval * 0.1 ? tickNumber : tickNumber + 1
    var tickMaximum = (tickNumberPadded * tickInterval) + (tickInterval * 0.5)
    var tickValues = d3.range(0, tickMaximum + 1, tickInterval)

    var chart = svg.append('g')
        .attr('id', 'chart')
        .attr('class', 'bar-chart')
        .attr('transform', 'translate(' + x + ', ' + y + ')')

    if (dataGroups > 1) { // draw legend, but only if we need one
        var legend = chart.append('g')
            .attr('id', 'legend')

        var legendItems = legend.selectAll('g')
            .data(data.columns)
            .enter()
            .append('g')
            .attr('class', function (_, i) { return 'group' + i })

        legendItems.append('circle')
            .attr('cx', '1em')
            .attr('cy', '0.6em')
            .attr('r', '0.5em')
            .attr('shape-rendering', 'auto')

        legendItems.append('text')
            .attr('x', '1em')
            .attr('dx', '1em')
            .attr('dy', '1em')
            .text(function (d) { return d })

        legendItems.attr('transform', function(_, i) {
            return 'translate(' + [].reduce.call(legend.node().childNodes, function (a, node, index) { return index < i ? a + node.getBBox().width + layout.bar.padding.interlegend : a }, 0) + ', ' + 0 + ')'
        })
    }

    var legendHeight = legend ? legend.node().getBBox().height + layout.bar.padding.postlegend : 0

    var plotHeight = (layout.bar.height * dataGroups * data.values.length) // height of all the bars
        + (layout.bar.height * layout.bar.padding.inner * data.values.length) // height of the inner bar spacing
        + (layout.bar.height * layout.bar.padding.outer * 2) // height of the outer bar spacing

    var yScale = d3.scale.ordinal()
        .domain(d3.range(data.rows.length))
        .rangeBands([0, plotHeight], layout.bar.padding.inner / dataGroups, layout.bar.padding.outer)

    var yAxis = d3.svg.axis()
        .orient('left')
        .scale(yScale)
        .tickSize(layout.bar.tickSizeY, 0)
        .tickPadding(layout.bar.padding.tickY)
        .tickValues(d3.range(data.values.length))
        .tickFormat(function (d) { return data.rows[d] })

    var yAxisElement = chart.append('g')
        .attr('id', 'y-axis')
        .call(yAxis)

    yAxisElement.attr('transform', 'translate(' + yAxisElement.node().getBBox().width + ', ' + legendHeight + ')')

    var yScaleGroup = d3.scale.ordinal()
        .domain(d3.range(dataGroups))
        .rangeRoundBands([0, yScale.rangeBand()])

    var plotWidth = layout.width - layout.padding.left - yAxisElement.node().getBBox().width - layout.bar.padding.axisY - layout.padding.right

    var xScale = d3.scale.linear()
        .domain([0, tickMaximum])
        .range([0, plotWidth])

    if (layout.bar.drawXAxis) {
	var xAxis = d3.svg.axis()
            .orient('bottom')
            .scale(xScale)
            .tickSize(layout.bar.tickSizeX, 0)
            .tickPadding(layout.bar.padding.tickX)
            .tickValues(tickValues)
            .tickFormat(function (d) { return config.dataPrefix + d.toLocaleString() + config.dataSuffix })

	chart.append('g')
            .attr('id', 'x-axis')
            .attr('transform', 'translate(' + (yAxisElement.node().getBBox().width + layout.bar.padding.axisY) + ', ' + (legendHeight + plotHeight + layout.bar.padding.axisX) + ')')
            .call(xAxis)
    }

    chart.append('g')
        .attr('id', 'grid')
        .selectAll('line')
        .data(tickValues.slice(1, tickValues.length))
        .enter()
        .append('line')
        .attr('x1', function (d) { return yAxisElement.node().getBBox().width + xScale(d) })
        .attr('y1', legendHeight)
        .attr('x2', function (d) { return yAxisElement.node().getBBox().width + xScale(d) })
        .attr('y2', legendHeight + plotHeight)

    var plot = chart.append('g')
        .attr('id', 'plot')
        .attr('transform', function (_, i) { return 'translate(' + (yAxisElement.node().getBBox().width + layout.bar.padding.axisY) + ',' + legendHeight + ')' })

    var bars = plot.selectAll('g')
        .data(data.values)
        .enter()
        .append('g')
        .attr('transform', function (_, i) { return 'translate(' + 0 + ',' + yScale(i) + ')' })

    var bar = bars.selectAll('g')
        .data(function (d) { return d })
        .enter()
        .append('g')
        .attr('transform', function (_, i) { return 'translate(' + 0 + ',' + yScaleGroup(i) + ')' })
        .attr('class', function (_, i) { return 'bar' + i })

    bar.append('rect')
        .attr('width', function (d) { return xScale(d) })
        .attr('height', yScaleGroup.rangeBand())

    bar.append('text')
        .attr('x', function (d) { return xScale(d) + layout.bar.padding.label })
        .attr('y', yScaleGroup.rangeBand() / 2)
        .attr('dominant-baseline', 'central')
        .text(function (d) { return config.dataPrefix + d.toLocaleString() + config.dataSuffix })

    return chart

}
