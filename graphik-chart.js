function GraphikChart(display, layout) {

    this.draw = function (data, config) {
        d3.select(display).select('svg').remove()
        var svg = d3.select(display).append('svg')

	var graphikChart = config.type === 'line' ? GraphikLineChart : GraphikBarChart

        var header = drawHeader(svg, config, layout.padding.left, layout.padding.top)
        var chart = new graphikChart(svg, config, layout, data, layout.padding.left, layout.padding.top + header.node().getBBox().height + layout.padding.prechart)
        var footer = drawFooter(svg, config, layout.padding.left, layout.padding.top + header.node().getBBox().height + layout.padding.prechart + chart.node().getBBox().height + layout.padding.postchart)

        runCustom(svg, config, data)

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
            .call(wrap, layout.width - layout.padding.left - layout.padding.right)

        if (config.subtitle !== '') {
            var subtitle = header.append('text')
                .attr('id', 'subtitle')
                .attr('dy', '1em')
                .text(config.subtitle)
                .call(wrap, layout.width - layout.padding.left - layout.padding.right)

            subtitle.attr('y', parseInt(title.style('font-size')) + layout.padding.intertitle)
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
            .call(wrap, layout.width - layout.padding.left - layout.padding.right)

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

    function runCustom(svg, config, data) {
        try {
            var custom = new Function(['d3', 'svg', 'data'], config.customScript)
            custom(d3, svg, data)
        }
        catch (e) {
            // ignore invalid code
        }
    }

    // disabled until CanVG <tspan> alignment bug is fixed: https://github.com/gabelerner/canvg/issues/362
    function wrap(input, width) {
        // var words = input.text().split(/\s+/)
        // input.text('')
        // words.reduce(function (lines, word) {
        //     var line = lines[lines.length - 1]
        //     if (line === undefined) {
        //         var newLine = input.append('tspan')
        //         newLine.text(word)
        //         lines.push(newLine)
        //     }
        //     else if (word === '<br>') { // fake line breaks
        //         var newLine = input.append('tspan')
        //         newLine.attr('x', 0).attr('dy', 1.1 + 'em')
        //         lines.push(newLine)
        //     }
        //     else if (line.node().getComputedTextLength() >= width) {
        //         var lastWords = line.text().split(/\s+/)
        //         var lastWord = lastWords.pop()
        //         line.text(lastWords.join(' '))
        //         var newLine = input.append('tspan')
        //         newLine.text(lastWord + ' ' + word)
        //         newLine.attr('x', 0).attr('dy', 1.1 + 'em')
        //         lines.push(newLine)
        //     }
        //     else if (line.text() === '') {
        //         line.text(word)
        //     }
        //     else line.text(line.text() + ' ' + word)
        //     return lines
        // }, [])
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
