Graphik
=======

Make simple charts quickly.

Graphik was built to let journalists rapidly build chart images with a predefined visual style, without needing special software and a team of graphic designers.


Usage
-----

Try it here: [http://maxharlow.com/graphik] (http://maxharlow.com/graphik)

Paste your data in, configure the title and other furniture, then export an image file. If necessary the image can then be imported into Adobe Illustrator for any final touches.


Customising
-----------

By default, Graphik uses its own style, but unlike [other chart-creating tools] (#similar-tools) but you can easily customise it to your own. To do so:

1. Fork this repository into your GitHub account using the Fork button above.
2. In your forked version edit `vendor-style.css`, which defines the colours, fonts, and other stylistic elements, and `vendor-layout.json`, which controls how the different elements of the chart are postioned.
3. You can now use your customised version at: `http://<YOUR-ACCOUNT>.github.io/graphik`.


Updating
--------

You can get the latest updates from this repository without overwriting your customisations. To do this you need to have:

    $ git remote add upstream https://github.com/maxharlow/graphik.git

Then when you want to update, run:

    $ git pull -X ours upstream master
    $ git push origin master


Contributing
------------

Graphik uses the Apache 2.0 licence. Pull requests very welcome.


Similar tools
-------------

* [Datawrapper] (https://datawrapper.de/) by [Mirko Lorenz] (https://twitter.com/mirkolorenz), [Nicolas Kayser-Bril] (https://twitter.com/nicolaskb) and [Gregor Aisch] (https://twitter.com/driven_by_data)
* [Chartbuilder] (http://quartz.github.io/Chartbuilder/) by [David Yanofsky] (https://twitter.com/YAN0) of [Quartz] (http://qz.com/)
* [Mr. Chartmaker] (http://vis4.net/blog/posts/seven-features-youll-wantin-your-next-charting-tool/) by [Gregor Aisch] (https://twitter.com/driven_by_data) of the [New York Times] (http://www.nytimes.com/)
* [Raw] (http://app.raw.densitydesign.org/) by [Density Design] (http://www.densitydesign.org/)
