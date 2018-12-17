---
layout: post
title: Interfacing with SQL in R Using The odbc Package 
comments: True
tags:
  - Data
  - Statistics
  - Pipelines
  - Technical
---
One of the things I do at work is develop reusable pipelines to get data into R. In my case, this means either writing SQL or stealing some SQL someone else wrote and adapting it for my purposes. This isn't something I necessarily have to do -- they are more interested in the analysis part of what I can do -- but I have found that if I am able to build robust analysis pipelines, I can work faster and build a catalog of data worth saving for future analysis. In my case, I try to design pipelines that look as such:

1. Get Data from a Source (for me it is usually a SQL database)
2. Import the data into R (or Python)
3. Clean the data, convert data times, form factors, etc
4. Run analysis
5. Publish something either as an Rmarkdown report, or a slack post (using Slackr) to post some graph to a relevant slack channel.

In this post, I am going to talk about how I organize the first step of that process -- writing import functions. In general, this means writing an import function that accepts a date range and a location (the company has two locations) argument. Then they are 'reusable' for different times. I work in a place that produces something, so people are always interested in time bound analysis such as 'what was different between these dates vs those dates,' etc.

Before I get started though, I have a few caveats. First, it takes a little bit of time to write one of these functions so I only generally do them if I think I will reuse them in the future. I also wrote a generic query function that allows me to pass queries in a one off manner which I would also recommend doing. The last thing I would note is that I wrote an internal R package that I use to store these functions. They are all written for a specific task and not all of them make it into the package immediately, but it is very nice to be able to write `data <-InternalRPackage::ImportChemistryData()` and just have the data in R.

So let's just get into it. Here is the code for the function.

```R
ImportData <-function(
  Site = 'DefaultSite',
  StartTime = '2018-01-01',
  EndTime = '2018-12-01'){
  
  Con <- odbc::dbConnect(odbc::odbc(),
  driver =  "{SQL Server}",
  server = ServerName,
  uid = "user",
  pwd = "password"
  
  Query <- odbc::dbSendQuery(
    Con, "
    DECLARE @Site VARCHAR(10)
    DECLARE	@StartTime datetime
    DECLARE @EndTime datetime

    SET @Site = ?
    SET	@StartTime = ?
    SET @EndTime = ?

    SELECT *  
    WHERE Site = @Site
      AND Date >= @StartTime
      AND Date <= @EndTime
    ")

  odbc::dbBind(Query, list(Site, StartTime, EndTime))
  odbc::dbFetch(Query) -> test
  return(test)
  odbc::dbClearResult(Query)
}
```
Let me break it down a title. In the function itself, I usually provide defaults so I can more easily test it as I am writing. They make it easier to do an on the fly demo which happens a lot. I am the only statistical programmer on a team with 'real developers' so they are always interested in seeing things in action.

The line that specifies the `Con` is pretty straight odbc. In my case, I actually use my active directory credentials in the connection string, which means replacing the uid and pwd lines with `trusted_connection = true`. I just replaced it with a generic username and password string so it was evident what was happening. The official documentation has some [best practices on what you could do](https://db.rstudio.com/best-practices/managing-credentials) in lieu of storing a plain text password in some reusable code. The other thing you might consider is abstracting t he connection string out into a reusable template in your internal R package. I actually do that as well so then if a server name changes, I can change it just the once. It also makes it easy to swap out credentials as well.

The next chunk of code is the start of telling R you are going to run a SQL query: 

```R
  Query <- odbc::dbSendQuery(
    Con, "
    DECLARE @Site VARCHAR(10)
    DECLARE	@StartTime datetime
    DECLARE @EndTime datetime

    SET @Site = ?
    SET	@StartTime = ?
    SET @EndTime = ?
```
Any query you send through odbc needs to specify a connection string, which we defined earlier as `Con`. The `dbSendQuery` function allows you to pass variables from R into SQL whereas one of the other main `odbc` functions, `dbGetQuery` does not naturally do that. You can hack your way into making `dbGetQuery` accept arguments but [you should not](https://db.rstudio.com/best-practices/run-queries-safely/). The way that you pass the R arguments so that they become SQL parameters is by declaring the parameters in SQL and setting them to a ?. The question mark is the way you pass R into SQL. For this, you'll need to know the datatype of the SQL column but you can get this pretty easily just be looking at the columns in whatever you use to read SQL. Then you reference the parameters in the SQL code.

Next we pass the meat of the query. The `DECLARE` and `SET` parts are part of the query as well (everything after the opening quote is), but this part is where you specify what you are looking for:

```SQL
SELECT *
FROM dbo.table
WHERE Site = @Site
AND Date >= @StartTime
AND Date <= @EndTime")
```
You will note that here is where we use the SQL parameters. I am telling SQL to get all the columns from dbo.table but only the observations where the Site column equals my `@Site` parameter, the date column is `@StartTime` or later and `@EndTime` or earlier. You can envision a scenario where you keep pasting more arguments here. Just keep adding more `DECLARE` and `SET` parameters at the top with the relevant arguments in the R function. I have also written these functions that work very nicely with `purrr` by rerunning the function while passing a list of relevant customers through the `map_df` function. If there is interest, that could be a logical next post.

Up until now, the `Con` and `Query` objects have been unused. So now we do the actual work of querying the database in the last part of the function:

```R
  odbc::dbBind(Query, list(Site, StartTime, EndTime))
  odbc::dbFetch(Query) -> dat
  return(dat)
  odbc::dbClearResult(Query)
}
```
In `dbBind`, the order with which we put the function arguments need to match the order of the question marks in the actual query. If they are not congruent, it would try to pass the function arguments as the wrong SQL parameters. The `dbFetch` function is what actually pulls the data from the db and the `return` is required as this is a function and we need to explicitly tell it to return the results. `The dbClearResult` part is 'good practice' as it frees up the resources associated with your query.

That's it! Once you have the template down -- which is provided here -- the real effort is in writing the SQL. I also like this method a lot because I think there will come a time where my catalog of nice data sets is such that it would be easier to show people how to access them in R than another language, so the end result (a package of import functions) can radically increase the democratization of data in an organization.

## A note about SQL and Alternative Approaches
I am not a SQL first guy, yet a lot of what I am writing about is based on SQL. You may notice that this strategy relies on having at least a passing familiarity with SQL. There are other ways to interact with SQL though, such as the `dbplyr` package. I prefer to edit the underlying query in straight SQL because the other developers here know a lot of SQL and can help me if I need to debug a query. Were I to encounter weird results with `dbplyr` I would be on my own.

There are also other R packages to interact with SQL drivers too. For instance, my original versions of this function were based on `RODBC` (and one reoccurring analysis I do still uses it because I haven't had time to convert it over). I picked odbc specifically because the documentation is (extremely  good)[https://db.rstudio.com/] and the strength of passing paramaterized queries there.

If you would like to know more about the underlying concepts of interfacing with a SQL database, [this is a nice overview](https://cran.r-project.org/web/packages/RODBC/vignettes/RODBC.pdf) relevant to R specifically.
