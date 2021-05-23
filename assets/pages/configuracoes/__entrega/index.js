(() => {
    const map = new DeliveryMap("#delivery-config>.map");
    
    map.drawRangeCircles();
    map.highlightCityArea();
})();