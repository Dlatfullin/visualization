Promise.all([
    d3.csv('data/time_series_covid19_confirmed_global.csv'),
    d3.json('data/countries.geo.json') // Загружаем карту мира
]).then(([confirmedData, worldMap]) => {
    const countries = {};

    confirmedData.forEach(row => {
        let country = row['Country/Region'].trim();
        const latestDate = Object.keys(row).slice(-1)[0];
        countries[country] = +row[latestDate] || 0; // Обрабатываем возможные NaN
    });

    const width = 900, height = 500;
    const svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Улучшенная проекция (более корректно рисует карту)
    const projection = d3.geoNaturalEarth1()
        .scale(160)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Коррекция цветов (чтобы минимальные значения были светлее)
    const colorScale = d3.scaleSequential(d3.interpolateReds)
        .domain([1, d3.max(Object.values(countries))]);

    const g = svg.append("g");

    g.selectAll("path")
        .data(worldMap.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", d => {
            let countryName = d.properties.name.trim();
            const cases = countries[countryName] || 0;
            return cases ? colorScale(cases) : "#e0e0e0"; // Серый цвет, если нет данных
        })
        .attr("stroke", "black")
        .on("mouseover", function (event, d) {
            let countryName = d.properties.name.trim();
            const cases = countries[countryName] || "No Data";
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>${countryName}</strong><br>Cases: ${cases}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => tooltip.transition().duration(200).style("opacity", 0));

    // Добавляем тултип
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "lightgray")
        .style("padding", "5px")
        .style("opacity", 0);

    // Добавляем Zoom с плавной анимацией
    svg.call(d3.zoom()
        .scaleExtent([1, 10])
        .on("zoom", (event) => {
            g.transition().duration(200).attr("transform", event.transform);
        }));
});
