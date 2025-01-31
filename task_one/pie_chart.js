d3.csv('data/time_series_covid19_confirmed_global.csv').then(confirmedData => {
    d3.csv('data/time_series_covid19_deaths_global.csv').then(deathsData => {
        const countries = {};

        confirmedData.forEach(row => {
            const country = row['Country/Region'];
            if (!countries[country]) countries[country] = { confirmed: 0, deaths: 0 };

            const latestDate = Object.keys(row).slice(-1)[0];
            countries[country].confirmed = +row[latestDate];
        });

        deathsData.forEach(row => {
            const country = row['Country/Region'];
            if (countries[country]) {
                const latestDate = Object.keys(row).slice(-1)[0];
                countries[country].deaths = +row[latestDate];
            }
        });

        const data = Object.keys(countries).map(country => ({
            country,
            confirmed: countries[country].confirmed,
            deaths: countries[country].deaths
        }));

        const select = d3.select("#countrySelect")
            .on("change", function () {
                update(this.value);
            });

        select.selectAll("option")
            .data(data.map(d => d.country))
            .enter()
            .append("option")
            .text(d => d);

        update("US");

        function update(selectedCountry) {
            const countryData = data.find(d => d.country === selectedCountry);
            if (!countryData) return;

            d3.select("#pie-chart").selectAll("*").remove();

            const width = 300, height = 300, radius = Math.min(width, height) / 2;
            const svg = d3.select("#pie-chart")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", `translate(${width / 2}, ${height / 2})`);

            const pieData = [
                { label: "Confirmed", value: countryData.confirmed },
                { label: "Deaths", value: countryData.deaths }
            ];

            const pie = d3.pie().value(d => d.value);
            const arc = d3.arc().innerRadius(50).outerRadius(radius);

            const color = d3.scaleOrdinal(["#1f77b4", "#ff7f0e"]);

            svg.selectAll("path")
                .data(pie(pieData))
                .enter()
                .append("path")
                .attr("d", arc)
                .attr("fill", d => color(d.data.label));

            svg.selectAll("text")
                .data(pie(pieData))
                .enter()
                .append("text")
                .attr("transform", d => `translate(${arc.centroid(d)})`)
                .attr("text-anchor", "middle")
                .text(d => d.data.label)
                .style("fill", "white")
                .style("font-size", "14px");
        }
    });
});
