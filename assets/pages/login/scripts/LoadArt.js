const file_name = `./images/art/${Math.floor(Math.random() * 8) + 1}.svg`;

const $art = $("#art");

fetch(file_name).then(res => res.text()).then(svg => {
    $art.html(svg);
});