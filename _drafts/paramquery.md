---
layout: post
title: Interfacing with SQL in R
comments: True
tags:
- Data
- Statistics
- Pipelines
- Technical
---

I write a lot of SQL at work.

It isn't something I necessairly have to do -- they are more interested in the analysis part of what I can do -- but I have found that if I am able to build robust analysis pipelines, I can work faster and build a catalog of data worth saving. When I say pipelines, I mean something like this:

1. Get Data from a Source (for me it is usually a SQL database)
2. Import the data into R (or Python)
3. Clean the data, convert data times, form factors, etc
4. Run analysis
5. Publish something either as an Rmarkdown report, or a slack post (using Slackr) to post some graph to a relevant slack channel.

fad

What I like to do is build import functions in R that accept date and site arguments. I work for a company that manufactures things and has two plants. So we are always inte

## A note about SQL
I am not a SQL first guy, yet a lot of what I am writing about is based on SQL. My colleagues have produced many SQL views [link], and it makes the querying much easier. From what I have read, putting as much work on the database as possible is the optimal solution. 