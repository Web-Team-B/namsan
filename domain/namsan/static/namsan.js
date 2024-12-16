// #main-road라는 ID를 가진 SVG 엘리먼트를 선택
const svg = d3.select("#main-road");

// 우회로 (검은 곡선, 아래쪽)
svg.append("path")
    .attr("class", "road detour-road")
    .attr(
        "d",
        `M 80,90
         A 210,80 0 0,0 535,90`
    )
    .attr("stroke", "black")
    .attr("stroke-width", 10)
    .attr("fill", "none");

// 메인 도로 (검은 직선)
const mainRoad = svg.append("line")
    .attr("id", "main-road-line")
    .attr("class", "road main-road")
    .attr("x1", 75)
    .attr("y1", 90)
    .attr("x2", 540)
    .attr("y2", 90)
    .attr("stroke", "black")
    .attr("stroke-width", 10)
    .style("cursor", "pointer")
    .on("click", function () {
        const currentColor = d3.select(this).attr("stroke");
        d3.select(this)
            .attr("stroke", currentColor === "black" ? "red" : "black");

        if (currentColor === "black") {
            addRedGraphs();
            analyzeTrafficAndSpeed(
                "/api/namsan/api/traffic_data1", // 통행료 부과 전 메인도로 교통량 데이터
                "/api/namsan/api/traffic_data3", // 통행료 부과 전 우회도로 교통량 데이터
                "/api/namsan/api/traffic_data5", // 통행료 부과 후 메인도로 교통량 데이터
                "/api/namsan/api/traffic_data7", // 통행료 부과 후 우회도로 교통량 데이터
                "/api/namsan/api/traffic_data2", // 통행료 부과 전 메인도로 속도 데이터
                "/api/namsan/api/traffic_data4", // 통행료 부과 전 우회도로 속도 데이터
                "/api/namsan/api/traffic_data6", // 통행료 부과 후 메인도로 속도 데이터
                "/api/namsan/api/traffic_data8"  // 통행료 부과 후 우회도로 속도 데이터
            );
        } else {
            removeRedGraphs();
            d3.select("#result").html(""); // 분석 결과 초기화
        }
    });

// 메인 도로 텍스트
svg.append("text")
    .attr("x", 307)
    .attr("y", 60)
    .attr("text-anchor", "middle")
    .style("font-size", "25px")
    .style("font-family", "Arial, sans-serif")
    .style("fill", "black")
    .text("메인도로");

// 우회 도로 텍스트
svg.append("text")
    .attr("x", 307)
    .attr("y", 220)
    .attr("text-anchor", "middle")
    .style("font-family", "Arial, sans-serif")
    .style("font-size", "25px")
    .style("fill", "black")
    .text("우회도로");

// 빨간색 그래프를 추가하는 함수
function addRedGraphs() {
    const additionalFiles = [
        { url: "/api/namsan/api/traffic_data5", title: "1번 추가 데이터" },
        { url: "/api/namsan/api/traffic_data6", title: "2번 추가 데이터" },
        { url: "/api/namsan/api/traffic_data7", title: "3번 추가 데이터" },
        { url: "/api/namsan/api/traffic_data8", title: "4번 추가 데이터" }
    ];

    additionalFiles.forEach((file, index) => {
        fetch(file.url)
            .then(response => response.json())
            .then(redData => {
                const svg = d3.select(`#chart${index + 1} svg g`);
                const x = d3.select(`#chart${index + 1}`).datum().xScale;
                const y = d3.select(`#chart${index + 1}`).datum().yScale;

                const line = d3.line()
                    .x(d => x(d.time))
                    .y(d => y(d.value));

                svg.append("path")
                    .datum(redData)
                    .attr("fill", "none")
                    .attr("stroke", "red")
                    .attr("stroke-width", 2)
                    .attr("d", line);

                svg.selectAll(".red-point")
                    .data(redData)
                    .enter()
                    .append("circle")
                    .attr("class", "red-point")
                    .attr("cx", d => x(d.time))
                    .attr("cy", d => y(d.value))
                    .attr("r", 3)
                    .attr("fill", "red");
            });
    });
}

// 빨간색 그래프를 제거하는 함수
function removeRedGraphs() {
    d3.selectAll(".red-point").remove();
    d3.selectAll("path[stroke='red']").remove();
}

// 통행량 및 속도 분석 함수
function analyzeTrafficAndSpeed(
    mainTrafficBeforeUrl,
    bypassTrafficBeforeUrl,
    mainTrafficAfterUrl,
    bypassTrafficAfterUrl,
    mainSpeedBeforeUrl,
    bypassSpeedBeforeUrl,
    mainSpeedAfterUrl,
    bypassSpeedAfterUrl
) {
    Promise.all([
        fetch(mainTrafficBeforeUrl).then(res => res.json()),
        fetch(bypassTrafficBeforeUrl).then(res => res.json()),
        fetch(mainTrafficAfterUrl).then(res => res.json()),
        fetch(bypassTrafficAfterUrl).then(res => res.json()),
        fetch(mainSpeedBeforeUrl).then(res => res.json()),
        fetch(bypassSpeedBeforeUrl).then(res => res.json()),
        fetch(mainSpeedAfterUrl).then(res => res.json()),
        fetch(bypassSpeedAfterUrl).then(res => res.json())
    ]).then(([
        mainTrafficBefore, bypassTrafficBefore,
        mainTrafficAfter, bypassTrafficAfter,
        mainSpeedBefore, bypassSpeedBefore,
        mainSpeedAfter, bypassSpeedAfter
    ]) => {
        const mainTrafficBeforeAvg = calculateAverage(mainTrafficBefore);
        const bypassTrafficBeforeAvg = calculateAverage(bypassTrafficBefore);
        const mainTrafficAfterAvg = calculateAverage(mainTrafficAfter);
        const bypassTrafficAfterAvg = calculateAverage(bypassTrafficAfter);

        const mainSpeedBeforeAvg = calculateAverage(mainSpeedBefore);
        const bypassSpeedBeforeAvg = calculateAverage(bypassSpeedBefore);
        const mainSpeedAfterAvg = calculateAverage(mainSpeedAfter);
        const bypassSpeedAfterAvg = calculateAverage(bypassSpeedAfter);

        const mainTrafficChange = calculatePercentageChange(mainTrafficBeforeAvg, mainTrafficAfterAvg);
        const bypassTrafficChange = calculatePercentageChange(bypassTrafficBeforeAvg, bypassTrafficAfterAvg);
        const mainSpeedChange = calculatePercentageChange(mainSpeedBeforeAvg, mainSpeedAfterAvg);
        const bypassSpeedChange = calculatePercentageChange(bypassSpeedBeforeAvg, bypassSpeedAfterAvg);

        d3.select("#result")
            .html(`
                <h3 style="font-size: 40px;">요금 부과 전후 분석</h3>
                <p><strong style="font-size: 30px;">메인도로:</strong></p>
                <ul>
                    <li style="font-size: 24px;">하루 평균 교통량 변화: ${mainTrafficBeforeAvg.toFixed(2)} → ${mainTrafficAfterAvg.toFixed(2)} (${mainTrafficChange.toFixed(2)}%)</li>
                    <li style="font-size: 24px;">하루 평균 속도 변화: ${mainSpeedBeforeAvg.toFixed(2)} → ${mainSpeedAfterAvg.toFixed(2)} (${mainSpeedChange.toFixed(2)}%)</li>
                </ul>
                <br>
                <p><strong style="font-size: 30px;">우회도로:</strong></p>
                <ul>
                    <li style="font-size: 24px;">하루 평균 교통량 변화: ${bypassTrafficBeforeAvg.toFixed(2)} → ${bypassTrafficAfterAvg.toFixed(2)} (${bypassTrafficChange.toFixed(2)}%)</li>
                    <li style="font-size: 24px;">하루 평균 속도 변화: ${bypassSpeedBeforeAvg.toFixed(2)} → ${bypassSpeedAfterAvg.toFixed(2)} (${bypassSpeedChange.toFixed(2)}%)</li>
                </ul>
            `);
    });
}

// 평균 계산 함수
function calculateAverage(data) {
    return data.reduce((sum, d) => sum + d.value, 0) / data.length;
}

// 퍼센티지 변화 계산 함수
function calculatePercentageChange(beforeAvg, afterAvg) {
    return ((afterAvg - beforeAvg) / beforeAvg) * 100;
}

// 그래프 렌더링 함수
function renderChart(containerId, dataUrl, title) {
    fetch(dataUrl)
        .then(response => response.json())
        .then(data => {
            const container = d3.select(containerId);

            container.append("h3")
                .text(title)
                .style("text-align", "center")
                .style("margin-bottom", "10px")
                .style("font-family", "Arial, sans-serif")
                .style("font-size", "20px");

            const margin = { top: 20, right: 30, bottom: 50, left: 50 };
            const width = 400 - margin.left - margin.right;
            const height = 300 - margin.top - margin.bottom;

            const svg = container.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const x = d3.scalePoint()
                .domain(data.map(d => d.time))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.value)])
                .nice()
                .range([height, 0]);

            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end");

            svg.append("g").call(d3.axisLeft(y));

            const line = d3.line()
                .x(d => x(d.time))
                .y(d => y(d.value));

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2)
                .attr("d", line);

            svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", d => x(d.time))
                .attr("cy", d => y(d.value))
                .attr("r", 3)
                .attr("fill", "steelblue");

            container.datum({ xScale: x, yScale: y });
        });
}

// 각 그래프에 사용할 데이터와 제목 정의
const csvFiles = [
    { url: "/api/namsan/api/traffic_data1", title: "메인도로 교통량 데이터" },
    { url: "/api/namsan/api/traffic_data2", title: "메인도로 속도 데이터" },
    { url: "/api/namsan/api/traffic_data3", title: "우회도로 교통량 데이터" },
    { url: "/api/namsan/api/traffic_data4", title: "우회도로 속도 데이터" }
];

// 각 그래프를 렌더링
csvFiles.forEach((file, index) => {
    renderChart(`#chart${index + 1}`, file.url, file.title);
});
