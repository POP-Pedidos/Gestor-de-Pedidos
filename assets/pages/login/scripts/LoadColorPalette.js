const primary_color = "#0cb50c";

$(":root").css({
    "--primary-color": primary_color,
    "--light-primary-color": hexBrightness(primary_color, 75),
    "--primary_color_light10": hexBrightness(primary_color, 10),
    "--primary_color_light20": hexBrightness(primary_color, 20),
    "--primary_color_light50": hexBrightness(primary_color, 50),
    "--primary_color_light70": hexBrightness(primary_color, 70),
    "--primary_color_light80": hexBrightness(primary_color, 80),
    "--primary_color_light90": hexBrightness(primary_color, 90),
});

function hexBrightness(hex, percent) {
    hex = hex.replace(/^\s*#|\s*$/g, '');

    if (hex.length == 3) hex = hex.replace(/(.)/g, '$1$1');

    const r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16);

    return '#' +
        ((0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
        ((0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
        ((0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}