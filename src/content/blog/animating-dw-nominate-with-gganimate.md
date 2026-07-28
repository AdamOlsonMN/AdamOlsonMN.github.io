---
title: Animating DW-NOMINATE Scores with gganimate
description: Using gganimate to show how the ideological distribution of Congress has shifted since World War II.
pubDate: 2019-02-05
tags:
  - R
  - Congress
  - gganimate
---

In a previous life, I studied how the U.S. Congress made laws. One question I was especially interested in was how the ideological composition of Congress changed over time. This is a nice question to be interested in because Congress has existed in roughly its current form for a few hundred years, and combined with the fact that we can estimate ideology using roll call votes, we have lots of data. There are tons of books about how legislative ideology has changed over time, but side-stepping all that, we can see the changes in member ideology by plotting DW-NOMINATE scores over time. More specifically for this post, we can animate those changes using gganimate.

Before getting too far into this: DW-NOMINATE scores have two components. The first (first dimension) is the traditional left-right axis, scaled from -1 to +1, with the most liberal members near -1 and the most conservative near +1 — historically, someone like Ron Paul was usually close to +1. Most people, in academia and in the news, focus on this dimension. There's also a second dimension, scaled the same way, historically thought to reflect differences on racial issues. In modern Congresses most race-related issues have folded into the traditional left-right continuum, but that wasn't always the case.

gganimate is pretty cool, but I think it really shines when showing change over time, which is what I'll do here with two graphs. Both show the distribution of Democrats and Republicans since World War II ended. You'd probably need a few other graphs to really stress every point being made here, but if you loop through these a few times, I think you'll develop a pretty good intuition for what's happened to Congress since Truman was president.

I'm partial to the first graph, but I think they both have good information in them.

![DW-NOMINATE first-dimension scores animated over time, by Congress](/images/animating-dw-nominate-with-gganimate/first-dim.gif)

![DW-NOMINATE second-dimension scores animated over time, by Congress](/images/animating-dw-nominate-with-gganimate/second-dim.gif)

[You can get all the code and data to reproduce these (and they're quite easy) here](https://github.com/AdamOlsonMN/DWNominateAnimations).
