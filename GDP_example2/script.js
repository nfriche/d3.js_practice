document.addEventListener('DOMContentLoaded', function() {
    const width = 1000, height = 729;
    const titleHeight = 100; // Increased space for the title to avoid overlap

    const svg = d3.select('#chart').append('svg')
        .attr('width', width)
        .attr('height', height);

    // Adding title
    svg.append("text")
        .attr("x", width / 2)             
        .attr("y", titleHeight / 2) // Adjusted to be lower to give more space
        .attr("text-anchor", "middle")  
        .style("font-size", "36px")  
        .text("GDP 2020 Visualization");

    d3.csv("https://raw.githubusercontent.com/nfriche/d3.js_practice/main/GDP_example/data.csv").then(function(data) {
        const filteredData = data.map(d => ({
            country: d["Country Name"],
            gdp: +d["2020"] // Convert GDP to number
        })).filter(d => d.gdp);

        const gdpExtent = d3.extent(filteredData, d => d.gdp);
        const radiusScale = d3.scaleSqrt().domain(gdpExtent).range([1, 100]);

        const simulation = d3.forceSimulation(filteredData)
            .force('charge', d3.forceManyBody().strength(-15)) 
            .force('center', d3.forceCenter(width / 2, height / 2 + titleHeight / 2))
            .force('collision', d3.forceCollide().radius(d => radiusScale(d.gdp) + 1))
            .force('x', d3.forceX(width / 2).strength(0.05))
            .force('y', d3.forceY(height / 2 + titleHeight / 2).strength(0.05))
            .on('tick', ticked);

        const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

        const nodes = svg.selectAll('.bubble')
            .data(filteredData)
            .enter().append('circle')
            .attr('class', 'bubble')
            .attr('r', d => radiusScale(d.gdp))
            .attr('fill', (d, i) => colorScale(i))
            .on('mouseover', function(event, d) {
                var formattedGDP = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(d.gdp);
                d3.select('#tooltip')
                    .style('opacity', 1)
                    .html(`${d.country}<br>GDP: ${formattedGDP}`)
                    .style('left', (event.pageX) + 'px')
                    .style('top', (event.pageY) + 'px');
            })
            .on('mouseout', function() {
                d3.select('#tooltip').style('opacity', 0);
            });

        function ticked() {
            nodes
                .attr('cx', d => Math.max(radiusScale(d.gdp), Math.min(width - radiusScale(d.gdp), d.x)))
                .attr('cy', d => Math.max(titleHeight + radiusScale(d.gdp), Math.min(height - radiusScale(d.gdp), d.y)));
        }

        svg.on('mousemove', function(event) {
            const [x, y] = d3.pointer(event);
            simulation.force('x', d3.forceX().x(x).strength(node => 0.06 * (isNodeRepelledByMouse(node, x, y) ? -1 : 1)));
            simulation.force('y', d3.forceY().y(y).strength(node => 0.06 * (isNodeRepelledByMouse(node, x, y) ? -1 : 1)));
            simulation.alpha(0.2).restart();
        });

        // Helper function to determine if a node should be repelled by the mouse
        function isNodeRepelledByMouse(node, mouseX, mouseY) {
            const distance = Math.sqrt(Math.pow(node.x - mouseX, 2) + Math.pow(node.y - mouseY, 2));
            const repelRadius = 50; // Adjust as needed
            return distance < repelRadius;
        }
    });
});
