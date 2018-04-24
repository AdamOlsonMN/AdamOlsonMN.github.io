---
layout: post
title: Mapping Data in R
comments: True
tags:
- Academics
- Statistics
- Maps
- Nullification
- RStats
---
Feb 2017 edit: It has come to my attention when helping someone else with a map problem that I didn't put in here that you have to add a "district of columbia" observation into your data in the alphabetical order and just put a zero for the variable of interest. If you don't have the DC observation, it won't merge correctly with the coordinates file.

I've been working on a paper about the return of nullification in the states that I am presenting with two other people at APSA next month. One part I am working on is doing an overview of the actual spread of [nullification](https://en.wikipedia.org/wiki/Nullification_(U.S._Constitution)). I thought (and continue to think) that one of the simplest ways to show where the nullification activity is located is to plot how many nullification bills were introduced in each state during this last legislative session. For instance, Texas had ten bills attempting to nullify federal laws introduced during the 2015 legislation session while Ohio, only one. The only problem is that I've never worked with GIS or any other map plotting program.

The way this post will procede is that I'll go over how to make such a map with the [maps package in R](http://cran.r-project.org/web/packages/maps/index.html) and then I'll go over how to actually read in map "shapefiles" which provides much more extensive flexibility than the maps package. The broader motivation for this is that, outside of the maps package, it seemed kind of difficult / not well documented for how to make maps in R. That said, I relied heavily on [these](http://www.bertplot.com/visualization/?p=429) two [posts](http://www.bertplot.com/visualization/?p=524) from [bertplot.com](bertplot.com). I don't know who runs the blog, but his posts were BY FAR the best tutorials on how to make maps.

## Maps Package in R
The maps package seems to have a bunch of canned maps in the package -- which is what makes it easier to work with than loading in the raw shapefiles yourself. Basically the logic for plotting data with a 'maps' map is that you load in the map you want from the package (in my case, a state level map of the United States), load in the data you want to plot, combine the two and make a plot. Some people out there say you don't need to actually merge the two files but I couldn't get that to work -- though I didn't spend too long on that particular strategy. The code to do that looks like this:

```r
# Actually making maps
# Load up the Nullification Data and combine it to make graphs
library(ggplot2)
library(maps)
library(plyr)
library("RColorBrewer")
# Set WD
## School
setwd("C:/Users/olso4075/Desktop/GitHub/nullification/Descriptive Section/Data Work")

### School
totalstate = read.csv("C:/Users/olso4075/Desktop/GitHub/nullification/Descriptive Section/Data Work/AggregateBills.csv", header=TRUE)

# Create States DF
state.coords <- map_data("state")

# Merge State coord and data file.
state.dat<-merge(state.coords,
                 totalstate,
                 by.x = 'region',
                 by.y = 'state',
                 sort = F,
                 all.x=T)   # Keep all coordinate lines

# Make sure our data are in the correct order
state.dat=state.dat[order(state.dat$order),]

# Plotting # of raw nullificaton bills introduced
## Basic Map
map <- ggplot(state.dat)
map <- map + theme_bw()
map <- map + geom_polygon(aes(x = long, y = lat, group = group,fill = factor(introduced)),
                          colour = "white", lwd = 0.3)
map <- map + coord_map(project="conic", lat0 = 30)

## Create color scale since this won't work
colors <-brewer.pal(9, 'PuBu')
pal <-colorRampPalette(colors)

## Add a colors and a legend and title
map <- map + scale_fill_manual(name="# Nullification \n Bills \n Introduced", values = pal(12) )
map <- map + guides(fill = guide_legend(override.aes = list(colour = NULL)))
map <- map + labs(title="Nullification Bills Introduced in State Legislatures")

## Blank axis ticks
map <- map + theme(axis.ticks = element_blank(),
                   axis.text.x = element_blank(),
                   axis.text.y = element_blank(),
                   axis.title.x= element_blank(),
                   axis.title.y= element_blank())
# Hide Gridlines
map <- map + theme(panel.grid.minor=element_blank(),
                   panel.grid.major=element_blank())
```
The above code produces the following graph.
![Nullification in the States](http://adamolson.org/files/images/posts/nullification/firstgraph.png "Nullification in the States")

Let's break down the code a little.

```r
# Create States DF
state.coords <- map_data("state")

# Merge State coord and data file.
state.dat<-merge(state.coords,
                 totalstate,
                 by.x = 'region',
                 by.y = 'state',
                 sort = F,
                 all.x=T)   # Keep all coordinate lines
```

This section is the most difficult section of using the maps package. We create a dataframe for the state level coordinates and merge it with the 'totalstate' df which is a two column dataframe with states and how many nullification bills that state had during this last session. The state names need to be lowercase. This is extremely important and will be important for the other method as well. If your state names are not lower cased and the variable 'state' lowercased then it won't merge. Here is what the first few lines of the 'totalstate' df look like:


state   | introduced
:------:|:---------:
alabama | 2
alaska  | 3
arizona | 5
arkansas| 5

After that it's just a matter of plotting the data. There was a little uniqueness for me with respect to color that I want to spend just a minute on. Take a look at this code:

```r
## Create color scale since this won't work
colors <-brewer.pal(9, 'PuBu')
pal <-colorRampPalette(colors)

## Add a colors and a legend and title
map <- map + scale_fill_manual(name="# Nullification \n Bills \n Introduced", values = pal(12) )
map <- map + guides(fill = guide_legend(override.aes = list(colour = NULL)))
map <- map + labs(title="Nullification Bills Introduced in State Legislatures")
```
This is where I try to deal with how to scale the state data. The range of data is 0-11 and I want the colors to look sequential, as in the more nullification bills I have the darker a state becomes. The best color package RColorBrewer doesn't have sequential patterns that go up to 11 (check out [here](http://colorbrewer2.org/) for a list of them). However, with the brewer.pal function you can create a custom scheme based on one of the RColorBrewer schemes. In this case, I use the full range (9) of the PuBu scheme and extrapolate to 12 colors (which we can see with the "values = pal(11)" line. 11 for the actual values and one for the zero value.

In any case, the graph looks pretty good. I sent it to one of my coauthors and he responded with "looks good, what about Alaska and Hawaii?" Then I found out that the states map in the maps package only contains the mainland U.S., and that I'd probably have to read in my own shape files and go from there. Luckily this isn't that much more difficult than using the maps package but it is still a bit harder.

## Harder Way to Make Maps
The other way to make maps is to read in the raw shape files that contain the information for how a map looks. Shape files can be anything. [See this post on Hadley Wickham's github page for more information.](https://github.com/hadley/ggplot2/wiki/plotting-polygon-shapefiles) In this case, we are again looking at state level data. The logic is the same as using the maps package. We load in the shape files, load in our data of interest, merge them and plot them. In this case, the first step of loading in the shape files are the hardest part. You can download the map shape files from the [U.S. Census here](https://www.census.gov/geo/maps-data/data/cbf/cbf_state.html).

Here is the code:

```r
library(maptools)
library(mapproj)
library(rgeos)
library(rgdal)
library(RColorBrewer)
library(ggplot2)
library(grid)

#
# Load SpatialPolygonsDataFrame of US State borders
#
setwd("C:/Users/olso4075/Desktop/GitHub/nullification/Descriptive Section/Data Work")

# Load file
states50 <-readOGR(dsn='.',layer='cb_2013_us_state_20m')

# Change projection
states50 <- spTransform(states50, CRS("+proj=laea +lat_0=45 +lon_0=-100 +x_0=0 +y_0=0 +a=6370997 +b=6370997 +units=m +no_defs"))
states50@data$id <- rownames(states50@data)


# Rotate, Scale and Move Alaska
# Alaska State ID Number=02
# https://www.census.gov/geo/reference/docs/state.txt
alaska <- states50[states50$STATEFP=="02",]
alaska <- elide(alaska, rotate=-50)
alaska <- elide(alaska, scale=max(apply(bbox(alaska), 1, diff)) / 2.2)
alaska <- elide(alaska, shift=c(-2100000, -2500000))

# Force projection to be that of original plot
proj4string(alaska) <- proj4string(states50)

# Rotate and Move Hawaii, ID=15
hawaii <- states50[states50$STATEFP=="15",]
hawaii <- elide(hawaii, rotate=-35)
hawaii <- elide(hawaii, shift=c(5400000, -1400000))

# Force projection to be that of original plot
proj4string(hawaii) <- proj4string(states50)

# remove old Alaska/Hawaii and also DC, virgin islands, mariana, puerto rico, etc...
states48 <- states50[!states50$STATEFP %in% c("02", "15", "72","66","60","69","74","78",'11'),]
states.final <- rbind(states48, alaska, hawaii)

# Load my data
## School
AggregateBills = read.csv("C:/Users/olso4075/Desktop/GitHub/nullification/Descriptive Section/Data Work/AggregateBills.csv", header=TRUE)

# Merge
states.final@data$state=tolower(states.final@data$NAME)
states.final@data<-merge(states.final@data,
                         AggregateBills,
                         by='state',
                         sort = F,
                         all.x=T)

# Transform Shapefile into data.frame for plotting.
states.plotting<-fortify(states.final,region='state')

# Merge Data with fortified shapefile
state.dat<-merge(states.plotting,
                 AggregateBills,
                 by.x='id',
                 by.y = 'state',
                 sort = F,
                 all.x=T)   # Keep all coordinate lines

state.dat=state.dat[order(state.dat$order),]

# Set up colors
colors_aggro <-brewer.pal(5, 'Oranges')
pal_aggro <-colorRampPalette(colors_aggro)

# Graph for Raw # Introduced
aggro <-ggplot(state.dat)
aggro <- aggro + theme_bw()
aggro <- aggro + geom_polygon(aes(x = long, y = lat, group = group,fill = factor(introduced)),
                      colour = "black", lwd = 0.3)


## Add a colors and a legend
aggro <- aggro + scale_fill_manual(name="# Nullification \n Bills \n Introduced", values = pal_aggro(12) )
aggro <- aggro + guides(fill = guide_legend(override.aes = list(colour = NULL)))
aggro <- aggro +labs(title="Nullification Bills Introduced in State Legislatures")

## Increase legend size
aggro <- aggro + theme(axis.ticks = element_blank(),
                   axis.text.x = element_blank(),
                   axis.text.y = element_blank(),
                   axis.title.x= element_blank(),
                   axis.title.y= element_blank())
## Hide Gridlines
aggro <- aggro + theme(panel.grid.minor=element_blank(),
                   panel.grid.major=element_blank())
aggro

```
and here is the image it produces:

![Nullification in the States](http://adamolson.org/files/images/posts/nullification/aggro.png "Nullification in the States")

In this case, I just took the map code from bertplot and I graciously let that do all the heavy lifting with respect to adding Hawaii and Alaska down to Mexico. I do want to reiterate how important it is to have the merging variables just so. I spent probably half a day trying to get this to work and couldn't because I had misspelled Delaware. For real. Never again will I misspell Delaware. If your state names are spelled correctly and ensure that the state variable name is the same case as the state variable name in the map dataframe it should merge easily and just be a matter of making the plot.

Let me know if you have any questions.
