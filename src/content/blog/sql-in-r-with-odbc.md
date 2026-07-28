---
title: Interfacing with SQL in R Using the odbc Package
description: How I structure reusable, parameterized R functions for pulling data out of SQL Server with the odbc package.
pubDate: 2018-12-17
tags:
  - R
  - SQL
  - Data pipelines
---

One of the things I do at work is develop reusable pipelines to get data into R. In my case, this means either writing SQL or stealing some SQL someone else wrote and adapting it for my purposes. I don't strictly have to do this — the team is more interested in the analysis part of what I can do — but I've found that building robust analysis pipelines lets me work faster and build a catalog of data worth saving for future analysis. My pipelines generally look like:

1. Get data from a source (for me, usually a SQL database)
2. Import the data into R (or Python)
3. Clean the data, convert datetimes, form factors, etc.
4. Run the analysis
5. Publish something — an Rmarkdown report, or a Slack post (using Slackr) with a graph to a relevant channel

In this post, I'll talk about how I organize the first step of that process: writing import functions. Generally this means writing an import function that accepts a date range and a location argument (the company has two locations), so it's reusable across different time windows. People here are always interested in time-bound comparisons — "what was different between these dates versus those dates" — so that pattern comes up a lot.

A couple of caveats before I get started. First, it takes a little time to write one of these functions, so I generally only do it if I expect to reuse it. I also wrote a generic one-off query function for cases that don't warrant a dedicated import function — I'd recommend doing the same. Last, I wrote an internal R package to store these functions. Not all of them make it into the package immediately, but it's very nice to be able to write `data <- InternalRPackage::ImportChemistryData()` and just have the data in R.

Here is the code for the function:

```r
ImportData <- function(
  Site = 'DefaultSite',
  StartTime = '2018-01-01',
  EndTime = '2018-12-01') {

  Con <- odbc::dbConnect(odbc::odbc(),
    driver = "{SQL Server}",
    server = ServerName,
    uid = "user",
    pwd = "password")

  Query <- odbc::dbSendQuery(
    Con, "
    DECLARE @Site VARCHAR(10)
    DECLARE @StartTime datetime
    DECLARE @EndTime datetime

    SET @Site = ?
    SET @StartTime = ?
    SET @EndTime = ?

    SELECT *
    FROM dbo.table
    WHERE Site = @Site
      AND Date >= @StartTime
      AND Date <= @EndTime
    ")

  odbc::dbBind(Query, list(Site, StartTime, EndTime))
  dat <- odbc::dbFetch(Query)
  odbc::dbClearResult(Query)
  return(dat)
}
```

Let me break it down a bit. In the function itself, I usually provide defaults so I can more easily test it while writing. They also make it easier to do an on-the-fly demo, which happens a lot — I'm the only statistical programmer on a team of "real developers," so they're always interested in seeing things in action.

The `Con` line is pretty standard odbc. In my case I actually use my Active Directory credentials in the connection string, which means replacing the `uid`/`pwd` lines with `trusted_connection = true`. I replaced it with a generic username/password here so it's clear what's happening. The [official documentation](https://db.rstudio.com/best-practices/managing-credentials) has good guidance on alternatives to storing a plain-text password in reusable code — you might also abstract the connection string out into a reusable template in your internal package, so if a server name changes you only change it in one place.

The next chunk starts the SQL query:

```r
Query <- odbc::dbSendQuery(
  Con, "
  DECLARE @Site VARCHAR(10)
  DECLARE @StartTime datetime
  DECLARE @EndTime datetime

  SET @Site = ?
  SET @StartTime = ?
  SET @EndTime = ?
```

Any query sent through odbc needs a connection object, which we defined earlier as `Con`. The `dbSendQuery` function lets you pass variables from R into SQL, whereas the other main odbc function, `dbGetQuery`, does not do that natively. (You can hack `dbGetQuery` into accepting arguments, but [you shouldn't](https://db.rstudio.com/best-practices/run-queries-safely/).) The way you pass R arguments into SQL as parameters is by declaring the parameters in SQL and setting them to a `?`. You'll need to know the datatype of the SQL column, but that's usually easy to check wherever you browse the database.

Next comes the meat of the query — the `DECLARE`/`SET` lines are part of the query text too, but this is where you specify what you're actually looking for:

```r
SELECT *
FROM dbo.table
WHERE Site = @Site
  AND Date >= @StartTime
  AND Date <= @EndTime
```

I'm telling SQL to get all columns from `dbo.table`, but only where `Site` equals my `@Site` parameter and `Date` falls between `@StartTime` and `@EndTime`. You can imagine pasting in more parameters here — just keep adding `DECLARE`/`SET` pairs at the top with matching arguments in the R function. I've also written these to work nicely with `purrr`, rerunning the function across a list of customers via `map_df`. That could be a good follow-up post if there's interest.

Up until now, `Con` and `Query` have been unused. The last part of the function does the actual work:

```r
odbc::dbBind(Query, list(Site, StartTime, EndTime))
dat <- odbc::dbFetch(Query)
odbc::dbClearResult(Query)
return(dat)
```

In `dbBind`, the order of the function arguments needs to match the order of the question marks in the query — if they're out of sync, R will pass the arguments as the wrong SQL parameters. `dbFetch` actually pulls the data from the database, and `dbClearResult` is good practice — it frees up the resources associated with the query.

That's it. Once you have the template down, the real effort is in writing the SQL itself. I like this pattern a lot because I think there will come a point where my catalog of clean, reusable datasets makes it easier to show people how to access data in R than in any other language — so the end result (a package of import functions) can meaningfully increase how easily people in an organization can get at data.

## A note on SQL and alternative approaches

I'm not a SQL-first person, even though a lot of what I've described here relies on knowing some SQL. There are other ways to interact with SQL from R, like the `dbplyr` package. I prefer editing the underlying query in straight SQL because the other developers here know SQL well and can help me debug a query — if I hit weird results with `dbplyr`, I'd be more on my own.

There are also other R packages for SQL drivers. My original versions of this function were based on `RODBC` (one recurring analysis still uses it, since I haven't had time to convert it). I picked `odbc` specifically because [the documentation](https://db.rstudio.com/) is extremely good and it supports parameterized queries well.

If you want to know more about the underlying concepts of interfacing with a SQL database from R specifically, [this is a nice overview](https://cran.r-project.org/web/packages/RODBC/vignettes/RODBC.pdf).
