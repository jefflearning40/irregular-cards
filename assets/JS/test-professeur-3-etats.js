const professeur = document.getElementById('professeur');

professeur.addEventListener('load', () => {

    const svg = professeur.contentDocument;

    // =========================
    // ÉLÉMENTS DU SVG
    // =========================

    const brasNeutre = svg.getElementById('bras-g-neutre');
    const brasErreur = svg.getElementById('bras-g');
    const brasBravo = svg.getElementById('animation-bravo');

    const sourcilG = svg.getElementById('sourcil-g');
    const sourcilD = svg.getElementById('sourcil-d');

    const btnNeutre = document.getElementById('btn-neutre');
    const btnErreur = document.getElementById('btn-erreur');
    const btnBravo = document.getElementById('btn-bravo');


    // =========================
    // VÉRIFICATION
    // =========================

    if (
        !brasNeutre ||
        !brasErreur ||
        !brasBravo ||
        !sourcilG ||
        !sourcilD
    ) {
        console.error('Un élément du professeur est introuvable.');
        return;
    }


    // =========================
    // SOURCILS
    // =========================

    sourcilG.style.transformBox = 'fill-box';
    sourcilD.style.transformBox = 'fill-box';

    sourcilG.style.transformOrigin = 'center';
    sourcilD.style.transformOrigin = 'center';

    sourcilG.style.transition = 'transform 0.3s ease';
    sourcilD.style.transition = 'transform 0.3s ease';


    // =========================
    // BRAS ERREUR
    // =========================

    brasErreur.style.transformBox = 'fill-box';
    brasErreur.style.transformOrigin = '0% 50%';
    brasErreur.style.transition = 'transform 0.5s ease';


    // =========================
    // BRAS BRAVO
    // =========================

    brasBravo.style.transformBox = 'fill-box';
    brasBravo.style.transformOrigin = '0% 50%';
    brasBravo.style.transition = 'transform 0.3s ease';


    // =========================
    // ÉTAT INITIAL : NEUTRE
    // =========================

    brasNeutre.style.display = 'inline';
    brasErreur.style.display = 'none';
    brasBravo.style.display = 'none';

    sourcilG.style.transform = 'rotate(0deg)';
    sourcilD.style.transform = 'rotate(0deg)';


    // =========================
    // NEUTRE
    // =========================

    function jouerNeutre() {

        brasNeutre.style.display = 'inline';
        brasErreur.style.display = 'none';
        brasBravo.style.display = 'none';

        sourcilG.style.transform = 'rotate(0deg)';
        sourcilD.style.transform = 'rotate(0deg)';

        brasErreur.style.transform = 'rotate(0deg)';
        brasBravo.style.transform = 'rotate(0deg)';
    }


    // =========================
    // ERREUR
    // =========================

    function jouerErreur() {

        brasNeutre.style.display = 'none';
        brasBravo.style.display = 'none';
        brasErreur.style.display = 'inline';

        // Sourcils froncés
        sourcilG.style.transform = 'rotate(-45deg)';
        sourcilD.style.transform = 'rotate(45deg)';

        // Position initiale du bras
        brasErreur.style.transform = 'rotate(0deg)';

        // Mouvement du bras
        setTimeout(() => {

            let mouvements = 0;

            const animationBras = setInterval(() => {

                brasErreur.style.transform =
                    brasErreur.style.transform === 'rotate(-10deg)'
                        ? 'rotate(5deg)'
                        : 'rotate(-10deg)';

                mouvements++;

                if (mouvements === 4) {

                    clearInterval(animationBras);

                    setTimeout(() => {
                        brasErreur.style.transform = 'rotate(0deg)';
                    }, 500);
                }

            }, 600);

        }, 100);
    }


    // =========================
    // BRAVO
    // =========================

    function jouerBravo() {

        brasNeutre.style.display = 'none';
        brasErreur.style.display = 'none';
        brasBravo.style.display = 'inline';

        // Sourcils normaux
        sourcilG.style.transform = 'rotate(0deg)';
        sourcilD.style.transform = 'rotate(0deg)';

        // Position initiale
        brasBravo.style.transform = 'rotate(0deg)';

        // Mouvement Bravo
        setTimeout(() => {
            brasBravo.style.transform = 'rotate(-15deg)';
        }, 300);

        setTimeout(() => {
            brasBravo.style.transform = 'rotate(5deg)';
        }, 700);

        setTimeout(() => {
            brasBravo.style.transform = 'rotate(-15deg)';
        }, 1100);

        setTimeout(() => {
            brasBravo.style.transform = 'rotate(0deg)';
        }, 1500);
    }


    // =========================
    // BOUTONS
    // =========================

    btnNeutre.addEventListener('click', jouerNeutre);
    btnErreur.addEventListener('click', jouerErreur);
    btnBravo.addEventListener('click', jouerBravo);

});