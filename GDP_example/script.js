console.log("JavaScript is loaded!");

$(document).ready(function() {
    // Load the data
    d3.csv("https://raw.githubusercontent.com/nfriche/d3.js_practice/main/GDP_example/data.csv").then(function(data) {
        console.log("Raw data:", data);

        // Filter and process data
        let filteredData = data.filter(d => d["2020"] && !isNaN(d["2020"]) && d["Country Code"]);
        filteredData.forEach(d => d["2020"] = +d["2020"]); // Convert to number

        // Initialize Select2 on the <select> element
        $('#countrySelect').select2();

        // Populate the select element with country options
        filteredData.forEach(d => {
            $('#countrySelect').append(new Option(d["Country Name"], d["Country Name"]));
        });

        // Event handler for when the selection changes
        $('#countrySelect').on('change', function() {
            var selectedCountries = $(this).val(); // Array of selected values
            if (selectedCountries.length > 10) {
                alert("You can select a maximum of 10 countries.");
                // Uncomment below line to reset the selection if more than 10 are selected
                // $(this).val(null).trigger('change');
                return;
            }
            updateChart(selectedCountries);
        });

        // Function to update the chart
        function updateChart(selectedCountries) {
            // Filter data based on selected countries
            const selectedData = filteredData.filter(d => selectedCountries.includes(d["Country Name"]));

            // Clear existing chart
            d3.select("#chart").html("");

            // Set up SVG and dimensions
            const margin = {top: 20, right: 20, bottom: 200, left: 80},
                  width = 960 - margin.left - margin.right,
                  height = 600 - margin.top - margin.bottom;

            const svg = d3.select("#chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Scales
            const x = d3.scaleBand()
                        .range([0, width])
                        .padding(0.1)
                        .domain(selectedData.map(d => d["Country Name"]));
            const y = d3.scaleLinear()
                        .range([height, 0])
                        .domain([0, d3.max(selectedData, d => d["2020"])]);

            // Create bars
            svg.selectAll(".bar")
               .data(selectedData)
               .enter().append("rect")
               .attr("class", "bar")
               .attr("x", d => x(d["Country Name"]))
               .attr("width", x.bandwidth())
               .attr("y", d => y(d["2020"]))
               .attr("height", d => height - y(d["2020"]))
               .attr("fill", "steelblue");

            // Add the x Axis
            svg.append("g")
               .attr("transform", `translate(0,${height})`)
               .call(d3.axisBottom(x))
               .selectAll("text")
               .style("text-anchor", "end")
               .attr("dx", "-.8em")
               .attr("dy", ".15em")
               .attr("transform", "rotate(-65)");

            // Add the y Axis
            svg.append("g")
               .call(d3.axisLeft(y).tickFormat(d => `${d / 1e12}T`)); // Format y-axis ticks

            // x-axis label
            svg.append("text")
               .attr("transform", `translate(${width / 2},${height + margin.bottom - 20})`)
               .style("text-anchor", "middle")
               .text("Country Name");

            // y-axis label
            svg.append("text")
               .attr("transform", "rotate(-90)")
               .attr("y", 0 - margin.left)
               .attr("x", 0 - (height / 2))
               .attr("dy", "1em")
               .style("text-anchor", "middle")
               .text("GDP in Trillions of Dollars");

            // Tooltip, interactive chart
            svg.selectAll(".bar")
                .on("mouseover", function(event, d) {
                    // Format the number
                    var formattedGDP = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(d["2020"]);
                    // Show tooltip
                    d3.select(this).style("fill", "#0056b3");
                    // Tooltip div with country name and GDP (create a tooltip div in HTML)
                    d3.select("#tooltip")
                        .style("opacity", 1)
                        .html(`<strong>${d["Country Name"]}</strong><br/>GDP: ${formattedGDP}`)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY) + "px");
                })
                .on("mouseout", function() {
                    // Hide tooltip
                    d3.select(this).style("fill", "#007bff");
                    d3.select("#tooltip").style("opacity", 0);
                });

        }
    })
    .catch(function(error) {
        console.error('Error loading the CSV file:', error);
    });
});
