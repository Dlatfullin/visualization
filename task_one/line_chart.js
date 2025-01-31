d3.csv('data/time_series_covid19_confirmed_global.csv').then(confirmedData => {
    d3.csv('data/time_series_covid19_deaths_global.csv').then(deathsData => {
        const parseDate = d3.timeParse("%m/%d/%y");
        const countries = {};

        confirmedData.forEach(row => {
            const country = row['Country/Region'];
            if (!countries[country]) countries[country] = { confirmed: [], deaths: [] };

            Object.keys(row).forEach(key => {
                if (!['Province/State', 'Country/Region', 'Lat', 'Long'].includes(key)) {
                    const date = parseDate(key);
                    const value = +row[key];
                    countries[country].confirmed.push({ date, value });
                }
            });
        });

        deathsData.forEach(row => {
            const country = row['Country/Region'];
            Object.keys(row).forEach(key => {
                if (!['Province/State', 'Country/Region', 'Lat', 'Long'].includes(key)) {
                    const date = parseDate(key);
                    const value = +row[key];
                    countries[country].deaths.push({ date, value });
                }
            });
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

            const mergedData = countryData.confirmed.map((d, i) => ({
                date: d.date,
                confirmed: d.value,
                deaths: countryData.deaths[i] ? countryData.deaths[i].value : 0
            }));

            d3.select("#chart").selectAll("*").remove();

            const margin = { top: 20, right: 100, bottom: 50, left: 80 };
            const width = 800 - margin.left - margin.right;
            const height = 500 - margin.top - margin.bottom;

            const svg = d3.select("#chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            const x = d3.scaleTime()
                .domain(d3.extent(mergedData, d => d.date))
                .range([0, width]);

            const yLeft = d3.scaleLinear()
                .domain([0, d3.max(mergedData, d => d.confirmed)])
                .range([height, 0]);

            const yRight = d3.scaleLinear()
                .domain([0, d3.max(mergedData, d => d.deaths)])
                .range([height, 0]);

            const lineConfirmed = d3.line()
                .x(d => x(d.date))
                .y(d => yLeft(d.confirmed));

            const lineDeaths = d3.line()
                .x(d => x(d.date))
                .y(d => yRight(d.deaths));

            // Анимация линий
            function animateLine(path) {
                path.attr("stroke-dasharray", function () { return this.getTotalLength(); })
                    .attr("stroke-dashoffset", function () { return this.getTotalLength(); })
                    .transition()
                    .duration(2000)
                    .ease(d3.easeLinear)
                    .attr("stroke-dashoffset", 0);
            }

            // Добавляем линии с анимацией
            svg.append("path")
                .datum(mergedData)
                .attr("fill", "none")
                .attr("stroke", "blue")
                .attr("stroke-width", 2)
                .attr("d", lineConfirmed)
                .call(animateLine);

            svg.append("path")
                .datum(mergedData)
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-width", 2)
                .attr("d", lineDeaths)
                .call(animateLine);

            // Ось X
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(5));

            // Ось Y слева (Confirmed Cases)
            svg.append("g")
                .call(d3.axisLeft(yLeft).tickFormat(d3.format(".2s")))
                .attr("stroke", "blue");

            // Ось Y справа (Deaths)
            svg.append("g")
                .attr("transform", `translate(${width},0)`)
                .call(d3.axisRight(yRight).tickFormat(d3.format(".2s")))
                .attr("stroke", "red");

            // Легенда
            const legend = svg.append("g")
                .attr("transform", `translate(${width - 150},${20})`);

            legend.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", "blue");

            legend.append("text")
                .attr("x", 25)
                .attr("y", 12)
                .text("Confirmed Cases")
                .style("font-size", "12px");

            legend.append("rect")
                .attr("x", 0)
                .attr("y", 20)
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", "red");

            legend.append("text")
                .attr("x", 25)
                .attr("y", 32)
                .text("Deaths")
                .style("font-size", "12px");
        }
    });
});
