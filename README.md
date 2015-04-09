Graphik
=======

Make simple charts quickly.

Graphik was built to let journalists rapidly build chart images with a predefined visual style, without needing special software or a team of graphic designers.


Usage
-----

Try it here: [http://tbij.github.io/graphik] (http://tbij.github.io/graphik)

Paste your data in, configure the title and other furniture, and export either a PNG or SVG file. An SVG can then be imported into Illustrator for final touches if necessary.


Customising
-----------

Unlike [other chart-creating tools] (#similar-tools) Graphik makes it is easy to customise the style of charts it creates. By default, Graphik uses the house style of [the Bureau of Investigative Journalism] (http://www.thebureauinvestigates.com/), but you can easily customise it to your own.

1. Fork this repository.
2. In your forked version edit `vendor-style.css`, which defines the colours, fonts, and other stylistic elements, and `vendor-layout.json`, which controls how the different elements of the chart are postioned.
3. You can now use your customised version at: `http://<YOUR-ACCOUNT-NAME>.github.io/graphik`.


Contributing
------------

Graphik uses the Apache 2.0 licence. Pull requests are very welcome.


Future plans
------------

* Support negative values in bar charts
* Support line charts
* Save previously created charts in local storage
* Expert-mode for adding arbitrary Javascript
* Free-text annotations


Similar tools
-------------

* [Datawrapper] (https://datawrapper.de/) by [Mirko Lorenz] (https://twitter.com/mirkolorenz), [Nicolas Kayser-Bril] (https://twitter.com/nicolaskb) and [Gregor Aisch] (https://twitter.com/driven_by_data)
* [Chartbuilder] (http://quartz.github.io/Chartbuilder/) by [David Yanofsky] (https://twitter.com/YAN0) of [Quartz] (http://qz.com/)
* [Mr. Chartmaker] (http://vis4.net/blog/posts/seven-features-youll-wantin-your-next-charting-tool/) by [Gregor Aisch] (https://twitter.com/driven_by_data) of the [New York Times] (http://www.nytimes.com/)
* [Raw] (http://app.raw.densitydesign.org/) by [Density Design] (http://www.densitydesign.org/)
