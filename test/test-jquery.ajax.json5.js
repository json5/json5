function test() {
    $.each(['misc/readme-example.json5', 'misc/empty.txt'], function (i, path) {
        $.ajax({
            url: 'parse-cases/' + path,
            dataType: 'json5',
            success: function (result) {
                console && console.log && console.log(path, result);
                consolas && consolas.log && consolas.log(path, result);
            },
            error: function (error) {
                console && console.error && console.error(path, error);
                typeof consolas !== 'undefined' && consolas.log && consolas.log(path, result);
            }
        });
    });
}
