/* ==========================================================
   QRFeedback V1.0
   app.js
========================================================== */


/*----------------------------------------------------------
  Configuration
----------------------------------------------------------*/

/*----------------------------------------------------------
  Configuration
----------------------------------------------------------*/

let CONFIG = {

    commerce: {

        nom: "La chope balmanaise",

        slogan: "Merci de votre visite !",

        logo: "images/logo.png"

    },


    questions: [

        "Expérience globale",

        "Qualité des plats",

        "Accueil",

        "Rapidité du service",

        "Rapport qualité / prix"

    ]

};



/*----------------------------------------------------------
  Etat
----------------------------------------------------------*/

const AVIS = {};



/*----------------------------------------------------------
  Initialisation
----------------------------------------------------------*/

window.addEventListener("DOMContentLoaded", initialiser);



function initialiser(){

    document.getElementById("btnEnvoyer").disabled = true;

    afficherCommerce();

    construireQuestionnaire();

    document
        .getElementById("btnEnvoyer")
        .addEventListener("click", envoyer);


   

}



/*----------------------------------------------------------
  Commerce
----------------------------------------------------------*/

function afficherCommerce(){

    document.getElementById("commerceNom").textContent =
        CONFIG.commerce.nom;

    document.getElementById("commerceSlogan").textContent =
        CONFIG.commerce.slogan;


    const logo = document.getElementById("logo");

    logo.onerror = function(){

        logo.style.display = "none";

        const icone = document.createElement("div");

        icone.innerHTML = "🍽️";

        icone.style.fontSize = "70px";
        icone.style.textAlign = "center";
        icone.style.marginBottom = "15px";

        logo.parentNode.insertBefore(
            icone,
            logo
        );

    };

    logo.src = CONFIG.commerce.logo;

}



/*----------------------------------------------------------
  Questionnaire
----------------------------------------------------------*/

function construireQuestionnaire(){

    const zone =
        document.getElementById("questionnaire");


    CONFIG.questions.forEach((question,index)=>{

        AVIS[index]=0;


        const bloc =
            document.createElement("div");

        bloc.className="question";


        const titre =
            document.createElement("label");

        titre.textContent=question;

const note = document.createElement("span");

note.id = "note-" + index;

note.style.float = "right";
note.style.fontWeight = "normal";
note.style.color = "#777";
note.textContent = "0 / 5";

titre.appendChild(note);

        bloc.appendChild(titre);


        const etoiles =
            document.createElement("div");

        etoiles.className="stars";


        for(let i=1;i<=5;i++){

            const star =
                document.createElement("span");

            star.className="star";

            star.innerHTML="★";

            star.dataset.question=index;

            star.dataset.note=i;

            star.onclick=selectionner;

            etoiles.appendChild(star);

        }


        bloc.appendChild(etoiles);

        zone.appendChild(bloc);

    });

}



/*----------------------------------------------------------
  Etoiles
----------------------------------------------------------*/

function selectionner(){

    const question =
        this.dataset.question;

    const note =
        Number(this.dataset.note);


    AVIS[question]=note;

document.getElementById(
    "note-" + question
).textContent = note + " / 5";

    const etoiles =
        document.querySelectorAll(
            '.star[data-question="'+question+'"]'
        );


    etoiles.forEach(star=>{

        if(Number(star.dataset.note)<=note){

            star.classList.add("active");

        }
        else{

            star.classList.remove("active");

        }

    });
    document.getElementById("btnEnvoyer").disabled = (AVIS[0] === 0);


}



/*----------------------------------------------------------
  Envoi (simulation)
----------------------------------------------------------*/

/*----------------------------------------------------------
  Envoi (simulation V1.1)
----------------------------------------------------------*/

function envoyer(){

    const commentaire =
        document.getElementById("commentaire").value.trim();


    const prenom =
        document.getElementById("prenom").value.trim();


    const contact =
        document.getElementById("contact").checked;



    if(AVIS[0]===0){

        alert("Merci de renseigner au moins la note globale.");

        return;

    }



    let detailsNotes = "";

    CONFIG.questions.forEach((question,index)=>{

        detailsNotes +=
        question +
        " : " +
        AVIS[index] +
        "/5\n";

    });



    const resultat={


        commerce:
            CONFIG.commerce.nom,


        date:
            new Date().toLocaleString(),


        notes:
            AVIS,

       
        
        commentaire,

        prenom,

        contact

    };



    console.clear();


    console.log("=== DONNEES RECUPEREES ===");

    console.log(resultat);

    fetch("https://hook.eu1.make.com/nwgi0ghxwg8a4ud9qmoj5qnj5cfahuma", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(resultat)

    })

    .then(() => {

        console.log("Avis envoyé à Make");

    })

    .catch(error => {

        console.error("Erreur envoi Make :", error);

    });

    const apercu = `

📧 EMAIL PRÉVU
====================

Commerce :
${resultat.commerce}

Date :
${resultat.date}


${detailsNotes}


👤 Client :
${prenom || "Anonyme"}


📞 Recontact :
${contact ? "Oui" : "Non"}


💬 Commentaire :

${commentaire || "Aucun commentaire"}



📱 NOTIFICATION NTFY
====================


🍽️ Nouvel avis reçu

⭐ Note globale :
${AVIS[0]}/5


${commentaire || ""}

`;

let couleurAvis = "";

if (AVIS[0] >= 4) {
    couleurAvis = "avis-vert";
}
else if (AVIS[0] === 3) {
    couleurAvis = "avis-orange";
}
else {
    couleurAvis = "avis-rouge";
}
let pastilleAvis = "";

if (AVIS[0] >= 4) {
    pastilleAvis = "🟢";
}
else if (AVIS[0] === 3) {
    pastilleAvis = "🟠";
}
else {
    pastilleAvis = "🔴";
}
    document.getElementById("message").innerHTML =

    "<pre class='apercu " + couleurAvis + "'>" +

    apercu +

    "</pre>";



}
