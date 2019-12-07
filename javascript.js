//Load in geoJSON data
var mapPromise = d3.json("data/us-states_5m.json");
//Load in national employment data based on occupation
//var csEmploymentPromise = ;
//Load in state employment rates 2018-2020
var csShortTermPromise = d3.csv("data/CS Job Short Term Projections Data.csv");
//Load in state employment rates 2016-2026
var csLongTermPromise = d3.csv("data/CS Job Long Term Projections Data.csv");
//Load in national women's employment data
//var womenPromise = ;
//Load in national minorites' employment data
//var minoritiesPromise = ;
var popPromise = d3.csv("data/converted.csv"); //reduced the amount of data by A LOT

Promise.all([mapPromise,popPromise,csShortTermPromise,csLongTermPromise]).then(function(values)
{
    var join = function()
    {
        var hash = {} //this is used for joining
        console.log("values", values)
        //set up map data
        values[0].features.forEach(function(element)
        {
            hash[element.properties.NAME] = element;
            //console.log(element)
        })
        //bind the population data to the mapData
        values[1].forEach(function(e2)
        {
            hash[e2.NAME].populationData = e2;
            //console.log("NAME",e2.NAME)
            //console.log("hash",hash)
        })
        //join short term data to map and population
        values[2].forEach(function(e3) //this function isn't doing anything for some reason
        {
            if(hash[e3.AreaName])
                {
                hash[e3.AreaName].shortTermData = e3;
                //console.log("hash",hash)   
                }
            else
            {
                console.log("shortTermData mismatched", e3.AreaName)
            }
            
        })
        //join long term data to map and population and short term data
        values[3].forEach(function(e4)
        {
            if(hash[e4.AreaName])
                {
                hash[e4.AreaName].longTermData = e4;//FIX ME throwing error, but working?
                //console.log("AreaName2", e4.AreaName)
                //console.log("hash",hash)
                }
            else
                {//console.log("longTermData mismatched", e4.AreaName)
                }
        })
    } 
    //getData(values[1]); //work on this for the portfolio project but not for the class
    join();
    setup(values[0], values[2],values[3]); 
},
function(err){console.log("ERROR in Promise.all",err)})

/*mapPromise.then(function(mapData)
{
    console.log("map data working",mapData); 
    //setup(mapData); //don't load the map until the data is linked
},
function(err)
{
    console.log("MAP DATA NOT LOADING PROPERLY", err);
})

popPromise.then(function(popData)
{
    console.log("state population data working",popData);
    //getData(popData);
},
function(err){console.log("ERROR in popPromise",err)})

csShortTermPromise.then(function(shortTermData)
{
    console.log("short term data working",shortTermData);
},
function(err){console.log("ERROR in csShortTermPromise",err)})

csLongTermPromise.then(function(longTermData)
{
    console.log("long term data working",longTermData);
},
function(err){console.log("ERROR in csLongTermPromise",err)})
*/
var screen = {width:1920, height:600};
var setup = function(mapData,shortTermData,longTermData) // setup deals with svg size, projection 
{
    var width = 1920;
    var height = 600;
    //Define projection
    var projection = d3.geoAlbersUsa().translate([width/2,height/2]).scale([1300]);
    //console.log("projection",projection)
    
    //make svg
    var svg = d3.select("svg")
    .attr("width",screen.width)
    .attr("height",screen.height)
    //Bind data and create one path per GeoJSON feature
    
    //Defines path generator, using the albers USA projection
    var path = d3.geoPath(projection);
    
    svg.selectAll("path")
    .data(mapData.features)
    .enter()
    .append("path")
    .attr("d",path)
    
    //sets up short term choropleth colors
    //console.log("short term",mapData.features)
    
    var colorShortTerm = d3.scaleQuantize()
    .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"])
    .domain([d3.min(mapData.features, function(d)
            {
        
            if(d.shortTermData)
            {
                //console.log("d",d);
                return d.shortTermData.PercentChange
            }
            else
               {return 0}
            }),
            d3.max(mapData.features, function(d)
            {
            if(d.shortTermData)
            {
                return d.shortTermData.PercentChange
            }
            else
               {return 0}
            })])
    //console.log(colorShortTerm(mapData.features[1].shortTermData.PercentChange))
//    //long term color range
//    var colorLongTerm = d3.scaleQuantize()
//    .range(["#eff3ff","#bdd7e7","#6baed6","#3182bd","#08519c"])
//    .domain([d3.min(mapData.features, function(d)
//            {
//            if(d != 0){
//                    return d.longTermData.PercentChange
//                }
//            else
//               {return 0}
//            }),
//            d3.max(mapData.features, function(d)
//            {
//            if(d != 0){
//                    return d.longTermData.PercentChange
//                }
//            else
//               {return 0}
//            })
                
                    
                
    //draw choropleth for each state
    svg.selectAll("path")
    .data(mapData.features)
    
    
    .attr("d", path)
    .style("fill", function (d)
        {
            //Get data value    
            var value = d.shortTermData
            console.log("value", value)
            if (value)
                {return colorShortTerm(value.PercentChange)}
            else {return "grey"}
        })
    .style("stroke", "black")
    //hovers for divs
    .selectAll(".national").on("mouseover", function()
    {
        d3.select(".national ul").classed("hidden", false)
    })
    d3.selectAll(".national").on("mouseout", function()
    {
        d3.selectAll(".national ul").classed("hidden", true)
    })
    
    //make legend
    var legend = d3.select("#legend")
        .append("ul").attr("class", "list-inline")
    var key = legend.selectAll("li.key")
    .data(colorShortTerm.range())
    .enter()
    .append("li")
    .attr("class","key")
    .style("border-top-color", String)
    .text(function(message)
        {
            var r = colorShortTerm.invertExtent(message);
            return formats.percent(r[0])
        })
    //what should I be selecting to get data for hover on each state?
    svg.select("path")
    .data(mapData.features)
    .on("mouseover", function(d)
        {
        var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.bandwidth() / 2;
        var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + height / 2;

        //update the tooltip
        d3.select("#tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .select("#value")
        .text(d.AreaName + ": " + d.shortTermData.PercentChange)
        //show the tool tip
        d3.select("#tooltip").classed("hidden", false);
        })
    
    
}   

//draw pathgenerator and d3 core algorithm
var drawMap = function() // this may be needed for added animations to the graph
{
    //d3 core algorithm; selectall the paths and rebind the data then animate
    //short term color range
    
}
/*********************************************************************************************************************************/

var getData = function(popData)
{
    //each array within each state object will need to be summed; I will also have to copy paste the Alabama object for each state
    states = [{name: "Alabama", total: [], male: [], female: [], both: [], white: [], black: [], asian: [], multiracial: []}] 
    popData.forEach(function(d)
    {            
                totalAccumulator = 0;
    
                if(d.RACE < 7)
                    {totalAccumulator += d.POPESTIMATE2017;
                     console.log("totalAccumulator", totalAccumulator);
                     states[d.STATE-1].total.push(totalAccumulator);
                    }
                if(d.SEX == 0)//both sexes
                    {states[d.STATE-1].both.push(d.POPESTIMATE2017)} 
                if(d.SEX == 1)//male
                    {states[d.STATE-1].male.push(d.POPESTIMATE2017)}
                if(d.SEX == 2)//female
                    {states[d.STATE-1].female.push(d.POPESTIMATE2017)}
                if(d.RACE == 1)//white
                    {states[d.STATE-1].white.push(d.POPESTIMATE2017)}
                if(d.RACE == 2)//black
                    {states[d.STATE-1].black.push(d.POPESTIMATE2017)}
                if(d.RACE == 4)//asian
                    {states[d.STATE-1].asian.push(d.POPESTIMATE2017)} 
                if(d.RACE == 6) //two or more races;
                    {states[d.STATE-1].multiracial.push(d.POPESTIMATE2017)} 
            
    })
    console.log(states);
}