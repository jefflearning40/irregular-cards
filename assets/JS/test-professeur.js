const professeur = document.getElementById('professeur');

professeur.addEventListener('load', () => {

    const svg = professeur.contentDocument;

    const bras = svg.getElementById('bras-g');
    const sourcilG = svg.getElementById('sourcil-g');
    const sourcilD = svg.getElementById('sourcil-d');


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
    // BRAS
    // =========================

    bras.style.transformBox = 'fill-box';
    bras.style.transformOrigin = '0% 50%';
    bras.style.transition = 'transform 0.5s ease';


    // =========================
    // 1 - FRONCER LES SOURCILS
    // =========================

    sourcilG.style.transform = 'rotate(-45deg)';
    sourcilD.style.transform = 'rotate(45deg)';


    // =========================
    // 2 - BOUGER LE BRAS
    // =========================

    setTimeout(() => {

        let mouvements = 0;

        const animationBras = setInterval(() => {

            bras.style.transform =
                bras.style.transform === 'rotate(-10deg)'
                    ? 'rotate(5deg)'
                    : 'rotate(-10deg)';

            mouvements++;

            if (mouvements === 4) {

                clearInterval(animationBras);

                setTimeout(() => {
                    bras.style.transform = 'rotate(0deg)';
                }, 500);
            }

        }, 600);

    }, 100);

});