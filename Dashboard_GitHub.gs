function genererDashboardJsonTest() {

  const classeur = SpreadsheetApp.getActiveSpreadsheet();

  const feuilleKpi =
    classeur.getSheetByName("Historique_KPI");

  const feuilleAvis =
    classeur.getSheetByName("Avis");

  const feuilleSynthese =
    classeur.getSheetByName("Synthese_Commentaires");

  if (!feuilleKpi || !feuilleAvis || !feuilleSynthese) {
    throw new Error(
      "Une feuille est introuvable : Historique_KPI, Avis ou Synthese_Commentaires."
    );
  }

  /*
   * ============================
   * DERNIÈRE LIGNE DES KPI
   * ============================
   */

  const derniereLigneKpi = feuilleKpi.getLastRow();

  if (derniereLigneKpi < 2) {
    throw new Error("Historique_KPI ne contient aucune donnée.");
  }

  /*
   * Colonnes Historique_KPI :
   *
   * A Date
   * B Nb avis
   * C Expérience globale
   * D Clients satisfaits
   * E Cuisine
   * F Accueil
   * G Rapidité
   * H Rapport Q/P
   * I Avis positifs
   * J Avis négatifs
   * K Tendance
   * L Point fort
   * M À améliorer
   */

  const derniereLigne = feuilleKpi
    .getRange(derniereLigneKpi, 1, 1, 13)
    .getValues()[0];

  const dateKpi = derniereLigne[0];

  const nombreAvis = convertirNombre(derniereLigne[1]);
  const noteGlobale = convertirNombre(derniereLigne[2]);
  const satisfaction = convertirPourcentage(derniereLigne[3]);

  const cuisine = convertirNombre(derniereLigne[4]);
  const accueil = convertirNombre(derniereLigne[5]);
  const rapidite = convertirNombre(derniereLigne[6]);
  const prix = convertirNombre(derniereLigne[7]);

  const tendance = convertirNombre(derniereLigne[10]);

  const pointFort =
    String(derniereLigne[11] || "Pas encore de données");

  const aAmeliorer =
    String(derniereLigne[12] || "Pas encore de données");

  /*
   * ============================
   * ÉTAT GLOBAL
   * ============================
   */

  const etat = calculerEtatDashboard(noteGlobale);

  /*
   * ============================
   * HISTORIQUE
   * ============================
   */

  const historique = construireHistoriqueDashboard(
    feuilleKpi
  );

  /*
   * ============================
   * SYNTHÈSE DES COMMENTAIRES
   * ============================
   */

  const syntheseCommentaires =
    lireSyntheseCommentaires(feuilleSynthese);

  /*
   * ============================
   * DERNIERS AVIS
   * ============================
   */

  const derniersAvis =
    lireDerniersAvis(feuilleAvis, 3);

  /*
   * ============================
   * OBJET FINAL
   * ============================
   */

  const dashboard = {

    commerce: {
      nom: "La Chope balmanaise",
      logo: "images/Logo-La-chope.png",
      slogan: "Tableau de bord Satisfaction Client"
    },

    maj: Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "dd/MM/yyyy HH:mm"
    ),

    etat: etat,

    kpi: {
      note: arrondir1(noteGlobale),
      satisfaction: Math.round(satisfaction),
      avis: nombreAvis,
      tendance: arrondir1(tendance),
      pointFort: pointFort,
      ameliorer: aAmeliorer
    },

    criteres: {
      cuisine: arrondir1(cuisine),
      accueil: arrondir1(accueil),
      rapidite: arrondir1(rapidite),
      prix: arrondir1(prix)
    },

    historique: historique,

    commentaires: syntheseCommentaires,

    analyse: [
      "Principal point fort : " +
        syntheseCommentaires.pointFort.theme +
        " — " +
        syntheseCommentaires.pointFort.mentions +
        " mentions positives.",

      "Principal irritant : " +
        syntheseCommentaires.irritant.theme +
        " — " +
        syntheseCommentaires.irritant.mentions +
        " mentions négatives.",

      syntheseCommentaires.pourcentagePositif +
        " % des commentaires présentent une tendance positive."
    ],

    derniersAvis: derniersAvis
  };

  /*
   * Affichage dans le journal Apps Script.
   * Aucun envoi vers GitHub à ce stade.
   */

  const json = JSON.stringify(dashboard, null, 2);

  Logger.log(json);

  classeur.toast(
    "JSON généré. Consulte le journal d’exécution.",
    "Dashboard",
    5
  );

  return json;
}


/*
 * ==========================================
 * CONSTRUCTION DE L’HISTORIQUE
 * ==========================================
 */

function construireHistoriqueDashboard(feuilleKpi) {

  const derniereLigne = feuilleKpi.getLastRow();

  if (derniereLigne < 2) {
    return [];
  }

  const lignes = feuilleKpi
    .getRange(2, 1, derniereLigne - 1, 3)
    .getValues();

  return lignes
    .filter(ligne => ligne[0] !== "")
    .slice(-30)
    .map(ligne => {

      return {
        date: formaterDateCourte(ligne[0]),
        note: arrondir1(
          convertirNombre(ligne[2])
        ),
        avis: convertirNombre(ligne[1])
      };
    });
}


/*
 * ==========================================
 * LECTURE DE SYNTHÈSE_COMMENTAIRES
 * ==========================================
 */

function lireSyntheseCommentaires(feuille) {

  const total = convertirNombre(
    feuille.getRange("B3").getValue()
  );

  const pourcentagePositif =
    convertirPourcentage(
      feuille.getRange("C11").getValue()
    );

  const pourcentageMitige =
    convertirPourcentage(
      feuille.getRange("C12").getValue()
    );

  const pourcentageNegatif =
    convertirPourcentage(
      feuille.getRange("C13").getValue()
    );

  const pourcentageNonDetermine =
    convertirPourcentage(
      feuille.getRange("C9").getValue()
    );

  const pointFortTheme =
    String(
      feuille.getRange("B45").getValue() ||
      "Pas encore de données"
    );

  const pointFortMentions =
    convertirNombre(
      feuille.getRange("C45").getValue()
    );

  const irritantTheme =
    String(
      feuille.getRange("B61").getValue() ||
      "Pas encore de données"
    );

  const irritantMentions =
    convertirNombre(
      feuille.getRange("C61").getValue()
    );

  const termesPositifs =
    lireClassementTermes(
      feuille,
      65,
      1,
      2,
      10
    );

  const termesNegatifs =
    lireClassementTermes(
      feuille,
      65,
      4,
      5,
      10
    );

  return {

    total: total,

    pourcentagePositif:
      Math.round(pourcentagePositif),

    pourcentageMitige:
      Math.round(pourcentageMitige),

    pourcentageNegatif:
      Math.round(pourcentageNegatif),

      pourcentageNonDetermine:
      Math.round(pourcentageNonDetermine),

    pointFort: {
      theme: pointFortTheme,
      mentions: pointFortMentions
    },

    irritant: {
      theme: irritantTheme,
      mentions: irritantMentions
    },

    termesPositifs: termesPositifs,

    termesNegatifs: termesNegatifs
  };
}


/*
 * ==========================================
 * LECTURE DES CLASSEMENTS DE TERMES
 * ==========================================
 */

function lireClassementTermes(
  feuille,
  premiereLigne,
  colonneTerme,
  colonneMentions,
  nombreLignes
) {

  const termes = feuille
    .getRange(
      premiereLigne,
      colonneTerme,
      nombreLignes,
      1
    )
    .getDisplayValues();

  const mentions = feuille
    .getRange(
      premiereLigne,
      colonneMentions,
      nombreLignes,
      1
    )
    .getValues();

  const resultat = [];

  for (let i = 0; i < nombreLignes; i++) {

    const terme = termes[i][0].trim();

    if (!terme) {
      continue;
    }

    resultat.push({
      terme: terme,
      mentions: convertirNombre(
        mentions[i][0]
      )
    });
  }

  return resultat;
}


/*
 * ==========================================
 * LECTURE DES DERNIERS AVIS COMMENTÉS
 * ==========================================
 */

function lireDerniersAvis(feuilleAvis, limite) {

  const derniereLigne = feuilleAvis.getLastRow();

  if (derniereLigne < 2) {
    return [];
  }

  /*
   * A à J :
   * H = moyenne
   * J = commentaire
   */

  const lignes = feuilleAvis
    .getRange(
      2,
      1,
      derniereLigne - 1,
      10
    )
    .getDisplayValues();

  return lignes
    .filter(ligne => ligne[9].trim() !== "")
    .slice(-limite)
    .reverse()
    .map(ligne => {

      return {
        note: convertirNombre(ligne[7]),
        texte: ligne[9]
      };
    });
}


/*
 * ==========================================
 * ÉTAT GLOBAL
 * ==========================================
 */

function calculerEtatDashboard(note) {

  if (note >= 4.2) {
    return {
      label: "⭐ Excellent",
      message:
        "La satisfaction client est excellente."
    };
  }

  if (note >= 3.9) {
    return {
      label: "🟢 Satisfaisant",
      message:
        "La satisfaction client est bonne."
    };
  }

  if (note >= 3.5) {
    return {
      label: "🟡 Correct",
      message:
        "La satisfaction reste correcte, avec certains points à surveiller."
    };
  }

  return {
    label: "🔴 Insatisfaisant",
    message:
      "La satisfaction nécessite une attention particulière."
  };
}


/*
 * ==========================================
 * OUTILS
 * ==========================================
 */

function convertirNombre(valeur) {

  if (
    valeur === null ||
    valeur === undefined ||
    valeur === ""
  ) {
    return 0;
  }

  if (typeof valeur === "number") {
    return valeur;
  }

  const nombre = Number(
    String(valeur)
      .replace(/\s/g, "")
      .replace(",", ".")
      .replace("%", "")
  );

  return isNaN(nombre) ? 0 : nombre;
}


function convertirPourcentage(valeur) {

  const nombre = convertirNombre(valeur);

  /*
   * Dans Google Sheets :
   * 87 % peut être stocké sous la forme 0,87.
   */

  if (nombre >= 0 && nombre <= 1) {
    return nombre * 100;
  }

  return nombre;
}


function arrondir1(nombre) {
  return Math.round(
    convertirNombre(nombre) * 10
  ) / 10;
}


function formaterDateCourte(valeur) {

  if (valeur instanceof Date) {
    return Utilities.formatDate(
      valeur,
      Session.getScriptTimeZone(),
      "dd/MM"
    );
  }

  const texte = String(valeur);

  if (texte.includes("/")) {
    const morceaux = texte.split("/");
    return morceaux[0] + "/" + morceaux[1];
  }

  return texte;
}

function envoyerDashboardVersGitHubOFFICIEL() {

  const proprietes =
    PropertiesService.getScriptProperties();

  const token =
    proprietes.getProperty("GITHUB_TOKEN");

  if (!token) {
    throw new Error(
      "Le token GitHub est introuvable dans les propriétés du script."
    );
  }

  /*
   * Paramètres GitHub officiel
   */
  const proprietaire = "Alain31140";

  const depot = "la-chope-balmanaise";

  const branche = "main";

  const cheminFichier = "dashboard.json";

  /*
   * Génération du JSON à partir
   * des vraies données du classeur.
   */
  const contenuJson =
    genererDashboardJsonTest();

  /*
   * Adresse de l’API GitHub
   */
  const url =
    "https://api.github.com/repos/" +
    proprietaire +
    "/" +
    depot +
    "/contents/" +
    cheminFichier;

  const entetes = {
    Authorization: "Bearer " + token,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };

  /*
   * GitHub exige le SHA actuel
   * pour modifier un fichier existant.
   */
  const reponseLecture =
    UrlFetchApp.fetch(
      url + "?ref=" + branche,
      {
        method: "get",
        headers: entetes,
        muteHttpExceptions: true
      }
    );

  const codeLecture =
    reponseLecture.getResponseCode();

  if (codeLecture !== 200) {

    throw new Error(
      "Impossible de lire dashboard.json sur GitHub.\n" +
      "Code GitHub : " +
      codeLecture +
      "\n" +
      reponseLecture.getContentText()
    );
  }

  const fichierActuel =
    JSON.parse(
      reponseLecture.getContentText()
    );

  /*
   * Encodage du JSON en Base64,
   * format demandé par GitHub.
   */
  const contenuBase64 =
    Utilities.base64Encode(
      contenuJson,
      Utilities.Charset.UTF_8
    );

  const donnees = {

    message:
      "Mise à jour automatique du dashboard officiel",

    content: contenuBase64,

    sha: fichierActuel.sha,

    branch: branche
  };

  /*
   * Mise à jour du fichier.
   */
  const reponseEcriture =
    UrlFetchApp.fetch(
      url,
      {
        method: "put",
        headers: entetes,
        contentType: "application/json",
        payload: JSON.stringify(donnees),
        muteHttpExceptions: true
      }
    );

  const codeEcriture =
    reponseEcriture.getResponseCode();

  if (
    codeEcriture !== 200 &&
    codeEcriture !== 201
  ) {

    throw new Error(
      "Échec de la mise à jour GitHub.\n" +
      "Code GitHub : " +
      codeEcriture +
      "\n" +
      reponseEcriture.getContentText()
    );
  }

  SpreadsheetApp
    .getActiveSpreadsheet()
    .toast(
      "dashboard.json officiel mis à jour sur GitHub.",
      "GitHub",
      6
    );

  Logger.log(
    "Mise à jour GitHub réussie : " +
    codeEcriture
  );
}
