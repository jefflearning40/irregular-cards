const professeur = document.getElementById('professeur');

professeur.addEventListener('load', () => {

    const svg = professeur.contentDocument;

    // =========================
    // ÉLÉMENTS DU SVG
    // =========================

    const brasErreur = svg.getElementById('bras-g');
    const animationBravo = svg.getElementById('animation-bravo');

    const sourcilG = svg.getElementById('sourcil-g');
    const sourcilD = svg.getElementById('sourcil-d');

    const btnErreur = document.getElementById('btn-erreur');
    const btnBravo = document.getElementById('btn-bravo');


    // =========================
    // VÉRIFICATION
    // =========================

    if (
        !brasErreur ||
        !animationBravo ||
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
    // GROUPE BRAVO
    // =========================

    animationBravo.style.transformBox = 'fill-box';
    animationBravo.style.transformOrigin = '0% 50%';
    animationBravo.style.transition = 'transform 0.3s ease';


    // =========================
    // ÉTAT INITIAL
    // =========================

    brasErreur.style.display = 'inline';
    animationBravo.style.display = 'none';

    sourcilG.style.transform = 'rotate(0deg)';
    sourcilD.style.transform = 'rotate(0deg)';

    brasErreur.style.transform = 'rotate(0deg)';
    animationBravo.style.transform = 'rotate(0deg)';


    // =========================
    // ANIMATION ERREUR
    // =========================

    function jouerErreur() {

        // On affiche uniquement le bras erreur
        animationBravo.style.display = 'none';
        brasErreur.style.display = 'inline';

        // Remise à zéro
        brasErreur.style.transform = 'rotate(0deg)';

        // Froncer les sourcils
        sourcilG.style.transform = 'rotate(-45deg)';
        sourcilD.style.transform = 'rotate(45deg)';

        // Mouvement du bras
        setTimeout(() => {

            let mouvements = 0;

            const animationBras = setInterval(() => {

                if (mouvements % 2 === 0) {
                    brasErreur.style.transform = 'rotate(-10deg)';
                } else {
                    brasErreur.style.transform = 'rotate(5deg)';
                }

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
    // ANIMATION BRAVO
    // =========================

    function jouerBravo() {

        // Sourcils normaux
        sourcilG.style.transform = 'rotate(0deg)';
        sourcilD.style.transform = 'rotate(0deg)';

        // On affiche uniquement le groupe bravo
        brasErreur.style.display = 'none';
        animationBravo.style.display = 'inline';

        // Remise à zéro
        animationBravo.style.transform = 'rotate(0deg)';

        // Mouvement bravo
        setTimeout(() => {
            animationBravo.style.transform = 'rotate(-15deg)';
        }, 300);

        setTimeout(() => {
            animationBravo.style.transform = 'rotate(5deg)';
        }, 700);

        setTimeout(() => {
            animationBravo.style.transform = 'rotate(-15deg)';
        }, 1100);

        setTimeout(() => {
            animationBravo.style.transform = 'rotate(0deg)';
        }, 1500);
    }


    // =========================
    // BOUTONS
    // =========================

    btnErreur.addEventListener('click', jouerErreur);
    btnBravo.addEventListener('click', jouerBravo);

});