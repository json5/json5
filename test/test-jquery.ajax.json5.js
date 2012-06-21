function test() {
    $.each(['misc/readme-example.json5', 'numbers/noctal-literal.js'], function (i, path) {
        $.ajax({
            url: 'parse-cases/' + path,
            dataType: 'json5',
            success: function (result) {
                console.log({ path: path, result: result });
            },
            error: function (jqXhr, textStatus, thrownError) {
                console.log({ path: path, jqXhr: jqXhr, textStatus: textStatus, thrownError: thrownError });
            }
        });
    });
}
