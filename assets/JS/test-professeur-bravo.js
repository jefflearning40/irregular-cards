const professeur = document.getElementById('professeur');

professeur.addEventListener('load', () => {

    const svg = professeur.contentDocument;
    const animationBravo = svg.getElementById('animation-bravo');

    if (!animationBravo) {
        console.error('animation-bravo introuvable');
        return;
    }

    // =========================
    // GROUPE BRAVO
    // =========================

    animationBravo.style.transformBox = 'fill-box';
    animationBravo.style.transformOrigin = '0% 50%';
    animationBravo.style.transition = 'transform 0.3s ease';


    // =========================
    // ANIMATION BRAVO
    // =========================

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

});