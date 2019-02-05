---
layout: post
title: An gganimate and DW-NOMINATE scores
comments: True
tags:
- Congress
- US Senate
- US House
- History
- RStats

---


In a previous life, I studied how the U.S. Congress made laws.  One question I was especially interested in was how the ideological composition of Congress changed over time. This is kind of a nice question to be interested in because Congress has existed in a current form for a few hundred years. Combined with the fact that we can estimate ideology using roll call votes, we have lots of data! There are TONS of books about how legislative ideology has changed over time. However, side stepping all that, we can see the changes in member ideology by plotting DW-NOMINATE scores over time. More specifically for this post, we can animate changes in DW-NOMINATE scores over time using gganimate.

Before we get too far into this, DW-NOMINATE scores have two components. The first component (first dimension) is the traditional left-right component. It is scaled from -1 to +1 with the most liberal being a negative one and the most conservative being a positive one. Historically, someone like Ron Paul was usually +1. Most people both in academia and also the news focus on this dimension. There is also a second dimension, which is scaled the same way, that was thought to reflect differences on racial issues. In the modern Congresses, most race related issues are folded into the traditional left-right continuum but that wasn't always the case.

gganimate is pretty cool, but I think it really shines when showing changes over time. Which is what I will do here using two different graphs. Both of these graphs show the distribution of Democrats and Republicans since world war two ended. My sense is that you'd need a few other graphs to really stress the points being made here, but if you loop through these a few times, I believe you will develop a pretty nice intuition for what has happened since Truman was President.

I am partial to the first graph, but I think they both have good information.

![First Dim](https://raw.githubusercontent.com/AdamOlsonMN/DWNominateAnimations/master/output/20190119%20-%20DW%20Nominate%20Animation%20Distro%20Scores.gif "First Dem")
 

![First Dim](https://github.com/AdamOlsonMN/DWNominateAnimations/blob/master/output/20190119%20-%20DW%20Nominate%20Animation%20Two%20Dim%20Scores.gif?raw=true "Second Dem")
 

[You can get all the code and data to reproduce these (and they are quite easy!) here](https://github.com/AdamOlsonMN/DWNominateAnimations)