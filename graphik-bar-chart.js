function GraphikBarChart(svg, config, layout, data, x, y) {

    var dataGroups = Math.max.apply(Math, data.values.map(function (row) {
        return row.length
    }))
    var dataMax = Math.max.apply(Math, data.values.map(function (row) {
        return Math.max.apply(Math, row)
    }))
    var dataMin = Math.min.apply(Math, data.values.map(function (row) {
        return Math.min.apply(Math, row)
    }))

    var tickInterval = Number(config.tickInterval) || Math.ceil(dataMax > Math.abs(dataMin) ? dataMax / 4 : Math.abs(dataMin) / 4)
    var tickNumberPositive = Math.floor(dataMax / tickInterval)
    var tickNumberNegative = Math.abs(Math.ceil(dataMin / tickInterval))
    if (tickNumberPositive > 10 || tickNumberNegative > 10 || (tickNumberPositive < 2 && tickNumberNegative < 2)) { // too many/few ticks, ignore
        tickInterval = Math.ceil(dataMax > Math.abs(dataMin) ? dataMax / 4 : Math.abs(dataMin) / 4)
        tickNumberPositive = Math.floor(dataMax / tickInterval)
        tickNumberNegative = Math.abs(Math.ceil(dataMin / tickInterval))
    }
    var tickNumberPositivePad = dataMax - (tickInterval * tickNumberPositive) < (tickInterval * 0.1) ? tickNumberPositive : tickNumberPositive + 1
    var tickNumberNegativePad = Math.abs(dataMin) - (tickInterval * tickNumberNegative) < (tickInterval * 0.1) ? tickNumberNegative : tickNumberNegative + 1
    var tickMaximum = dataMax <= 0 ? +(tickInterval * 0.5) : (tickNumberPositivePad * tickInterval) + (tickInterval * 0.5)
    var tickMinimum = dataMin >= 0 ? 0 : -(tickNumberNegativePad * tickInterval) - (tickInterval * 0.5)
    var tickValues = d3.range(0, tickMinimum, -tickInterval).concat(d3.range(0, tickMaximum, tickInterval))

    var gridValues = tickValues.filter(function (value) { return value !== 0 })

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

    var yScale = d3.scaleBand()
        .domain(d3.range(data.rows.length))
        .range([0, plotHeight])
        .paddingInner(data.rows.length === 1 ? 0 : layout.bar.padding.inner / dataGroups)
        .paddingOuter(layout.bar.padding.outer)

    var yAxis = d3.axisLeft(d3.range(data.values.length))
        .scale(yScale)
        .tickSize(layout.bar.tickSizeY, 0)
        .tickPadding(layout.bar.padding.tickY)
        .tickFormat(function (d) { return data.rows[d] })

    var yAxisElement = chart.append('g')
        .attr('id', 'y-axis')
        .call(yAxis)

    yAxisElement
        .attr('font-family', null)
        .attr('font-size', null)
        .attr('transform', 'translate(' + yAxisElement.node().getBBox().width + ', ' + legendHeight + ')')

    yAxisElement.selectAll('.tick')
        .attr('opacity', null)

    var yScaleGroup = d3.scaleBand()
        .domain(d3.range(dataGroups))
        .range([0, yScale.bandwidth()])

    var plotWidth = layout.width - layout.padding.left - yAxisElement.node().getBBox().width - layout.bar.padding.axisY - layout.padding.right

    var xScale = d3.scaleLinear()
        .domain([tickMinimum, tickMaximum])
        .range([0, plotWidth])

    if (layout.bar.drawXAxis) {
        var xAxis = d3.axisBottom(xScale)
            .scale(xScale)
            .tickSize(layout.bar.tickSizeX, 0)
            .tickPadding(layout.bar.padding.tickX)
            .tickValues(tickValues)
            .tickFormat(function (d) { return config.dataPrefix + d.toLocaleString() + config.dataSuffix })

        var xAxisElement = chart.append('g')
            .attr('id', 'x-axis')
            .attr('transform', 'translate(' + (yAxisElement.node().getBBox().width + layout.bar.padding.axisY) + ', ' + (legendHeight + plotHeight + layout.bar.padding.axisX) + ')')
            .call(xAxis)

        xAxisElement
            .attr('font-family', null)
            .attr('font-size', null)

        xAxisElement.selectAll('.tick')
            .attr('opacity', null)
    }

    chart.append('g')
        .attr('id', 'grid')
        .attr('transform', 'translate(' + yAxisElement.node().getBBox().width + ', ' + 0 + ')')
        .selectAll('line')
        .data(gridValues)
        .enter()
        .append('line')
        .attr('x1', xScale)
        .attr('y1', legendHeight)
        .attr('x2', xScale)
        .attr('y2', legendHeight + plotHeight)

    var plot = chart.append('g')
        .attr('id', 'plot')
        .attr('transform', function (_, i) { return 'translate(' + (yAxisElement.node().getBBox().width + layout.bar.padding.axisY) + ', ' + legendHeight + ')' })

    var barGroups = plot.selectAll('g')
        .data(data.values)
        .enter()
        .append('g')
        .attr('transform', function (_, i) { return 'translate(' + 0 + ', ' + yScale(i) + ')' })

    var bars = barGroups.selectAll('g')
        .data(function (d) { return d })
        .enter()
        .append('g')
        .attr('transform', function (d, i) { return 'translate(' + xScale(Math.min(0, d)) + ', ' + yScaleGroup(i) + ')' })
        .attr('class', function (_, i) { return 'bar' + i })

    bars.append('rect')
        .attr('width', function (d) { return Math.abs(xScale(d) - xScale(0)) })
        .attr('height', yScaleGroup.bandwidth())
        .attr('class', function (d) { return d < 0 ? 'bar negative' : 'bar positive' })

    if (layout.bar.drawLabels) bars.append('text')
        .attr('y', yScaleGroup.bandwidth() / 2)
        .attr('dominant-baseline', 'central')
        .text(function (d) { return config.dataPrefix + d.toLocaleString() + config.dataSuffix })
        .attr('class', function (d) {
            var bar = d3.select(this.parentNode).select('rect')
            var useInternal = layout.bar.useInternalLabels && bar.node().getBBox().width > this.getBBox().width + layout.bar.padding.label * 2
            return useInternal ? 'internal' : 'external'
        })
        .attr('x', function (d) {
            var bar = d3.select(this.parentNode).select('rect')
            var useInternal = layout.bar.useInternalLabels && bar.node().getBBox().width > this.getBBox().width + layout.bar.padding.label * 2
            return useInternal ? Math.abs(xScale(d) - xScale(0)) - this.getBBox().width - layout.bar.padding.label : Math.abs(xScale(d) - xScale(0)) + layout.bar.padding.label
        })

    chart.append('g')
        .attr('id', 'zeroline')
        .attr('transform', 'translate(' + (yAxisElement.node().getBBox().width + xScale(0)) + ', ' + legendHeight + ')')
        .call(yAxis.tickValues([]).tickSizeOuter(0))
        .attr('font-family', null)
        .attr('font-size', null)
        .attr('fill', null)
        .attr('text-anchor', null)

    return chart

}
