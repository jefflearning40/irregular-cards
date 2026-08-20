const card = document.getElementById("card");

const sound = document.getElementById("sound");



/*
    Retourner la carte
*/

card.addEventListener("click", () => {

    card.classList.toggle("flip");

});



/*
    Prononciation
*/


sound.addEventListener("click", (event) => {


    event.stopPropagation();



    const text = "go, went, gone";


    const speech = new SpeechSynthesisUtterance(text);


    speech.lang = "en-US";


    speech.rate = 0.8;


    window.speechSynthesis.speak(speech);


});