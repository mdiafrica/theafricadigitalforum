import { getLocale } from "@/paraglide/runtime"

/**
 * French labels for the registration form. Option values stay English (the
 * server validates against the English lists); only what the visitor sees is
 * translated. Unknown strings fall back to the English original.
 */
const FR: Record<string, string> = {
  // Page
  "Africa Digital Forum (ADF) Registration":
    "Inscription au Africa Digital Forum (ADF)",
  "Join the premier continental platform shaping digital transformation, artificial intelligence, innovation, and technological sovereignty in Africa.":
    "Rejoignez la première plateforme continentale qui façonne la transformation numérique, l'intelligence artificielle, l'innovation et la souveraineté technologique en Afrique.",
  "Your Details": "Vos informations",
  "Your Interests": "Vos centres d'intérêt",
  Consent: "Consentement",

  // Event summary
  Dates: "Dates",
  Location: "Lieu",
  "Host Organization": "Organisation hôte",
  "Expected Audience": "Public attendu",
  "June 2–4, 2026": "2–4 Juin 2026",
  "Country of Nationality": "Pays de nationalité",
  "Please select your country of nationality.":
    "Veuillez sélectionner votre pays de nationalité.",
  Other: "Autre",
  "Please tell us what you have in mind": "Dites-nous ce que vous avez en tête",
  "Please tell us what you mean by “Other”.":
    "Veuillez préciser ce que vous entendez par « Autre ».",
  "Please select at least one interest area.":
    "Veuillez sélectionner au moins un domaine d’intérêt.",
  "Government leaders, C-level executives, tech founders, investors, researchers, and civil society":
    "Dirigeants gouvernementaux, cadres dirigeants, fondateurs de startups technologiques, investisseurs, chercheurs et société civile",

  // Pass selection
  "Choose Your Pass": "Choisissez votre pass",
  "Select the participation tier that best aligns with your goals, or use an access code. The registration form appears once you choose.":
    "Sélectionnez la formule de participation qui correspond le mieux à vos objectifs, ou utilisez un code d'accès. Le formulaire d'inscription apparaît une fois votre choix effectué.",
  "Most Popular": "Le plus populaire",
  Selected: "Sélectionné",
  "Select {name}": "Sélectionner {name}",
  "I have an access code": "J'ai un code d'accès",
  "For the ADF team, partners and organizations that registered on your behalf. Payment is waived.":
    "Pour l'équipe ADF, les partenaires et les organisations qui se sont inscrits en votre nom. Le paiement est annulé.",
  Free: "Gratuit",
  "Access code": "Code d'accès",
  "Enter your access code": "Saisissez votre code d'accès",
  Apply: "Appliquer",
  Remove: "Retirer",
  "Code {code} applied": "Code {code} appliqué",
  ". No payment is required": ". Aucun paiement n'est requis",
  " — now pick your pass above.":
    " — choisissez maintenant votre pass ci-dessus.",
  "Choose a pass above to continue to the registration form.":
    "Choisissez un pass ci-dessus pour accéder au formulaire d'inscription.",
  "Could not check this code.": "Impossible de vérifier ce code.",
  "This access code is invalid or no longer available.":
    "Ce code d'accès est invalide ou n'est plus disponible.",
  "Invalid code": "Code invalide",

  // Passes
  "General Pass": "Pass Général",
  "Executive Pass": "Pass Exécutif",
  "VIP Pass": "Pass VIP",
  "Designed for tech professionals, startup team members, researchers, and general attendees seeking to learn, network, and explore Africa's evolving digital ecosystem. Includes complete access to all main stage keynotes, panel discussions, and the Innovation Expo floor.":
    "Conçu pour les professionnels de la tech, les membres d'équipes de startups, les chercheurs et les participants souhaitant apprendre, réseauter et explorer l'écosystème numérique africain en pleine évolution. Inclut l'accès complet à toutes les keynotes de la scène principale, aux panels et à l'espace Innovation Expo.",
  "Designed for senior management, investors, startup founders, and policy advocates. Unlocks exclusive access to the Executive Lounge, priority seating, structured B2B networking sessions, and specialized thematic workshops.":
    "Conçu pour les cadres supérieurs, les investisseurs, les fondateurs de startups et les défenseurs des politiques publiques. Donne accès au salon Executive, aux places prioritaires, aux sessions de réseautage B2B structurées et à des ateliers thématiques spécialisés.",
  "Designed for C-level executives, government ministers, international delegates, and key sponsors. Delivers the ultimate forum experience with front-row priority seating, private VIP lounge privileges, direct access to high-level policy roundtables, and invitations to exclusive VIP dinners and galas.":
    "Conçu pour les dirigeants, les ministres, les délégués internationaux et les principaux sponsors. Offre l'expérience ultime du forum : places prioritaires au premier rang, accès au salon VIP privé, accès direct aux tables rondes politiques de haut niveau et invitations aux dîners et galas VIP exclusifs.",

  // Pass comparison
  "Plenary & Keynote Access": "Accès aux plénières et keynotes",
  "Full Access": "Accès complet",
  "Priority Front-Row Access": "Accès prioritaire au premier rang",
  "Innovation Expo Access": "Accès à l'Innovation Expo",
  "Limited Access": "Accès limité",
  "Full Access + Fast Track": "Accès complet + file prioritaire",
  "Networking App & Directory": "Application de réseautage et annuaire",
  "Standard Profile": "Profil standard",
  "Enhanced Matchmaking": "Mise en relation renforcée",
  "Matchmaking & Direct Messaging": "Mise en relation et messagerie directe",
  "Lunch & Coffee Breaks": "Déjeuners et pauses café",
  "Included (3 Days)": "Inclus (3 jours)",
  "Dedicated Executive Catering": "Restauration Executive dédiée",
  "VIP Executive Catering Lounge": "Salon de restauration VIP Executive",
  "B2B Matchmaking & Workshops": "Mise en relation B2B et ateliers",
  "General Entry": "Accès général",
  "Priority Workshop Registration": "Inscription prioritaire aux ateliers",
  "Dedicated Concierge Matchmaking":
    "Mise en relation avec conciergerie dédiée",
  "Networking Receptions": "Réceptions de réseautage",
  "Opening Reception": "Réception d'ouverture",
  "Opening & Executive Networking": "Ouverture et réseautage Executive",
  "Private VIP Opening Gala & Ministerial Dinners":
    "Gala d'ouverture VIP privé et dîners ministériels",
  "Lounge Access": "Accès aux salons",
  "General Hub": "Espace général",
  "Executive Networking Lounge": "Salon de réseautage Executive",
  "VIP & Speaker Ministerial Lounge": "Salon ministériel VIP et intervenants",
  "Post-Event Materials": "Documents post-événement",
  "Session Recordings": "Enregistrements des sessions",
  "Recordings + Executive Summaries": "Enregistrements + synthèses exécutives",
  "Full Access Suite + Strategic Briefs": "Accès complet + notes stratégiques",

  // Notice above the form
  "No payment required": "Aucun paiement requis",
  "Secure online payment": "Paiement en ligne sécurisé",
  "Payment not completed": "Paiement non finalisé",
  "Your registration was saved but the payment was not completed. Our team will contact you, or you can register again to pay now.":
    "Votre inscription a été enregistrée mais le paiement n'a pas été finalisé. Notre équipe vous contactera, ou vous pouvez vous réinscrire pour payer maintenant.",
  "{name} selected. After the last step you will be taken to Stripe's secure checkout to pay {price}.":
    "{name} sélectionné. Après la dernière étape, vous serez redirigé(e) vers la page de paiement sécurisée Stripe pour régler {price}.",
  "Continue to payment": "Continuer vers le paiement",
  "Your payment was received and your participation pass is confirmed. A confirmation email with your QR ticket is on its way to your email address.":
    "Votre paiement a été reçu et votre pass de participation est confirmé. Un e-mail de confirmation avec votre billet QR est en route vers votre adresse.",
  "{name} selected. Your access code covers this pass.":
    "{name} sélectionné. Votre code d'accès couvre ce pass.",
  "{name} selected. You can still reserve it now; our team will email you payment instructions. No payment will be taken online at this stage.":
    "{name} sélectionné. Vous pouvez dès maintenant le réserver ; notre équipe vous enverra les instructions de paiement par e-mail. Aucun paiement ne sera prélevé en ligne à ce stade.",
  "Change pass": "Changer de pass",
  Back: "Retour",
  Continue: "Continuer",
  "Complete registration": "Finaliser l'inscription",
  "Reserve my pass": "Réserver mon pass",
  "We could not complete your registration":
    "Nous n'avons pas pu finaliser votre inscription",
  "Please try again.": "Veuillez réessayer.",

  // Step 1
  "Personal & Professional Information":
    "Informations personnelles et professionnelles",
  "(optional)": "(facultatif)",
  Title: "Civilité",
  "No title": "Aucune civilité",
  "Other…": "Autre…",
  "Your title": "Votre civilité",
  "Type your title": "Saisissez votre civilité",
  "Full Name": "Nom complet",
  "First and last name": "Prénom et nom",
  "you@organization.com": "vous@organisation.com",
  "Business Email": "E-mail professionnel",
  "Job Title": "Fonction",
  "Organization / Company": "Organisation / Entreprise",
  "Country of Residence": "Pays de résidence",
  "Select a country": "Sélectionnez un pays",
  "LinkedIn Profile URL": "URL du profil LinkedIn",

  // Step 2
  "Participation Profile & Area of Interest":
    "Profil de participation et domaines d'intérêt",
  "Primary Interest Area (select all that apply)":
    "Domaine d'intérêt principal (sélectionnez tout ce qui s'applique)",
  "How do you wish to participate?": "Comment souhaitez-vous participer ?",
  "Primary Goal for Attending": "Objectif principal de votre participation",
  "Artificial Intelligence & Ethics": "Intelligence artificielle et éthique",
  "Digital Governance & Public Policy":
    "Gouvernance numérique et politiques publiques",
  "Startup Ecosystems & Venture Capital":
    "Écosystèmes de startups et capital-risque",
  "Media, Content Creation & Information Integrity":
    "Médias, création de contenu et intégrité de l'information",
  "Fintech & Digital Economy": "Fintech et économie numérique",
  "Infrastructure & Connectivity": "Infrastructures et connectivité",
  "Youth Empowerment & Digital Skills":
    "Autonomisation des jeunes et compétences numériques",
  Attendee: "Participant",
  "Potential Speaker / Thought Leader":
    "Intervenant potentiel / Leader d'opinion",
  "Sponsor / Partner": "Sponsor / Partenaire",
  "Exhibitor (Innovation Expo)": "Exposant (Innovation Expo)",
  "Media / Press": "Média / Presse",
  "Startup Founder (Pitch Competition)":
    "Fondateur de startup (Compétition de pitch)",
  "Networking with C-level executives and policymakers":
    "Réseauter avec des dirigeants et des décideurs politiques",
  "Securing investment for my startup":
    "Obtenir un financement pour ma startup",
  "Showcasing new technology or products":
    "Présenter de nouvelles technologies ou de nouveaux produits",
  "Influencing regional digital policy":
    "Influencer les politiques numériques régionales",
  "Learning about emerging trends in AI and digital transformation":
    "Découvrir les tendances émergentes en IA et en transformation numérique",

  // Step 3
  "Sponsorship Interest & Data Consent":
    "Intérêt pour le sponsoring et consentement aux données",
  "Would you like to receive information regarding specific partnership tiers?":
    "Souhaitez-vous recevoir des informations sur les formules de partenariat ?",
  "Yes, send me the Sponsorship Deck":
    "Oui, envoyez-moi la brochure de sponsoring",
  "I am interested in becoming a Knowledge/Media Partner":
    "Je suis intéressé(e) par un partenariat de savoir ou média",
  "Not at this time": "Pas pour le moment",
  "Data Consent:": "Consentement aux données :",
  "I agree to receive official communications from the Media and Digital Institute (MDI) regarding ADF and related initiatives.":
    "J'accepte de recevoir des communications officielles du Media and Digital Institute (MDI) concernant l'ADF et les initiatives associées.",
  "Terms Acceptance:": "Acceptation des conditions :",
  "I accept the Africa Digital Forum": "J'accepte la",
  "Privacy Policy": "Politique de confidentialité",
  and: "et les",
  "Event Terms of Use": "Conditions d'utilisation de l'événement",

  // Confirmation
  "Registration confirmed! Welcome to ADF.":
    "Inscription confirmée ! Bienvenue à l'ADF.",
  "Your pass is reserved!": "Votre pass est réservé !",
  "Thank you for registering for the Africa Digital Forum!":
    "Merci de vous être inscrit(e) au Africa Digital Forum !",
  "Your participation pass is confirmed, and no payment is required. A confirmation email has been sent to your email address.":
    "Votre pass de participation est confirmé et aucun paiement n'est requis. Un e-mail de confirmation a été envoyé à votre adresse.",
  "Your participation pass reservation is confirmed. No payment has been taken. Our team will email you payment instructions. A confirmation email has been sent to your email address.":
    "La réservation de votre pass de participation est confirmée. Aucun paiement n'a été prélevé. Notre équipe vous enverra les instructions de paiement par e-mail. Un e-mail de confirmation a été envoyé à votre adresse.",
  "Registration reference:": "Référence d'inscription :",
  "Next Steps": "Prochaines étapes",
  "Official Program:": "Programme officiel :",
  "The complete speaker schedule and breakout agenda will be published ahead of the event.":
    "Le programme complet des intervenants et l'agenda des sessions parallèles seront publiés avant l'événement.",
  "B2B Matchmaking:": "Mise en relation B2B :",
  "You will receive an invitation link to download the official ADF Networking Mobile App closer to the event date.":
    "Vous recevrez un lien d'invitation pour télécharger l'application mobile officielle de réseautage ADF à l'approche de l'événement.",
  "Inquiries:": "Renseignements :",
  "For assistance with any requests or administrative questions, please contact our secretariat at":
    "Pour toute demande ou question administrative, veuillez contacter notre secrétariat à l'adresse",

  // Validation messages (schema)
  "Please enter a valid URL (https://linkedin.com/in/...).":
    "Veuillez saisir une URL valide (https://linkedin.com/in/...).",
  "Please enter your full name.": "Veuillez saisir votre nom complet.",
  "Please enter your first and last name.":
    "Veuillez saisir votre prénom et votre nom.",
  "A valid email address is required.":
    "Une adresse e-mail valide est requise.",
  "Please enter your job title.": "Veuillez saisir votre fonction.",
  "Please enter your organization.": "Veuillez saisir votre organisation.",
  "Please select your country of residence.":
    "Veuillez sélectionner votre pays de résidence.",
  "Please select a pass.": "Veuillez sélectionner un pass.",
  "Please tell us how you wish to participate.":
    "Veuillez nous indiquer comment vous souhaitez participer.",
  "Please select your primary goal.":
    "Veuillez sélectionner votre objectif principal.",
  "Please select a partnership option.":
    "Veuillez sélectionner une option de partenariat.",
  "Consent is required to register.":
    "Le consentement est requis pour vous inscrire.",
  "Please accept the terms to continue.":
    "Veuillez accepter les conditions pour continuer.",
}

const FR_TITLES: Record<string, string> = {
  "Mr.": "M.",
  "Mrs.": "Mme",
  "Ms.": "Mme",
  Miss: "Mlle",
  "Dr.": "Dr",
  "Prof.": "Pr",
  "Eng.": "Ing.",
  "Hon.": "Hon.",
  "H.E.": "S.E.",
  "Amb.": "Amb.",
  "Rev.": "Rév.",
  Pastor: "Pasteur",
  Bishop: "Évêque",
  Imam: "Imam",
  Sheikh: "Cheikh",
  Chief: "Chef",
}

const FR_COUNTRIES: Record<string, string> = {
  Algeria: "Algérie",
  Angola: "Angola",
  Benin: "Bénin",
  Botswana: "Botswana",
  "Burkina Faso": "Burkina Faso",
  Burundi: "Burundi",
  "Cabo Verde": "Cabo Verde",
  Cameroon: "Cameroun",
  "Central African Republic": "République centrafricaine",
  Chad: "Tchad",
  Comoros: "Comores",
  "Congo (Republic of the)": "Congo (République du)",
  "Côte d'Ivoire": "Côte d'Ivoire",
  "Democratic Republic of the Congo": "République démocratique du Congo",
  Djibouti: "Djibouti",
  Egypt: "Égypte",
  "Equatorial Guinea": "Guinée équatoriale",
  Eritrea: "Érythrée",
  Eswatini: "Eswatini",
  Ethiopia: "Éthiopie",
  Gabon: "Gabon",
  Gambia: "Gambie",
  Ghana: "Ghana",
  Guinea: "Guinée",
  "Guinea-Bissau": "Guinée-Bissau",
  Kenya: "Kenya",
  Lesotho: "Lesotho",
  Liberia: "Libéria",
  Libya: "Libye",
  Madagascar: "Madagascar",
  Malawi: "Malawi",
  Mali: "Mali",
  Mauritania: "Mauritanie",
  Mauritius: "Maurice",
  Morocco: "Maroc",
  Mozambique: "Mozambique",
  Namibia: "Namibie",
  Niger: "Niger",
  Nigeria: "Nigéria",
  Rwanda: "Rwanda",
  "São Tomé and Príncipe": "Sao Tomé-et-Principe",
  Senegal: "Sénégal",
  Seychelles: "Seychelles",
  "Sierra Leone": "Sierra Leone",
  Somalia: "Somalie",
  "South Africa": "Afrique du Sud",
  "South Sudan": "Soudan du Sud",
  Sudan: "Soudan",
  Tanzania: "Tanzanie",
  Togo: "Togo",
  Tunisia: "Tunisie",
  Uganda: "Ouganda",
  Zambia: "Zambie",
  Zimbabwe: "Zimbabwe",
  International: "International",
}

const isFrench = () => getLocale() === "fr"

/** Translate a registration-form string; `{placeholders}` are filled from `vars`. */
export function tr(text: string, vars?: Record<string, string>): string {
  const translated = isFrench() ? (FR[text] ?? text) : text
  if (!vars) return translated
  return translated.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "")
}

export function trTitle(title: string): string {
  return isFrench() ? (FR_TITLES[title] ?? title) : title
}

export function trCountry(country: string): string {
  return isFrench() ? (FR_COUNTRIES[country] ?? country) : country
}

/** Locale-explicit lookups for server code (emails) outside a request locale. */
export function trFor(locale: "en" | "fr", text: string): string {
  return locale === "fr" ? (FR[text] ?? text) : text
}

export function trTitleFor(locale: "en" | "fr", title: string): string {
  return locale === "fr" ? (FR_TITLES[title] ?? title) : title
}
