---
layout: post
title: Plotting DW-NOMINATE scores without a group variable
comments: True
tags:
- Academics
- Statistics
- Congress
- RStats
- Data
---

One thing that people who study Congress inevitably need to deal with is plotting the main measure for Congressional ideology, [DW-NOMINATE](http://voteview.com/dwnomin.htm), by Congress and broken down by party. Depending on your needs, you might also need to differentiate between Northern and Southern Democrats in the plot. The scholars that developed DW-NOMINATE have made a pretty good version of this graph for their[ own blog](http://voteview.com/political_polarization_2014.htm), but I need something a little higher quality for published work.

This should be straight forward to do in ggplot, but the three types of Democrats throws off my usual way of doing it. The way ggplot wants someone to make graphs with multiple lines is to make the base graph (which in this case would be x = Congress and y = average ideology) and then using the color function to color each line according to an exclusive  party variable. So those with the party = 1 would get one color, those with the party = 2 get another, etc. There might be a way to create such a graph this way, but I can't figure it out. The fact that I want to count Democrats for the "Democrats" line and then separate them out by Southern and Northern for two other lines causes this way to not function as I'd want. So, in this post, I'm going to make this graph using ggplot, but not using ggplot 'the easy way' to do so.

Before I get started, I want to say that the base DW-NOMINATE data has ideology scores for every individual member of Congress, ever but I want to plot the mean Democrat, mean Republican, etc, for each Congress. There are ways to aggregate data up to those quantities of interest in ggplot using the [stat_summary](http://docs.ggplot2.org/current/stat_summary.html) function, but since I am not playing by the color rules usually required by ggplot, everything that makes ggplot fairly easy works against me. This is one of those cases. That isn't to say that I am blaming ggplot, just that it requires a work around. In this case, I used the reshape2 package to create a dataframe that contained averages for all my categories of interest. That is to say, I reshaped the data so that each row is a Congress and there are four columns with averages for the three Democratic groups and the Republicans. If there is interest, I can post that code later on. In any case, my strategy in this graph is to basically plot each line separately on the same graph. It isn't difficult, but figuring out how to customize the graph and make it look nice took some time.

Here is the graph that I produced and below that, the code. Everything should be self explanitory with the comments. You'll just notice that due to the lack of grouping variable I had to override the color scale and do some trickery with the legend. I could have put the legend in the actual graph (as in the voteview example linked above), but I kind of like the way it looks at the bottom. As always, please let me know if you have any questions.

![DW-NOMINATE Over Time](http://adamolson.org/files/images/posts/nominate/p1gv1ww2.png "DW-NOMINATE Over Time")

```r
## Try Plotting the Normal Party Mean
### Looks Okay.
p1gv1ww2 <- ggplot(Agg80, aes(Congress)) +
  geom_line(aes(y = Republican, colour = "Republican Mean"), size = 1.8) +
  geom_line(aes(y = Democratic, colour = "Democratic Mean"), size = 1.8) +
  geom_line(aes(y = SouthernDemocrat, colour = "Southern Democrat Mean"), size = 1.1, linetype="dashed") +
  geom_line(aes(y = NorthernDemocrat, colour = "Northern Democrat Mean"), size = 1.1, linetype="dashed")

### Make Labels Correct
p1gv1ww2 <- p1gv1ww2 + labs(x="Congress", y="DW-Nominate Score", title="Average DW-NOMINATE Score in the House of Representatives")

### Make the Scale Correct
p1gv1ww2 <- p1gv1ww2 + ylim(c(-1,1)) + scale_x_continuous(breaks=c(70, 75, 80, 85, 90, 95, 100, 105, 110))

### Change colors to partisan version
p1gv1ww2 <- p1gv1ww2 + scale_color_manual(values=c("steelblue", "royalblue4", "darkred", "goldenrod3"))

### Change themes
p1gv1ww2 <- p1gv1ww2 + theme_bw()

### Make Legend Better
p1gv1ww2 <- p1gv1ww2 + theme(legend.title=element_blank(), legend.position="bottom", legend.key = element_blank())

### Download It
dev.copy(png,'p1gv1ww2.png')
dev.off()
```
