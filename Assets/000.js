var link = document.querySelector("link[rel~='icon']");
if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
}

setInterval(function(){
	if(document.hidden){
		document.title = "2951";
		link.href = '/qr/Assets/favicon.ico';
	} else {
		link.href = '/qr/favicon.ico';
		document.title = "Numeros";
	}
}, 200);


