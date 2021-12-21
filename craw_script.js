(function () {
    //cnVuIHRoaXMgc2NyaXB0IGluIGh0dHBzOi8vd3d3Lndvcmxkb21ldGVycy5pbmZvL2dlb2dyYXBoeS9ob3ctbWFueS1jb3VudHJpZXMtYXJlLXRoZXJlLWluLXRoZS13b3JsZC9ydW4gdGhpcyBzY3JpcHQgaW4gaHR0cHM6Ly93d3cud29ybGRvbWV0ZXJzLmluZm8vZ2VvZ3JhcGh5L2hvdy1tYW55LWNvdW50cmllcy1hcmUtdGhlcmUtaW4tdGhlLXdvcmxkLw==
    var sync = Promise.resolve();

    function fetchSync() {
        var args = Array.prototype.slice.call(arguments);
        sync = sync.then(function () {
            return fetch.apply(null, args);
        });
        return sync;
    }


    var _ = absol._;
    var $ = absol.$;
    var $$ = absol.$$;
    var table = $('table#example2');
    var res = {};
    var countries = {};
    countries.fieldNames = $$('thead th', table).map(function (e) {
        return e.innerHTML.replace('<br>', ' ').trim().replace('  ', ' ');
    });

    var urls = [];
    countries.rows = $$('tbody tr', table).map(function (row) {
        var cells = $$('td', row);
        var a = $('a', cells[1]);
        var url = a.href;
        urls.push(url);
        var name = a.innerHTML;
        var population = parseInt(cells[2].innerHTML.replace(/[,]/g, ''));
        var area = parseInt(cells[4].innerHTML.replace(/[,]/g, ''));
        return [name, population, cells[3].innerHTML, area];
    });

    Promise.all(urls.map(function (url, i, array) {
        return fetchSync(url).then((function (res) {
            return res.text()
        }))
            .then(function (html) {
                console.log(i + 1, '/', array.length);
                var tables = html.match(/<table class="table table-hover table-condensed table-list">(.|[\r\n])+\/table>/g);
                if (!tables) return null;
                var e = _(tables[0]);
                var isCity = $$('thead th', e).some(function (cell) {
                    return cell.innerHTML.indexOf('CITY') >= 0;
                });
                if (!isCity) {
                    console.log("Error", countries.rows[i][1], 'has no city');
                    return null;
                }
                var rows = $$('tbody tr', e).map(function (row) {
                    var cells = $$('td', row);
                    return [cells[1].innerHTML, parseInt(cells[2].innerHTML.replace(/[,]/g, ''))];
                });
                return rows;
            });
    })).then(function (data) {
        return {
            key_map: {population: 1, share_word: 's', area: 'a', cities: 't', name: 0},
            countries: data.map(function (it, i) {
                return {
                    '0': countries.rows[i][0],
                    '1': countries.rows[i][1],
                    s: countries.rows[i][2],
                    a: countries.rows[i][3],
                    t: it
                }
            })
        }
    }).then(function (result) {
        var js = 'export default ' + absol.generateJSVariable(result);
        absol.FileSaver.saveTextAs(js, 'cities.js');
    });
})()