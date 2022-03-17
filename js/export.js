/* Exporting the map to various formats */

function exportToPng() {
    let mapb64 = primaryPixiApp.renderer.plugins.extract.base64(cont_offset, "image/png");
    console.log(mapb64);
    
    //const base64String = await convertBlobToBase64(blob);
    downloadImage(mapb64, "test.png");
}

function downloadImage(b64, filename) {
    let a = document.createElement("a");
    a.href = b64;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        document.body.removeChild(a);
    }, 0);
}


function download(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}