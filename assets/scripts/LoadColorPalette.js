const primary_color = "#0cb50c";

$(":root").css({
    "--color-primary": primary_color,
    "--color-shader-10": interpolateColor(primary_color, "#000000", 0.1),
    "--color-shader-20": interpolateColor(primary_color, "#000000", 0.2),
    "--color-shader-30": interpolateColor(primary_color, "#000000", 0.4),
    "--color-shader-40": interpolateColor(primary_color, "#000000", 0.6),
    "--color-shader-80": interpolateColor(primary_color, "#000000", 0.8),
    "--color-tones-10": interpolateColor(primary_color, "#808080", 0.1),
    "--color-tones-20": interpolateColor(primary_color, "#808080", 0.2),
    "--color-tones-40": interpolateColor(primary_color, "#808080", 0.4),
    "--color-tones-60": interpolateColor(primary_color, "#808080", 0.6),
    "--color-tones-80": interpolateColor(primary_color, "#808080", 0.7),
    "--color-tints-10": interpolateColor(primary_color, "#ffffff", 0.1),
    "--color-tints-20": interpolateColor(primary_color, "#ffffff", 0.2),
    "--color-tints-40": interpolateColor(primary_color, "#ffffff", 0.4),
    "--color-tints-60": interpolateColor(primary_color, "#ffffff", 0.6),
    "--color-tints-80": interpolateColor(primary_color, "#ffffff", 0.8),
});

function interpolateColor(from_color, to_color, factor = 0.5) {
    from_color = from_color.slice();
    to_color = to_color.slice();

    if (isHexColor(from_color)) {
        from_color = hexToRgb(from_color);
    } else {
        from_color = from_color.match(/\d+/g).map(Number);
    }

    if (isHexColor(to_color)) {
        to_color = hexToRgb(to_color);
    } else {
        to_color = to_color.match(/\d+/g).map(Number);
    }

    const result = from_color;

    for (var i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (to_color[i] - from_color[i]));
    }

    return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
}

function isHexColor(text) {
    return /[0-9A-Fa-f]{6}/g.test(text);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}