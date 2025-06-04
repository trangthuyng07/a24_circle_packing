function _1(md){return(
md`<div style="color: grey; font: 13px/25.5px var(--sans-serif); text-transform: uppercase;"><h1 style="display: none;">Zoomable circle packing</h1><a href="https://d3js.org/">D3</a> › <a href="/@d3/gallery">Gallery</a></div>

# Zoomable circle packing

Click to zoom in or out.`
)}

function _chart(d3,data)
{
  const width = 3000;
  const height = 3000;

  const pack = data => d3.pack()
    .size([width, height])
    .padding(3)
    (d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value));

  const root = pack(data);

  const svg = d3.create("svg")
    .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .style("max-width", "100%")
    .style("height", "auto")
    .style("display", "block")
    .style("margin", "0 -14px")
    .style("background", "transparent")
    .style("cursor", "pointer");

  let focus = root;
  let view;

  const node = svg.append("g")
    .selectAll("circle")
    .data(root.descendants().slice(1))
    .join("circle")
    .attr("fill", d => d.children ? "white" : "black")
    .attr("stroke", d => d.children ? "black" : "none")
    .attr("stroke-width", d => d.children ? 4 : 0)
    .attr("pointer-events", d => !d.children ? "none" : null)
    .attr("transform", d => `translate(${d.x - width / 2},${d.y - height / 2})`)
    .attr("r", d => d.r)
    .attr("opacity", 1)
    .on("mouseover", function () {
      d3.select(this).attr("stroke", "#000");
    })
    .on("mouseout", function (event, d) {
      d3.select(this).attr("stroke", d.children ? "#000" : "none");
    })
    .on("click", (event, d) => {
      if (focus !== d) {
        zoom(event, d);
        event.stopPropagation();
      }
    });

  node.append("title")
    .text(d => {
      if (d.children) {
        const total = d3.sum(d.children, c => c.value);
        return `${d.data.name}\nTotal Revenue: $${total.toLocaleString()}`;
      } else {
        return `${d.data.name}\nRevenue: $${d.value.toLocaleString()}`;
      }
    });

  const label = svg.append("g")
    .style("font", "bold 40px 'Inter', 'Helvetica Neue', sans-serif")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(root.descendants())
    .join("text")
    .style("fill", "#CDF564")
    .style("fill-opacity", d => d.parent === root ? 1 : 0)
    .style("display", d => d.parent === root ? "inline" : "none")
    .attr("transform", d => `translate(${d.x - width / 2},${d.y - height / 2})`)
    .text(d => {
      if (d.children) {
        const total = d3.sum(d.children, c => c.value);
        return `${d.data.name}\n$${total.toLocaleString()}`;
      } else {
        return `${d.data.name}\n$${d.value.toLocaleString()}`;
      }
    });

  svg.on("click", (event) => zoom(event, root));
  zoomTo([focus.x, focus.y, focus.r * 2]);

  function zoomTo(v) {
    const k = width / v[2];
    view = v;
    label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`)
      .attr("r", d => d.r * k);
  }

  function zoom(event, d) {
    focus = d;
    const transition = svg.transition()
      .duration(event.altKey ? 7500 : 1000)
      .ease(d3.easeSinInOut)
      .tween("zoom", () => {
        const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
        return t => zoomTo(i(t));
      });

    label
      .filter(function (l) {
        return l.parent === focus || this.style.display === "inline";
      })
      .transition(transition)
      .style("fill-opacity", l => l.parent === focus ? 1 : 0)
      .on("start", function (l) {
        if (l.parent === focus) this.style.display = "inline";
      })
      .on("end", function (l) {
        if (l.parent !== focus) this.style.display = "none";
      });
  }


  return svg.node();
}


function _data(FileAttachment){return(
FileAttachment("a24_flare2_main_genre.json").json()
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["a24_flare2_main_genre.json", {url: new URL("./files/53fa438d2f96d1ba28a3f9146fd79241aad20a4952f876343e286276d9c362674e74efa05bdf0b9f9fdfa670dcbf2863b19ed24aa03eb2e77119ff37df8e5f40.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("chart")).define("chart", ["d3","data"], _chart);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  return main;
}
