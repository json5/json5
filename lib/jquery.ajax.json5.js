jQuery.ajaxSetup({
    converters: {
        "text json5": JSON5.parse
    }
});
