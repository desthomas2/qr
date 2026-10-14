const rot18 = (() => {
	const forward = "ABCDEFGHIJKLM01234";
	const reverse = "NOPQRSTUVWXYZ56789";
	const charMap = new Map();
	for (let loopIndex = 0; loopIndex < 18; loopIndex++) {
		const key = forward[loopIndex];
		const val = reverse[loopIndex];
		charMap.set(key, val);
		charMap.set(val, key);
		if (/\D/.test(key)) {
			charMap.set(key.toLowerCase(), val.toLowerCase());
			charMap.set(val.toLowerCase(), key.toLowerCase());
		}
	}
	return input => input.replace(/\w/gu, char => charMap.get(char) ?? char);
})();

document.getElementById("authbutton").addEventListener("click", function(){
  console.warn("OK")
  const codeReader = new ZXing.BrowserPDF417Reader();

  // La largeur et la hauteur de la photo capturÃ©e. On utilisera
  // une largeur fixe et on calculera la hauteur pour correspondre
  // aux proportions du flux vidÃ©o d'entrÃ©e.

  const width = 320; // On met Ã  l'Ã©chelle la photo pour avoir cette largeur
  let height = 0; // On calcule cette valeur ensuite selon le flux d'entrÃ©e

  // |streaming| indique si le flux vidÃ©o est en cours
  // Lorsqu'on commence, ce n'est pas le cas (false).

  let streaming = false;

  // On rÃ©fÃ©rence les Ã©lÃ©ments HTML qu'il faudra configurer ou contrÃ´ler.
  // Ils seront dÃ©finis lors de la fonction startup().

  let video = null;
  let canvas = null;
  let photo = null;
  let startbutton = null;

  function showViewLiveResultButton() {
    if (window.self !== window.top) {
      // On s'assure que si notre document est dans une iframe,
      // on invite la personne Ã  ouvrir l'exemple dans un onglet
      // ou une fenÃªtre sÃ©parÃ©e. Sinon, le navigateur n'envoie
      // pas la demande d'accÃ¨s Ã  la camÃ©ra.
      document.querySelector(".contentarea").remove();
      const button = document.createElement("button");
      button.textContent =
        "Voir le rÃ©sultat de l'exemple dont le code est prÃ©sentÃ© avant";
      document.body.append(button);
      button.addEventListener("click", () => window.open(location.href));
      return true;
    }
    return false;
  }

  function startup() {
    if (showViewLiveResultButton()) {
      return;
    }
    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    photo = document.getElementById("photo");
    startbutton = document.getElementById("startbutton");
    resultEl = document.getElementById("resultEl");

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error(`Une erreur est survenue : ${err}`);
      });

    video.addEventListener(
      "canplay",
      (ev) => {
        if (!streaming) {
          height = video.videoHeight / (video.videoWidth / width);

          // Firefox a un bug oÃ¹ la hauteur ne peut pas Ãªtre lue
          // Ã  partir de la vidÃ©o. On prend des prÃ©cautions.

          if (isNaN(height)) {
            height = width / (4 / 3);
          }

          video.setAttribute("width", width);
          video.setAttribute("height", height);
          canvas.setAttribute("width", width);
          canvas.setAttribute("height", height);
          streaming = true;
        }
      },
      false,
    );

    startbutton.addEventListener(
      "click",
      (ev) => {
        takepicture();
	scanpicture();
        ev.preventDefault();
      },
      false,
    );

    clearphoto();
  }

  // On remplit le cadre de la photo pour indiquer l'absence
  // d'image capturÃ©e.

  function clearphoto() {
    const context = canvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  }

  // On capture une photo en rÃ©cupÃ©rant le contenu courant de la
  // vidÃ©o, qu'on dessine dans un canevas puis qu'on convertit
  // en une URL de donnÃ©es contenant l'image au format PNG.
  // En utilisant un canevas en dehors de l'Ã©cran, on peut
  // modifier sa taille et/ou appliquer d'autres modifications
  // avant de l'afficher Ã  l'Ã©cran.

  function takepicture() {
    const context = canvas.getContext("2d");
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      const data = canvas.toDataURL("image/png");
      photo.setAttribute("src", data);
    } else {
      clearphoto();
    }
  }

  function scanpicture(){
    console.log("scannnn");
    const img = photo.cloneNode(true);
    
    video.style.display = "none";
    canvas.style.display = "none";
    document.getElementById("photo").style.display = "none";
    document.getElementById("photo").parentElement.style.display = "none";
    startbutton.style.display = "none";
    codeReader.decodeFromImage(img)
          .then(result => {
            console.log(result);
            resultEl.textContent = rot18(result.text);
          })
          .catch(err => {
            console.error(err);
            resultEl.textContent = "Aucun QR code n'a ete dÃ©tectÃ©...";
          });
  }

  // On met en place un gestionnaire d'Ã©vÃ¨nement pour exÃ©cuter
  // le code lorsque le chargement du document est terminÃ©.
  //window.addEventListener("load", startup, false);
  startup();
  document.getElementById("authbutton").style.display = "none";
  document.getElementById("video").style.display = "unset";
  document.getElementById("startbutton").style.display = "unset";
});


