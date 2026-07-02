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

let AVIS = [];



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

    // 🔴 sécurité : note globale (AVIS[0]) doit exister
    if (!AVIS[0])
        alert("Merci de renseigner au moins la note globale.");
        return;
    }

    // =========================
    // 📊 CALCUL MOYENNE
    // =========================
    let total = 0;
    let nb = 0;

    AVIS.forEach(note => {
        total += Number(note);
        nb++;
    });

    const moyenne = total / nb;

    // =========================
    // 🎨 PASTILLE
    // =========================
    let pastille = "";

    if (moyenne >= 4) {
        pastille = "🟢";
    }
    else if (moyenne >= 3) {
        pastille = "🟡";
    }
    else {
        pastille = "🔴";
    }

    // =========================
    // 🧾 DÉTAIL NOTES
    // =========================
    let detailsNotes = "";

    CONFIG.questions.forEach((question,index)=>{
        detailsNotes +=
            question +
            " : " +
            AVIS[index] +
            "/5\n";
    });

    // =========================
    // 📦 OBJET FINAL
    // =========================
    const resultat = {

        commerce: CONFIG.commerce.nom,
        date: new Date().toLocaleString(),

        notes: AVIS,

        moyenne: moyenne,
        pastille: pastille,

        commentaire,
        prenom,
        contact
    };

    console.clear();
    console.log("=== DONNEES RECUPEREES ===");
    console.log(resultat);

    // =========================
    // 📧 APERÇU
    // =========================
    const apercu = `

📧 EMAIL PRÉVU
====================

${pastille} Note moyenne : ${moyenne.toFixed(1)}/5

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

${pastille} Nouvel avis reçu

⭐ Moyenne :
${moyenne.toFixed(1)}/5

`;

    document.getElementById("message").innerHTML =
        "<pre class='apercu'>" +
        apercu +
        "</pre>";
}