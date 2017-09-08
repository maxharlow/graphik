function GraphikLineChart(svg, config, layout, data, x, y) {

    function transpose(array) {
        return array[0].map(function (_, c) { return array.map(function (r) { return r[c] }) })
    }

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
    var tickMaximum = dataMax <= 0 ? +(tickInterval * 0.5) : (tickNumberPositivePad * tickInterval) + (tickInterval * 0.001)
    var tickMinimum = dataMin >= 0 ? 0 : -(tickNumberNegativePad * tickInterval) - (tickInterval * 0.001)
    var tickValues = d3.range(0, tickMinimum, -tickInterval).concat(d3.range(0, tickMaximum, tickInterval))

    var gridLowest = Math.min.apply(Math, tickValues) < 0 ? Math.min.apply(Math, tickValues) : null
    var gridValues = tickValues.filter(function (value) { return value !== 0 && value !== gridLowest })

    var chart = svg.append('g')
        .attr('id', 'chart')
        .attr('class', 'line-chart')
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
            return 'translate(' + [].reduce.call(legend.node().childNodes, function (a, node, index) { return index < i ? a + node.getBBox().width + layout.line.padding.interlegend : a }, 0) + ', ' + 0 + ')'
        })
    }

    var legendHeight = legend ? legend.node().getBBox().height + layout.line.padding.postlegend : 0

    var yScale = d3.scaleLinear()
        .domain([tickMinimum, tickMaximum])
        .range([layout.line.plotHeight, 0])

    var yAxis = d3.axisLeft()
        .scale(yScale)
        .tickSize(layout.line.tickSizeY, 0)
        .tickPadding(layout.line.padding.tickY)
        .tickValues(tickValues)
        .tickFormat(function (d) { return config.dataPrefix + d.toLocaleString() + config.dataSuffix })

    var yAxisElement = chart.append('g')
        .attr('id', 'y-axis')
        .call(yAxis)

    yAxisElement
        .attr('font-family', null)
        .attr('font-size', null)
        .attr('transform', 'translate(' + yAxisElement.node().getBBox().width + ', ' + legendHeight + ')')

    yAxisElement.selectAll('.tick')
        .attr('opacity', null)

    var plotWidth = layout.width - layout.padding.left - yAxisElement.node().getBBox().width - layout.line.padding.axisY - layout.padding.right

    var xScale = d3.scaleTime()
        .domain(d3.extent(data.rows, function (r) { return new Date(r) }))
        .range([0, plotWidth])

    var xAxis = d3.axisBottom()
        .scale(xScale)
        .tickSize(layout.line.tickSizeX, 0)

    var xAxisElement = chart.append('g')
        .attr('id', 'x-axis')
        .attr('transform', 'translate(' + (yAxisElement.node().getBBox().width + layout.line.padding.axisY) + ', ' + (legendHeight + layout.line.plotHeight + layout.line.padding.axisX) + ')')
        .call(xAxis)

    xAxisElement
        .attr('font-family', null)
        .attr('font-size', null)

    xAxisElement.selectAll('.tick')
        .attr('opacity', null)

    xAxisElement.selectAll('text')
        .attr('transform', 'rotate(90)')
        .attr('x', layout.line.tickSizeX + layout.line.padding.tickX)
        .attr('y', '0.3em')
        .attr('dy', null)
        .attr('text-anchor', 'start')

    chart.append('g')
        .attr('id', 'grid')
        .attr('transform', 'translate(' + (yAxisElement.node().getBBox().width + layout.line.padding.axisY) + ', ' + 0 + ')')
        .lower()
        .selectAll('line')
        .data(gridValues)
        .enter()
        .append('line')
        .attr('x1', 0)
        .attr('y1', function (d) { return yScale(d) + legendHeight })
        .attr('x2', plotWidth)
        .attr('y2', function (d) { return yScale(d) + legendHeight })

    chart.append('g')
        .attr('id', 'zeroline')
        .attr('transform', 'translate(' + (yAxisElement.node().getBBox().width + layout.line.padding.axisY) + ', ' + (legendHeight + yScale(0)) + ')')
        .call(xAxis.tickValues([]).tickSizeOuter(0))
        .attr('font-family', null)
        .attr('font-size', null)
        .attr('fill', null)
        .attr('text-anchor', null)

    var plot = chart.append('g')
        .attr('id', 'plot')
        .attr('transform', function (_, i) { return 'translate(' + (yAxisElement.node().getBBox().width + layout.line.padding.axisY) + ' ,' + legendHeight + ')' })
        .attr('fill', 'none')

    var line = d3.line()
        .defined(function (d) { return d !== undefined })
        .y(function (d) { return yScale(d) })
        .x(function (_, i) { return xScale(new Date(data.rows[i])) })
        .curve(d3.curveCatmullRom)

    plot.selectAll('path')
        .data(transpose(data.values))
        .enter()
        .append('path')
        .attr('class', function (d, i) { return 'line' + i })
        .attr('shape-rendering', 'auto')
        .attr('d', line)

    return chart

}
