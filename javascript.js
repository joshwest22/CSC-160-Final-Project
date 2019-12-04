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
var popPromise = d3.csv("data/AlabamaPopulationData.csv"); //reduced the amount of data by A LOT
Promise.all([mapPromise,popPromise,csShortTermPromise,csLongTermPromise]).then(function(values)
{
    var join = function()
    {
        var hash = {} //this is used for joining
        //console.log("values", values)

        values[0].features.forEach(function(element)
        {
            hash[element.properties.NAME] = element;
            //console.log(element)
        })
        //should bind the population data to the mapData, does it?
        values[1].forEach(function(e2)
        {
            hash[e2.NAME].populationData = e2;
            //console.log("NAME",e2.NAME)
            //console.log("hash",hash)
        })
        //should join short term data to map and population
        values[2].forEach(function(e3) //this function isn't doing anything for some reason
        {
            hash[e3.AreaName].shortTermData = e3;
            //console.log("hash",hash)
        })
        //should join long term data to map and population and short term data
        values[3].forEach(function(e4)
        {
            //hash[e4.AreaName].longTermData = e4;//FIX ME this is throwing a weird error why??
            //console.log("AreaName2", e4.AreaName)
            //console.log("hash",hash)
        })
    }
    join(); 
    getData(values[1]);
},
function(err){console.log("ERROR in Promise.all",err)})

mapPromise.then(function(mapData)
{
    console.log("map data working",mapData);
    setup(mapData); //don't load the map until the data is linked
   
},
function(err)
{
    console.log("MAP DATA NOT LOADING PROPERLY", err);
})

var screen = {width:1920, height:1080};
var setup = function(mapData) // setup deals with svg size, projection 
{
    var width = 1900;
    var height = 800;
    //Define projection
    var projection = d3.geoAlbersUsa().translate([width/2,height/2]).scale([1000]);
    //console.log("projection",projection)
    
    //make svg
    var svg = d3.select("svg")
    .attr("width",screen.width)
    .attr("height",screen.height)
    //Bind data and create one path per GeoJSON feature
    
    //Define path generator, using the albers USA projection
    var path = d3.geoPath(projection);
    
    svg.selectAll("path")
    .data(mapData.features)
    .enter()
    .append("path")
    .attr("d",path)
    
    var colorShortTerm = d3.scaleQuantize()
    .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"])
    .domain([
        d3.min(mapData,function(d){return d.value}),
        d3.max(mapData, function(d){return d.value})])
    svg.selectAll("path")
    .data(mapData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", function (d)
        {
        //Get data value    
        var value = d.properties.value;
        
            if (value)
                {return color(value)}
            else {return "#ccc"}
        })
    //what should I be selecting to get data for hover on each state
    svg.select("path")
    .data(mapData)
    .on("mouseover", function(d)
        {
        var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.bandwidth() / 2;
        var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + height / 2;

        //update the tooltip
        d3.select("#tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .select("#value")
        .text(d)
        //show the tool tip
        d3.select("#tooltip").classed("hidden", false);
        })
    //long term color range
    var colorLongTerm = d3.scaleQuantize()
    .range(["#eff3ff","#bdd7e7","#6baed6","#3182bd","#08519c"])
}   

//draw pathgenerator and d3 core algorithm
var drawMap = function() // this may be needed for added animations to the graph
{
    //d3 core algorithm; selectall the paths and rebind the data then animate
    //short term color range
    
}

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
//MAKE A JOIN FUNCTION


var getData = function(popData)
{
    //do i still need the states array or this getData function
    states = [{name: "Alabama", total: [], male: [], female: [], both: [], white: [], black: [], asian: [], multiracial: []}] //each array within each state object will need to be summed; I will also have to copy paste the Alabama object for each state
    popData.forEach(function(d)
    {
        if(d.AGE == 40) //this is the average age of CS professionals according to https://datausa.io/profile/cip/computer-science-6
            {
                totalAccumulator = 0;
                if(typeof d != "undefined") //this isn't working. Is there a better way to check for undefined
                    {
                    if(d.RACE < 7)
                        {totalAccumulator += d.POPESTIMATE2017; console.log("states",states);console.log("totalAccumulator", totalAccumulator);}
                    if(d.SEX == 0)//both sexes
                        {states[d.STATE-1].both.push(d.POPESTIMATE2017)} //console log what each of these are
                    if(d.SEX == 1)//male
                        {states[d.STATE-1].male.push(d.POPESTIMATE2017)}
                    if(d.SEX == 2)//female
                        {states[d.STATE-1].female.push(d.POPESTIMATE2017)}
                    if(d.RACE == 1)//white
                        {states[d.STATE-1].white.push(d.POPESTIMATE2017)}
                    if(d.RACE == 2)//black
                        {states[d.STATE-1].black.push(d.POPESTIMATE2017)}
                    if(d.RACE == 4)//asian
                        {states[d.state-1].asian.push(d.POPESTIMATE2017)} //this isn't working likely because not all data points represent asians
                    if(d.RACE == 6) //two or more races;
                        {states[d.STATE-1].multiracial.push(d.POPESTIMATE2017)} //nothing is being pushed. Maybe bc problem with asian if statement
                    }
            }
    }) ;
    console.log(states);
}