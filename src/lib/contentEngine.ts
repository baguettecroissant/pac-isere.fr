// Programmatic Content Engine - Isère (38)
// Generates highly unique, localized, helpful content for each commune in Isère (38).
// Uses a multi-dimensional sentence-level spintax matrix to avoid Google duplicate content penalties
// and provides rich technical details (E-E-A-T) optimized for LLM search queries.

import { getNearbyCommunes } from './geoLinks';
import communes from '../data/communes.json';

export interface Commune {
  nom: string;
  slug: string;
  codeInsee: string;
  codePostal: string;
  population: number;
}

export interface LocalContent {
  introParagraph: string;
  logisticsAlert: string;
  useCaseText: string;
  pricesContext: string;
  faqItems: { question: string; answer: string }[];
  ecoText: string;
  localContext: string;
  climateZoneLabel: string;
  localAgencyName: string;
}

export type ClimateZone = 'plaine' | 'moyenne' | 'haute';

/**
 * Classifies Isère communes into 3 climate and altitude zones
 */
export function getClimateZone(codePostal: string): ClimateZone {
  const cp = codePostal.trim();
  
  // Haute Montagne (Oisans, Belledonne resorts, Vercors highlands, Matheysine)
  if (
    cp.startsWith('38750') || // Alpe d'Huez
    cp.startsWith('38860') || // Les Deux Alpes
    cp.startsWith('38114') || // Vaujany / Oz
    cp.startsWith('38520') || // Bourg-d'Oisans
    cp.startsWith('38350') || // La Mure / Matheysine
    cp.startsWith('38970') || // Corps / Valgaudemar
    cp.startsWith('38250')    // Villard-de-Lans / Lans-en-Vercors
  ) {
    return 'haute';
  }
  
  // Moyenne Altitude & Piémonts (Chartreuse, Belledonne foothills, Trièves, Terres Froides hills)
  if (
    cp.startsWith('38380') || // Chartreuse
    cp.startsWith('38190') || // Belledonne piémonts (Brignoud, Froges)
    cp.startsWith('38660') || // Touvet / Plateau des Petites Roches
    cp.startsWith('38410') || // Uriage / Chamrousse (bas)
    cp.startsWith('38300') || // Bourgoin-Jallieu
    cp.startsWith('38460') || // Crémieu
    cp.startsWith('38510') || // Morestel
    cp.startsWith('38260') || // La Côte-Saint-André
    cp.startsWith('38140') || // Apprieu / Rives
    cp.startsWith('38500') || // Voiron
    cp.startsWith('38590') || // St-Étienne-de-St-Geoirs
    cp.startsWith('38110') || // La Tour-du-Pin
    cp.startsWith('38690') || // Le Grand-Lemps
    cp.startsWith('38730') || // Virieu
    cp.startsWith('38620') || // Velanne
    cp.startsWith('38470') || // Vinay
    cp.startsWith('38450') || // Vif / Varces
    cp.startsWith('38650')    // Monestier-de-Clermont / Trièves
  ) {
    return 'moyenne';
  }
  
  // Plaine & Vallées (Grenoble metro, Grésivaudan valley, Vienne, Tullins, Rhône valley)
  return 'plaine';
}

/**
 * Returns the local advisory agency for energy transition based on the postcode
 */
export function getLocalAgency(codePostal: string): { name: string; detail: string; website: string } {
  const cp = codePostal.trim();
  const isGrenobleMetro = [
    '38000', '38100', '38130', '38170', '38180', '38220', '38320', '38360', '38400', '38600', '38610', '38800', '38950'
  ].some(prefix => cp.startsWith(prefix));

  if (isGrenobleMetro) {
    return {
      name: "l'ALEC Grenoble (Agence Locale de l'Énergie et du Climat)",
      detail: "les conseils de l'ALEC de la Métropole Grenobloise et le dispositif local Mur|Mur",
      website: "alec-grenoble.org"
    };
  } else {
    return {
      name: "l'AGEDEN (Association pour la gestion des énergies en Isère)",
      detail: "l'Espace Conseil France Rénov' de l'Isère animé par l'AGEDEN",
      website: "infoenergie38.org"
    };
  }
}

/**
 * Deterministic hashing based on the commune slug for robust combinatorial distribution
 */
export function getVariantIndex(slug: string, offset: number, maxVariants: number): number {
  let hash = offset * 31;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % maxVariants;
}

export function generateCommuneContent(
  commune: Commune,
  category: 'main' | 'air-eau' | 'air-air' | 'geothermie' | 'entretien' | 'depannage'
): LocalContent {
  const climateZone = getClimateZone(commune.codePostal);
  const agency = getLocalAgency(commune.codePostal);
  
  // Retrieve 3 nearby communes to inject into the text for geographic anchors
  const nearby = getNearbyCommunes(commune.slug, communes, 3);
  const nearbyNames = nearby.map(c => c.nom).join(', ');

  // Urban density coefficient: +12% for Grenoble, +6% for medium cities, standard for others
  const priceFactor = commune.population > 100000 ? 1.12 : commune.population > 30000 ? 1.06 : 1.0;
  
  const estimatedPrices = {
    airEau: Math.round(12800 * priceFactor),
    airAir: Math.round(6400 * priceFactor),
    geothermie: Math.round(22500 * priceFactor),
    entretien: Math.round(180 * priceFactor),
    depannage: Math.round(160 * priceFactor)
  };

  const zoneLabels = {
    plaine: "Plaine & Vallées de l'Isère",
    moyenne: "Moyenne Altitude & Piémonts de l'Isère",
    haute: "Haute Montagne Alpine de l'Isère"
  };

  // ==========================================
  // MULTI-DIMENSIONAL SPINTAX MATRIX
  // ==========================================

  // --- 1. LOCAL CONTEXT PARAGRAPH (Unique Combination) ---
  const lc1 = [
    `Située dans le secteur géographique ${zoneLabels[climateZone]} sous le code postal ${commune.codePostal}, la commune de ${commune.nom} bénéficie d'une couverture technique complète de notre réseau de poseurs de pompes à chaleur RGE.`,
    `Avec son climat caractéristique de la zone de ${commune.nom} (${commune.codePostal}) dans le département de l'Isère (38), l'installation d'un chauffage thermodynamique performant permet aux ${commune.population?.toLocaleString('fr-FR') || 'nombreux'} habitants de réduire durablement leurs charges énergétiques.`,
    `Pour les habitations individuelles situées à ${commune.nom} (${commune.codePostal}), nos chauffagistes QualiPAC réalisent un audit thermique préalable indispensable pour adapter le choix de la PAC au climat de l'Isère.`,
    `Le secteur de ${commune.nom} (${commune.codePostal}) fait partie des zones prioritaires d'intervention de nos techniciens de chauffage en Isère (38), assurant des installations thermodynamiques réactives et conformes.`
  ];

  const lc2 = [
    `Nos équipes spécialisées interviennent également de manière régulière dans les communes limitrophes telles que ${nearbyNames} pour la mise en place de pompes à chaleur Air-Eau et de climatisations réversibles.`,
    `Nous gérons la pose et la maintenance d'équipements de chauffage écologique dans tout le bassin local, y compris pour les résidents des localités voisines comme ${nearbyNames}.`,
    `Notre rayon d'intervention couvre l'intégralité du territoire de ${commune.nom} ainsi que les communes environnantes de ${nearbyNames}, garantissant un service de proximité de qualité.`
  ];

  const lc3 = [
    `Pour un accompagnement administratif personnalisé et neutre, nous recommandons de solliciter ${agency.name} (accessible sur le site ${agency.website}) afin d'optimiser l'obtention des primes de transition.`,
    `Il est fortement recommandé d'étudier l'éligibilité de votre foyer aux aides locales en vous rapprochant de ${agency.detail}.`,
    `Les dossiers de subventions pour la pose de PAC peuvent être instruits en collaboration avec ${agency.name}, garantissant un dossier complet avant signature.`
  ];

  const localContext = [
    lc1[getVariantIndex(commune.slug, 10, lc1.length)],
    lc2[getVariantIndex(commune.slug, 11, lc2.length)],
    lc3[getVariantIndex(commune.slug, 12, lc3.length)]
  ].join(' ');


  // --- 2. INTRODUCTORY PARAGRAPHS BY CATEGORY AND CLIMATE ZONE ---
  const intros: Record<string, Record<ClimateZone, { s1: string[]; s2: string[]; s3: string[] }>> = {
    main: {
      plaine: {
        s1: [
          `Face aux étés de plus en plus chauds constatés dans la plaine de l'Isère et aux hivers requérant un chauffage constant, installer une pompe à chaleur à ${commune.nom} s'avère être le choix le plus pertinent.`,
          `Les habitations situées à ${commune.nom} nécessitent un système de régulation thermique polyvalent, capable de gérer les pics de chaleur estivaux et les rigueurs hivernales de la vallée.`,
          `Optimiser le confort de sa maison à ${commune.nom} passe aujourd'hui par l'adoption d'un système de chauffage thermodynamique de dernière génération.`
        ],
        s2: [
          `La pompe à chaleur (PAC) capte les calories gratuites présentes dans l'air extérieur pour les restituer sous forme de chaleur en hiver, ou d'air frais en été s'il s'agit d'un modèle Air-Air réversible.`,
          `Grâce à l'usage de fluides écologiques avancés comme le R290 (propane à très bas bilan carbone), nos PAC Air-Eau offrent un rendement exceptionnel tout en respectant l'environnement.`,
          `Cet équipement performant présente un Coefficient de Performance (COP) moyen de 4.2, ce qui signifie que le système produit 4 fois plus d'énergie thermique qu'il n'en consomme en électricité.`
        ],
        s3: [
          `Nos installateurs qualifiés RGE QualiPAC sur le secteur de ${commune.nom} vous proposent une étude thermique personnalisée pour dimensionner idéalement votre futur chauffage.`,
          `Bénéficiez de l'accompagnement de nos techniciens certifiés en Isère pour comparer gratuitement jusqu'à 3 propositions adaptées à votre budget.`,
          `Faites appel à notre réseau de chauffagistes RGE de confiance pour sécuriser l'obtention de vos aides financières de l'État.`
        ]
      },
      moyenne: {
        s1: [
          `Dans les secteurs de piémonts de l'Isère, le climat caractérisé par des gelées hivernales fréquentes à ${commune.nom} impose d'opter pour un chauffage particulièrement robuste.`,
          `Les habitations de moyenne altitude situées à ${commune.nom} requièrent une pompe à chaleur performante, capable de maintenir sa puissance nominale lors des baisses de températures sous le zéro.`,
          `L'installation d'une PAC à ${commune.nom} représente une solution de transition énergétique idéale pour valoriser son bien immobilier dans le Dauphiné.`
        ],
        s2: [
          `Nos modèles de pompes à chaleur intègrent des compresseurs Inverter spécialement conçus pour les climats froids, évitant l'usure mécanique et limitant le recours à l'appoint électrique.`,
          `Pour le réseau hydraulique de radiateurs existants, la PAC haute température permet de remplacer directement une ancienne chaudière fioul sans modifier vos émetteurs.`,
          `Le captage aérothermique est optimisé par l'usage de technologies de dégivrage rapide, évitant la formation de glace sur l'échangeur extérieur.`
        ],
        s3: [
          `Nos techniciens certifiés RGE QualiPAC à ${commune.nom} se déplacent pour effectuer un calcul précis des déperditions thermiques de votre logement.`,
          `Prenez contact avec nos professionnels qualifiés pour concevoir une installation thermodynamique parfaitement calibrée pour le climat de moyenne montagne.`,
          `Nous vous fournissons des devis complets incluant l'avance de MaPrimeRénov' et des primes CEE pour un reste à charge minimal.`
        ]
      },
      haute: {
        s1: [
          `Avec les rigueurs climatiques extrêmes et l'enneigement prolongé qui caractérisent les massifs alpins à ${commune.nom}, installer une pompe à chaleur requiert une expertise technique spécifique à la haute montagne.`,
          `À ${commune.nom}, le chauffage représente le principal poste de dépenses des foyers en hiver, rendant indispensable la pose d'une pompe à chaleur à très haute performance.`,
          `La transition énergétique en haute altitude à ${commune.nom} s'appuie sur des solutions thermodynamiques éprouvées contre le gel et les froids intenses.`
        ],
        s2: [
          `Nous préconisons l'usage de pompes à chaleur de technologie grand froid (compresseurs renforcés maintenant la puissance nominale jusqu'à -15°C) ou de systèmes géothermiques verticaux stables.`,
          `L'installation extérieure à ${commune.nom} intègre des dispositifs anti-givre rigoureux, tels que des supports de rehausse et des cordons chauffants autorégulants pour sécuriser l'évacuation des condensats.`,
          `La géothermie de sol (PAC Sol-Eau) est particulièrement recommandée dans cette zone, car la température terrestre y reste constante contrairement à l'air ambiant alpin.`
        ],
        s3: [
          `Faites appel à nos artisans spécialisés montagne dans l'Isère pour étudier la faisabilité technique de votre projet thermodynamique.`,
          `Nos installateurs gèrent les déclarations de forage en mairie et auprès de la DREAL pour vos projets de géothermie à ${commune.nom}.`,
          `Bénéficiez d'une étude thermique de montagne gratuite pour calibrer de manière optimale votre appoint électrique hybride.`
        ]
      }
    },
    'air-eau': {
      plaine: {
        s1: [
          `La pompe à chaleur Air-Eau hydraulique s'impose comme le choix de référence pour remplacer une chaudière à gaz ou au fioul à ${commune.nom}.`,
          `Chauffer sa maison et produire son eau chaude à ${commune.nom} devient économique et durable grâce à la technologie des PAC aérothermiques Air-Eau.`,
          `Pour équiper un réseau de chauffage central existant à ${commune.nom}, le système Air-Eau offre le meilleur compromis de confort et d'économies.`
        ],
        s2: [
          `Ce dispositif se connecte sur vos radiateurs à eau ou votre plancher chauffant, en assurant également la production d'eau chaude sanitaire.`,
          `En utilisant le fluide R290 (propane), ces pompes à chaleur garantissent une température de départ d'eau élevée tout en préservant l'environnement.`,
          `Le COP élevé des PAC Air-Eau en plaine permet de réduire de plus de 70% les consommations par rapport à une chaudière classique.`
        ],
        s3: [
          `Nos installateurs partenaires à ${commune.nom} conçoivent votre installation hydraulique dans le respect des normes QualiPAC et DTU.`,
          `Demandez une simulation gratuite des aides de l'Anah et des CEE pour le remplacement de votre chaudière en Isère.`,
          `Nos professionnels RGE de la région de ${commune.nom} réalisent le désembouage préalable de vos radiateurs pour maximiser l'efficacité de la PAC.`
        ]
      },
      moyenne: {
        s1: [
          `Pour faire face aux baisses de température fréquentes à ${commune.nom}, la pompe à chaleur Air-Eau doit faire l'objet d'une installation rigoureuse.`,
          `L'installation d'une PAC Air-Eau en moyenne altitude à ${commune.nom} est idéale pour décarboner son chauffage central tout en réduisant ses factures.`,
          `Remplacer sa chaudière fioul par une pompe à chaleur Air-Eau à ${commune.nom} permet de sécuriser un confort thermique homogène en piémont.`
        ],
        s2: [
          `Les appareils installés en Isère intègrent des échangeurs thermiques surdimensionnés pour optimiser le captage des calories dans l'air froid.`,
          `La régulation électronique intelligente permet de moduler la température de l'eau en fonction des conditions climatiques extérieures de ${commune.nom}.`,
          `L'usage d'une PAC Air-Eau moyenne ou haute température évite d'avoir à remplacer vos radiateurs traditionnels existants.`
        ],
        s3: [
          `Faites appel à nos chauffagistes QualiPAC actifs sur ${commune.nom} pour une intégration soignée conforme aux règles d'émergence sonore.`,
          `Nos professionnels RGE prennent en charge l'ensemble des démarches pour obtenir l'avance de vos subventions gouvernementales.`,
          `Bénéficiez d'un devis gratuit pour la pose d'une pompe à chaleur Air-Eau de grande marque (Atlantic, Mitsubishi, Daikin).`
        ]
      },
      haute: {
        s1: [
          `En altitude à ${commune.nom}, la pose d'une pompe à chaleur Air-Eau exige d'utiliser du matériel labellisé grand froid capable de supporter des températures de -20°C.`,
          `Les chalets et habitations alpines de ${commune.nom} tirent profit de la PAC Air-Eau haute température pour alimenter efficacement des circuits hydrauliques exigeants.`,
          `La rigueur du climat de montagne à ${commune.nom} nécessite un calibrage thermique d'exception pour sécuriser le fonctionnement de la PAC Air-Eau.`
        ],
        s2: [
          `L'unité extérieure est installée sur un support mural ou un socle béton surélevé pour la protéger de l'accumulation de neige au sol.`,
          `Nous intégrons des systèmes d'appoint hybrides ou des résistances électriques étagées pour suppléer la PAC lors des froids extrêmes en Isère.`,
          `L'isolation thermique des liaisons cuivre extérieures est renforcée par des manchons haut de gamme résistants au gel et aux UV.`
        ],
        s3: [
          `Nos installateurs qualifiés RGE montagne à ${commune.nom} vous accompagnent pour garantir la pérennité et la conformité de votre installation.`,
          `Contactez nos experts locaux pour simuler le cumul des aides nationales et des aides de la Région Auvergne-Rhône-Alpes.`,
          `Demandez une étude thermique de déperdition spécifique aux altitudes pour configurer idéalement votre PAC.`
        ]
      }
    },
    'air-air': {
      plaine: {
        s1: [
          `La climatisation réversible (PAC Air-Air) est le système le plus plébiscité par les résidents de ${commune.nom} pour affronter les fortes chaleurs d'été.`,
          `À ${commune.nom}, s'équiper d'une pompe à chaleur Air-Air permet de concilier confort thermique estival et chauffage économique en hiver.`,
          `Pour remplacer des convecteurs électriques énergivores dans la vallée à ${commune.nom}, la PAC Air-Air s'impose comme la solution idéale.`
        ],
        s2: [
          `Ce système thermodynamique diffuse l'air chaud ou froid via des unités intérieures murales (splits), des consoles au sol ou un réseau gainable invisible.`,
          `Grâce aux technologies Inverter et aux filtres purificateurs d'air avancés, elle assure un air sain et une régulation de température au degré près.`,
          `Pour 1 kWh d'électricité consommé, la climatisation réversible restitue jusqu'à 4 kWh de puissance frigorifique ou calorifique.`
        ],
        s3: [
          `Nos frigoristes QualiClim basés à ${commune.nom} réalisent une étude d'implantation discrète respectant la décoration de votre intérieur.`,
          `Obtenez des devis personnalisés pour l'installation d'un système multi-splits dans vos chambres et pièces de vie.`,
          `Faites évaluer votre éligibilité aux primes CEE pour l'installation de votre PAC Air-Air en Isère.`
        ]
      },
      moyenne: {
        s1: [
          `L'installation d'une climatisation réversible à ${commune.nom} permet de réguler la température de son logement lors des intersaisons et des hivers de piémont.`,
          `À ${commune.nom}, la PAC Air-Air constitue une excellente solution de chauffage réactive pour les maisons chauffées par électricité.`,
          `Chauffer et climatiser son logement à ${commune.nom} devient simple et rapide grâce aux pompes à chaleur Air-Air multi-splits.`
        ],
        s2: [
          `Les unités extérieures installées en Isère sont traitées contre la corrosion et équipées de compresseurs capables de fonctionner par basses températures.`,
          `L'implantation des splits intérieurs est étudiée pour éviter tout courant d'air direct vers les occupants tout en assurant une diffusion homogène.`,
          `Cette technologie réactive permet d'élever la température d'une pièce en seulement quelques minutes après le démarrage.`
        ],
        s3: [
          `Nos professionnels RGE à ${commune.nom} se déplacent pour concevoir un réseau gainable ou multi-splits sur-mesure pour votre maison.`,
          `Demandez une étude thermique gratuite de vos pièces pour choisir la puissance et le nombre de consoles requis.`,
          `Bénéficiez de garanties fabricant étendues (jusqu'à 5 ans) en passant par notre réseau d'installateurs agréés en Isère.`
        ]
      },
      haute: {
        s1: [
          `En altitude à ${commune.nom}, la pompe à chaleur Air-Air est principalement utilisée comme chauffage réactif en complément d'un poêle à bois ou de radiateurs.`,
          `Pour chauffer rapidement les pièces d'un chalet ou d'une résidence secondaire à ${commune.nom}, la climatisation réversible est une solution très appréciée.`,
          `Le climat rigoureux de montagne à ${commune.nom} implique de sélectionner des pompes à chaleur Air-Air de technologie haut de gamme.`
        ],
        s2: [
          `L'unité extérieure doit être protégée des chutes de neige de toit par un auvent et surélevée pour éviter tout blocage de l'hélice par le givre.`,
          `Les performances calorifiques de nos modèles montagne sont garanties jusqu'à des températures extérieures extrêmes de -20°C.`,
          `Le système permet d'assurer une mise hors-gel automatique et économique de l'habitation lors de vos absences prolongées.`
        ],
        s3: [
          `Faites appel à nos techniciens RGE montagne à ${commune.nom} pour une installation de PAC Air-Air fiable et conforme aux contraintes locales.`,
          `Comparez jusqu'à 3 offres détaillées de professionnels de l'Isère spécialisés dans le chauffage thermodynamique de montagne.`,
          `Bénéficiez de conseils d'experts sur le positionnement de votre module extérieur par rapport aux vents dominants.`
        ]
      }
    },
    geothermie: {
      plaine: {
        s1: [
          `La pompe à chaleur géothermique (Sol-Eau ou Eau-Eau) représente la solution de chauffage la plus performante et stable à ${commune.nom}.`,
          `Profiter de la chaleur de la terre à ${commune.nom} est possible en installant un système géothermique avec capteurs horizontaux ou sondes verticales.`,
          `Pour les grands terrains ou les projets d'exception à ${commune.nom}, la géothermie offre des performances thermiques inégalées.`
        ],
        s2: [
          `Ce système puise l'énergie constante du sol, ce qui garantit un coefficient de performance (COP) supérieur à 4.5 sans fluctuations saisonnières.`,
          `Il permet également de bénéficier du passive cooling (geocooling) pour rafraîchir le plancher en été pour une consommation électrique quasi nulle.`,
          `La longévité d'une PAC géothermique est exceptionnelle, l'unité intérieure étant protégée et les capteurs enterrés garantis plus de 40 ans.`
        ],
        s3: [
          `Nos ingénieurs et chauffagistes RGE à ${commune.nom} gèrent l'intégralité des études géologiques et déclarations de forage en mairie.`,
          `Bénéficiez des aides maximales de l'Anah pour financer votre projet de géothermie en Isère en comparant nos offres locales.`,
          `Demandez une étude de faisabilité gratuite sur votre terrain à ${commune.nom} pour évaluer la surface de captage requise.`
        ]
      },
      moyenne: {
        s1: [
          `Dans les collines et piémonts de l'Isère, le sol de ${commune.nom} conserve une température constante idéale pour l'installation d'une PAC géothermique.`,
          `La géothermie à ${commune.nom} s'impose comme la solution de chauffage la plus stable pour faire face aux hivers prolongés sans appoint électrique.`,
          `Investir dans la géothermie à ${commune.nom} assure une indépendance énergétique totale et un excellent DPE pour votre propriété.`
        ],
        s2: [
          `Les capteurs enterrés sous la surface ou les sondes verticales captent la chaleur terrestre pour chauffer en direct votre circuit hydraulique.`,
          `Contrairement à l'aérothermie, les performances de la géothermie à ${commune.nom} restent totalement insensibles au gel et aux variations d'air extérieur.`,
          `La technologie permet également de produire l'eau chaude sanitaire avec un rendement optimal même par grand froid.`
        ],
        s3: [
          `Nos installateurs spécialisés RGE en géothermie à ${commune.nom} vous guident de l'étude géotechnique initiale à la mise en service finale.`,
          `Estimez le montant de vos subventions gouvernementales et simulez votre reste à charge pour votre projet en Isère.`,
          `Contactez notre réseau de professionnels pour planifier une visite technique d'évaluation de votre parcelle.`
        ]
      },
      haute: {
        s1: [
          `En haute montagne à ${commune.nom}, la géothermie verticale est la solution de chauffage d'exception par excellence en raison des climats rigoureux.`,
          `Pour s'affranchir des contraintes du gel de l'air en altitude, l'installation d'une PAC géothermique à ${commune.nom} offre une fiabilité absolue.`,
          `Le captage de la chaleur terrestre à ${commune.nom} garantit un chauffage d'une grande performance lors des hivers alpins.`
        ],
        s2: [
          `Les forages verticaux profonds puisent l'énergie dans la roche où les températures restent stables entre 10°C et 12°C toute l'année.`,
          `Cette technologie élimine le besoin d'un groupe extérieur de ventilation, évitant tout impact sonore et préservant l'esthétique des chalets de montagne.`,
          `Le système assure un chauffage optimal sans risque de givrage de l'appareil ni baisse de rendement, même par -20°C extérieur.`
        ],
        s3: [
          `Nos entreprises RGE QualiPAC spécialisées en géothermie en Isère s'occupent des demandes administratives auprès de la DREAL.`,
          `Profitez d'un audit de faisabilité complet et gratuit de votre projet de chauffage terrestre en altitude à ${commune.nom}.`,
          `Comparez nos propositions d'installations géothermiques haut de gamme adaptées aux exigences de la haute montagne.`
        ]
      }
    },
    entretien: {
      plaine: {
        s1: [
          `Réaliser l'entretien de sa pompe à chaleur à ${commune.nom} est une étape indispensable pour garantir la pérennité de son installation.`,
          `À ${commune.nom}, un suivi régulier de votre PAC permet de préserver son coefficient de performance (COP) d'origine et de réduire la consommation.`,
          `La maintenance périodique de votre système de climatisation réversible à ${commune.nom} évite les surconsommations d'énergie en été.`
        ],
        s2: [
          `Pour rappel, un contrôle d'étanchéité réglementaire est obligatoire au moins tous les deux ans pour les équipements contenant du fluide frigorigène.`,
          `La visite comprend le nettoyage des filtres, la désinfection des échangeurs thermiques et le contrôle de charge du gaz frigorifique.`,
          `Ce suivi préventif permet d'identifier l'usure de pièces mécaniques sensibles avant qu'elles ne provoquent une panne totale.`
        ],
        s3: [
          `Nos chauffagistes locaux basés à ${commune.nom} proposent des contrats de maintenance forfaitaires annuels sans engagement.`,
          `Prenez rendez-vous avec un technicien habilité fluides pour valider l'attestation d'entretien obligatoire exigée par les assurances.`,
          `Confiez la révision de votre pompe à chaleur à un artisan RGE QualiPAC actif dans l'Isère.`
        ]
      },
      moyenne: {
        s1: [
          `Avant le début de la saison de chauffe à ${commune.nom}, faire entretenir sa pompe à chaleur est fortement recommandé pour s'assurer un hiver serein.`,
          `À ${commune.nom}, l'entretien préventif de votre chauffage thermodynamique permet de se prémunir contre les pannes soudaines dues au gel.`,
          `Un entretien régulier de votre équipement de chauffage en Isère assure la sécurité des raccordements électriques et frigorifiques.`
        ],
        s2: [
          `Nos techniciens contrôlent minutieusement les cycles de dégivrage automatique et s'assurent que l'unité extérieure n'est pas obstruée.`,
          `Le nettoyage approfondi des grilles de ventilation extérieure garantit une aspiration d'air fluide, limitant le travail forcé du compresseur Inverter.`,
          `Nous effectuons également la vérification de la pression du circuit d'eau et purgons les boues si nécessaire.`
        ],
        s3: [
          `Planifiez la révision réglementaire de votre PAC à ${commune.nom} en comparant nos forfaits d'entretien locaux.`,
          `Nos professionnels qualifiés interviennent sur toutes les marques majeures de pompes à chaleur (Atlantic, Daikin, Mitsubishi).`,
          `Bénéficiez d'une attestation de conformité en fin de visite pour garantir la validité de vos contrats de garantie fabricant.`
        ]
      },
      haute: {
        s1: [
          `En altitude à ${commune.nom}, l'usure d'une pompe à chaleur est accélérée par les conditions extrêmes de froid et d'humidité hivernales.`,
          `La maintenance d'une PAC en haute montagne à ${commune.nom} exige des contrôles spécifiques pour prévenir le blocage de l'unité par le gel.`,
          `Confier la révision de son chauffage alpin à ${commune.nom} à un technicien qualifié RGE est le meilleur moyen d'assurer un hiver chaud.`
        ],
        s2: [
          `Nous vérifions le bon fonctionnement du cordon chauffant de condensats et testons la résistance électrique d'appoint d'urgence.`,
          `Les supports muraux et l'auvent pare-neige sont inspectés pour s'assurer que l'appareil reste parfaitement sécurisé et dégagé.`,
          `Le fluide frigorigène fait l'objet d'une recherche de fuite par détection électronique avancée, obligatoire pour les altitudes de l'Isère.`
        ],
        s3: [
          `Faites appel à nos dépanneurs et mainteneurs spécialisés montagne dans l'Isère pour planifier votre révision réglementaire.`,
          `Nos forfaits incluent le déplacement en altitude sur le secteur de ${commune.nom} et la remise de l'attestation obligatoire.`,
          `Sécurisez votre hiver en chalet avec un contrat d'entretien préventif complet et réactif.`
        ]
      }
    },
    depannage: {
      plaine: {
        s1: [
          `Une panne de chauffage à ${commune.nom} requiert l'intervention rapide d'un technicien qualifié en pompes à chaleur.`,
          `En cas de dysfonctionnement sur votre climatisation réversible ou votre PAC à ${commune.nom}, nos dépanneurs se déplacent sous 24/48h.`,
          `Ne restez pas sans chauffage dans la plaine de l'Isère grâce à notre service de dépannage d'urgence sur les équipements thermodynamiques.`
        ],
        s2: [
          `Nos spécialistes analysent les codes pannes, vérifient le circuit électrique et diagnostiquent la cause de la mise en sécurité de la PAC.`,
          `Qu'il s'agisse d'une perte de pression de fluide, d'un défaut de circulateur ou d'une carte électronique HS, nous réparons selon les normes.`,
          `Nos véhicules d'intervention en Isère contiennent un stock de pièces d'origine courantes pour dépanner lors de la première visite.`
        ],
        s3: [
          `Contactez notre plateforme d'assistance locale à ${commune.nom} pour obtenir une intervention rapide d'un frigoriste certifié.`,
          `Bénéficiez d'un tarif transparent avec devis détaillé présenté avant tout remplacement de pièce sur votre PAC.`,
          `Faites réparer votre chauffage en toute confiance par un dépanneur agréé RGE intervenant sur ${commune.nom}.`
        ]
      },
      moyenne: {
        s1: [
          `Le gel ou une chute de tension à ${commune.nom} peut mettre votre pompe à chaleur en sécurité au moment le plus froid de l'année.`,
          `Nos techniciens de dépannage interviennent rapidement à ${commune.nom} pour remettre en route votre installation de chauffage en panne.`,
          `Bénéficiez d'un diagnostic thermique d'urgence sur votre PAC en panne dans le secteur de ${commune.nom}.`
        ],
        s2: [
          `Nous intervenons pour les problèmes de givrage persistant de l'unité extérieure, les fuites hydrauliques et les dysfonctionnements de compresseur.`,
          `Nos dépanneurs possèdent l'attestation de capacité pour manipuler les fluides frigorigènes et recharger votre circuit après réparation de fuite.`,
          `La vérification des organes de sécurité (vannes, détendeur, sondes) garantit une remise en route sûre et performante.`
        ],
        s3: [
          `Planifiez une intervention d'urgence à ${commune.nom} en prenant contact avec nos techniciens de proximité en Isère.`,
          `Nos devis de réparation intègrent des pièces d'origine certifiées garanties par les fabricants majeurs (Daikin, Atlantic, Mitsubishi).`,
          `Faites confiance à un réparateur local QualiPAC pour sécuriser votre installation de chauffage.`
        ]
      },
      haute: {
        s1: [
          `En haute montagne à ${commune.nom}, une panne de PAC par -15°C extérieur met en danger le gel des canalisations et nécessite une intervention immédiate.`,
          `Nos dépanneurs spécialisés montagne se déplacent en urgence à ${commune.nom} pour secourir votre système de chauffage de chalet.`,
          `L'assistance rapide sur pompe à chaleur en altitude à ${commune.nom} est assurée par nos frigoristes habilités de l'Isère.`
        ],
        s2: [
          `Nous débloquons les ventilateurs pris par le givre, réparons les cordons chauffants HS et configurons l'appoint électrique d'urgence.`,
          `Le diagnostic prend en compte les contraintes spécifiques des altitudes alpins (vagues de gel, surtensions de réseau, fortes humidités).`,
          `Nous nous assurons que le mode de chauffage hybride ou d'appoint prend le relais pour maintenir la maison hors-gel.`
        ],
        s3: [
          `Appelez nos équipes mobiles d'altitude basées en Isère pour un dépannage prioritaire sur votre PAC à ${commune.nom}.`,
          `Nos tarifs sont clairs et adaptés aux contraintes d'accès géographiques des massifs alpins de l'Isère.`,
          `Bénéficiez de la réactivité d'artisans habitués aux interventions d'urgence dans les stations de montagne.`
        ]
      }
    }
  };

  const currentIntro = intros[category][climateZone];
  const introParagraph = [
    currentIntro.s1[getVariantIndex(commune.slug, 0, currentIntro.s1.length)],
    currentIntro.s2[getVariantIndex(commune.slug, 1, currentIntro.s2.length)],
    currentIntro.s3[getVariantIndex(commune.slug, 2, currentIntro.s3.length)]
  ].join(' ');


  // --- 3. DYNAMIC USE CASES (Unique Combinations) ---
  const useCases: Record<string, string[]> = {
    main: [
      `réaliser une rénovation énergétique globale et remplacer une chaudière fioul ou gaz obsolète.`,
      `diviser vos dépenses de chauffage par 3 grâce à l'utilisation des calories gratuites de l'air ou du sol.`,
      `profiter d'une solution de chauffage écologique éligible aux aides de l'Anah et des CEE.`,
      `assurer le confort thermique de votre foyer avec une chaleur douce en hiver et un rafraîchissement agréable en été.`,
      `valoriser durablement votre patrimoine immobilier en améliorant le Diagnostic de Performance Énergétique (DPE) de votre logement à ${commune.nom}.`
    ],
    'air-eau': [
      `s'adapter parfaitement à vos radiateurs existants (haute ou basse température) sans modifier votre réseau hydraulique intérieur.`,
      `produire à la fois le chauffage central de votre maison et l'eau chaude sanitaire de toute la famille de façon écologique.`,
      `obtenir le meilleur rendement énergétique possible par grand froid dans le département de l'Isère.`,
      `remplacer une chaudière fioul polluante tout en profitant des subventions de l'Anah allant jusqu'à 9 000 € à ${commune.nom}.`
    ],
    'air-air': [
      `climatiser efficacement vos pièces de vie en été et assurer le chauffage principal ou d'appoint en hiver.`,
      `remplacer d'anciens radiateurs électriques énergivores par des diffuseurs d'air chaud/froid très économiques.`,
      `réguler la température de chaque chambre de manière autonome grâce aux télécommandes individuelles (multi-splits).`,
      `diminuer vos factures de chauffage électrique par 4 grâce aux performances technologiques Inverter adaptées à ${commune.nom}.`
    ],
    geothermie: [
      `puiser les calories constantes de la terre pour un chauffage extrêmement stable, indépendant des gelées hivernales de l'Isère.`,
      `limiter l'impact visuel et acoustique sur votre propriété grâce à l'absence de module de ventilation extérieur.`,
      `bénéficier du système de chauffage thermodynamique le plus performant et le plus écologique du marché à ${commune.nom}.`,
      `profiter du geocooling passif pour rafraîchir le plancher de la maison en été pour un coût électrique presque nul.`
    ],
    entretien: [
      `sécuriser le fonctionnement de votre pompe à chaleur à ${commune.nom} et prévenir les pannes hivernales coûteuses.`,
      `respecter l'obligation légale de contrôle d'étanchéité des circuits contenant du fluide frigorigène fluoré ou propane.`,
      `maintenir le rendement (COP) d'origine de votre équipement pour éviter toute surconsommation électrique en Isère.`,
      `obtenir l'attestation d'entretien annuelle obligatoire exigée par votre assureur habitation pour votre PAC.`
    ],
    depannage: [
      `récupérer rapidement votre chauffage à ${commune.nom} en cas de panne totale ou de mise en sécurité de votre pompe à chaleur.`,
      `diagnostiquer précisément les codes d'erreur et identifier l'origine de la défaillance (frigorifique ou électrique).`,
      `rechercher et réparer les fuites de fluide frigorigène pour restaurer les performances thermiques de votre PAC en Isère.`,
      `bénéficier d'une intervention rapide de chauffagistes de l'Isère équipés de pièces détachées courantes.`
    ]
  };

  const useCaseText = useCases[category][getVariantIndex(commune.slug, 3, useCases[category].length)];


  // --- 4. DYNAMIC LOGISTICS & CLIMATE ADVICE BY ZONE (E-E-A-T) ---
  const logistics: Record<ClimateZone, string[]> = {
    plaine: [
      `Dans les plaines et zones urbanisées de l'Isère, l'acoustique est un point de vigilance réglementaire majeur. Nos poseurs à ${commune.nom} installent systématiquement des plots anti-vibrations sous le socle extérieur. Nous veillons à orienter le flux de ventilation pour respecter la législation sur les bruits de voisinage, qui limite l'émergence sonore à 5 dB(A) le jour et 3 dB(A) la nuit par rapport au bruit ambiant.`,
      `Le climat de la cuve de ${commune.nom} se caractérisant par des étés étouffants et des intersaisons humides, nos experts préconisent la technologie de climatisation réversible Air-Air multi-splits. Une déclaration préalable de travaux (DP) en mairie est obligatoire pour valider l'aspect visuel de l'unité extérieure sur votre façade.`,
      `Pour les installations en milieu urbain dense autour de ${commune.nom}, la gestion des condensats ne doit pas se faire sur la voie publique. Nous concevons un réseau d'évacuation vers les eaux pluviales avec siphon hors-gel pour éviter la formation de plaques de verglas en hiver sur vos accès.`
    ],
    moyenne: [
      `En moyenne montagne à ${commune.nom}, l'humidité de l'air favorise la formation de givre sur l'évaporateur extérieur de la PAC en hiver. Nos chauffagistes installent les unités sur des consoles surélevées d'au moins 30 cm par rapport au sol et intègrent un auvent pare-neige pour éviter que les chutes de neige directes ne bloquent la grille d'insufflation.`,
      `Le climat continental de la région de ${commune.nom} impose un dimensionnement rigoureux de l'appareil. Nous réalisons un bilan thermique précis (DTU 65.16) pour déterminer la puissance nécessaire par -7°C et calibrer l'appoint de chauffage pour éviter que la pompe à chaleur ne tourne en continu, ce qui réduirait sa durée de vie.`,
      `À ${commune.nom}, l'évacuation des condensats issus du dégivrage automatique de la PAC peut geler instantanément. Nos installateurs intègrent un cordon chauffant électrique autorégulant de 15W/m à l'intérieur de la gaine de vidange pour garantir l'écoulement des eaux même lors des gelées prolongées en Isère.`
    ],
    haute: [
      `Dans les zones alpines de haute montagne à ${commune.nom}, le froid intense et l'accumulation de neige au sol (pouvant dépasser 1 mètre) exigent des précautions extrêmes. L'unité extérieure de la PAC Air-Eau doit être fixée sur un support mural ou sur un châssis métallique surélevé à hauteur d'homme, à l'écart des zones de glissement de neige du toit.`,
      `Le climat alpin extrême à ${commune.nom} rend les PAC Air-Eau standard inefficaces en hiver. Nous installons exclusivement des modèles de PAC 'Spécial Montagne' ou à technologie d'injection de gaz chaud (Zubadan), capables de fournir de l'eau à 60°C par -15°C extérieur sans baisse de puissance nominale. La géothermie sur sondes verticales reste la solution reine dans cette zone.`,
      `À ${commune.nom}, le risque de gel du réseau hydraulique extérieur en cas de coupure d'électricité prolongée est réel. Nos techniciens intègrent des vannes de décharge thermique (vannes antigel) qui vidangent automatiquement le circuit de la PAC si l'eau descend sous 3°C, protégeant ainsi l'échangeur à plaques contre l'éclatement.`
    ]
  };

  const logisticsAlert = logistics[climateZone][getVariantIndex(commune.slug, 4, logistics[climateZone].length)];


  // --- 5. LOCAL PRICING & AIDS CONTEXT (Dynamic & Unique) ---
  const pricingVariants: Record<ClimateZone, string[]> = {
    plaine: [
      `Le tarif moyen pour installer une pompe à chaleur Air-Eau à ${commune.nom} se situe entre **${(estimatedPrices.airEau - 1200).toLocaleString('fr-FR')} € et ${(estimatedPrices.airEau + 1800).toLocaleString('fr-FR')} €** (matériel et pose inclus). Ce budget est éligible aux aides nationales France Rénov' de l'Anah et aux primes CEE, qui peuvent couvrir jusqu'à 90% du montant total pour les ménages aux revenus très modestes.`,
      `À ${commune.nom}, équiper son logement d'une climatisation réversible Air-Air revient en moyenne à **${(estimatedPrices.airAir - 600).toLocaleString('fr-FR')} € à ${(estimatedPrices.airAir + 1200).toLocaleString('fr-FR')} €** selon le nombre de splits intérieurs. Ce système très économique en plaine permet d'amortir rapidement son coût grâce aux économies d'électricité mensuelles.`,
      `Pour l'entretien réglementaire obligatoire de votre pompe à chaleur à ${commune.nom}, nos chauffagistes RGE locaux proposent des contrats de maintenance annuels à partir de **${estimatedPrices.entretien} €**, incluant le nettoyage, le contrôle d'étanchéité frigorifique et le dépannage gratuit en cas de dysfonctionnement léger.`
    ],
    moyenne: [
      `Le coût d'achat et de pose d'un chauffage thermodynamique Air-Eau à ${commune.nom} s'élève en moyenne à **${estimatedPrices.airEau.toLocaleString('fr-FR')} €**. Le cumul de MaPrimeRénov' (Anah) et de la prime Coup de Pouce CEE permet aux habitants de l'Isère de réduire considérablement leur reste à charge, financé au besoin via un Éco-PTZ à taux zéro.`,
      `Dans le secteur de ${commune.nom}, un contrat d'entretien complet pour votre pompe à chaleur est facturé aux alentours de **${estimatedPrices.entretien} €** par an. Ce suivi régulier est indispensable pour conserver la garantie décennale de l'installateur et préserver le Coefficient de Performance (COP) par temps froid.`,
      `En cas de panne ou de code d'erreur sur votre PAC à ${commune.nom}, le tarif forfaitaire de déplacement et de diagnostic de notre réseau d'assistance de proximité est de **${estimatedPrices.depannage} €** (hors coût des pièces de rechange).`
    ],
    haute: [
      `Pour un projet géothermique de sol à ${commune.nom}, qui offre le rendement le plus performant en altitude, le budget moyen d'installation est d'environ **${estimatedPrices.geothermie.toLocaleString('fr-FR')} €** forages inclus. L'État encourage cette technologie d'exception en accordant des subventions bonifiées pouvant atteindre 15 000 €, réduisant fortement le reste à charge.`,
      `La pose d'une pompe à chaleur Air-Eau haute température spéciale montagne à ${commune.nom} représente un investissement moyen de **${(estimatedPrices.airEau + 1500).toLocaleString('fr-FR')} €**. Ce coût supérieur s'explique par l'isolation renforcée des liaisons et l'usage de compresseurs de puissance industrielle pour résister aux hivers alpins.`,
      `Le forfait d'assistance et de dépannage urgent de chauffage pour les stations et chalets d'altitude autour de ${commune.nom} débute à **${estimatedPrices.depannage} €**, garantissant la venue rapide d'un technicien frigoriste qualifié.`
    ]
  };

  const pricesContext = pricingVariants[climateZone][getVariantIndex(commune.slug, 5, pricingVariants[climateZone].length)];


  // --- 6. DYNAMIC ECO & COP CONTENT (Combinatoire) ---
  const eco1 = [
    `Faire poser une pompe à chaleur à ${commune.nom} permet de réduire l'empreinte carbone de votre logement de plus de 80% par rapport à une chaudière fioul traditionnelle.`,
    `Le passage au chauffage thermodynamique à ${commune.nom} s'inscrit dans une démarche écologique forte, limitant le recours aux énergies fossiles importées.`,
    `En exploitant les calories renouvelables de l'air ou de la terre en Isère, vous optez pour un mode de chauffage vertueux et décarboné.`
  ];

  const eco2 = [
    `Pour 1 kWh d'électricité consommé par le compresseur de la PAC, le système restitue jusqu'à 4.2 kWh d'énergie thermique gratuite sous forme de chauffage.`,
    `Grâce à l'utilisation du fluide frigorigène R290 (propane) dont le potentiel de réchauffement global (PRG) est neutre, nos installations anticipent les réglementations environnementales européennes.`,
    `Les pompes à chaleur de classe A+++ que nous installons garantissent une consommation d'électricité minimale pour un confort thermique optimal en toutes circonstances.`
  ];

  const ecoText = [
    eco1[getVariantIndex(commune.slug, 7, eco1.length)],
    eco2[getVariantIndex(commune.slug, 8, eco2.length)]
  ].join(' ');


  // --- 7. DYNAMIC LOCALIZED FAQ SECTION ---
  const faqTemplates: Record<string, { q: string[]; a: string[] }[]> = {
    main: [
      {
        q: [
          `Quelles aides financières peut-on obtenir pour une PAC à ${commune.nom} ?`,
          `Comment financer l'installation d'une pompe à chaleur à ${commune.nom} ?`
        ],
        a: [
          `Vous pouvez bénéficier de MaPrimeRénov' (versée par l'Anah), de la Prime CEE (fournisseurs d'énergie), de la TVA réduite à 5,5% et de l'Éco-Prêt à Taux Zéro (Éco-PTZ). Ces aides sont cumulables et dépendent du niveau de ressources de votre foyer. Nos artisans certifiés RGE s'occupent du montage technique de vos dossiers.`,
          `Le cumul de MaPrimeRénov' et des CEE permet de financer jusqu'à 90% du coût des travaux pour les ménages modestes en Isère. Pour les autres foyers, des aides locales et l'Éco-PTZ permettent de limiter l'investissement de départ.`
        ]
      },
      {
        q: [
          `Est-il obligatoire de passer par un installateur certifié RGE à ${commune.nom} ?`,
          `Pourquoi choisir un chauffagiste RGE QualiPAC à ${commune.nom} ?`
        ],
        a: [
          `Oui, le recours à un professionnel certifié RGE (Reconnu Garant de l'Environnement), qualifié QualiPAC, est une condition indispensable exigée par l'État pour être éligible aux subventions (MaPrimeRénov', CEE, Éco-PTZ). Cela vous garantit également une pose conforme aux normes de sécurité et d'urbanisme locales.`,
          `La certification RGE QualiPAC atteste des compétences techniques du poseur et de sa maîtrise des cycles thermodynamiques. C'est l'assurance d'une pose réalisée dans les règles de l'art (DTU 65.16) avec garantie décennale.`
        ]
      },
      {
        q: [
          `Comment se comporte une pompe à chaleur lors des hivers froids à ${commune.nom} ?`,
          `Une PAC fonctionne-t-elle correctement par grand froid en Isère ?`
        ],
        a: [
          `Nos pompes à chaleur sont dimensionnées par rapport au climat local. Pour les communes de montagne, nous installons des modèles spéciaux avec technologie grand froid maintenant une puissance constante jusqu'à -15°C. Les unités extérieures sont surélevées et équipées de câbles chauffants pour éviter tout gel des condensats.`,
          `Les PAC modernes maintiennent d'excellents coefficients de performance (COP) même par températures négatives. Une étude thermique préalable permet de calibrer la puissance de l'appoint électrique ou de coupler la PAC à une solution hybride bois.`
        ]
      }
    ],
    'air-eau': [
      {
        q: [
          `Une PAC Air-Eau est-elle compatible avec mes radiateurs existants à ${commune.nom} ?`,
          `Peut-on conserver ses anciens radiateurs avec une PAC Air-Eau à ${commune.nom} ?`
        ],
        a: [
          `Oui. Les pompes à chaleur Air-Eau de moyenne ou haute température sont spécialement conçues pour s'adapter sur un réseau hydraulique existant sans modifier vos radiateurs en fonte ou en acier. Un désembouage complet du réseau est réalisé par nos techniciens pour garantir une circulation d'eau propre et performante.`,
          `La PAC Air-Eau remplace directement votre ancienne chaudière fioul ou gaz. Grâce à une température de départ d'eau pouvant atteindre 65°C, elle conserve le confort thermique de vos anciens émetteurs sans travaux intérieurs lourds.`
        ]
      },
      {
        q: [
          `Quel est le COP moyen d'une PAC Air-Eau à ${commune.nom} ?`,
          `Quelle est l'efficacité d'une pompe à chaleur hydraulique en Isère ?`
        ],
        a: [
          `Le coefficient de performance (COP) d'une PAC Air-Eau est généralement de 4 à 4.5. Cela signifie que pour 1 kWh d'électricité consommé, l'appareil restitue plus de 4 kWh de chaleur gratuite dans votre circuit hydraulique. C'est le système hydraulique offrant le meilleur rendement énergétique en Isère.`,
          `Une PAC Air-Eau moderne permet de réduire votre facture de chauffage central de plus de 70% par rapport à une chaudière fioul ou gaz classique, amortissant rapidement l'investissement initial.`
        ]
      },
      {
        q: [
          `Quelles sont les obligations d'entretien pour une PAC Air-Eau à ${commune.nom} ?`,
          `Comment entretenir sa pompe à chaleur Air-Eau en Isère ?`
        ],
        a: [
          `L'entretien d'une pompe à chaleur contenant plus de 2 kg de fluide frigorigène est une obligation légale bisannuelle. Il doit être réalisé par un technicien habilité fluides qui contrôle l'étanchéité, nettoie l'échangeur extérieur et optimise les réglages. Nous proposons des contrats d'entretien annuels forfaitaires.`,
          `Un entretien régulier prévient l'encrassement des filtres, protège le compresseur Inverter contre l'usure prématurée et permet de conserver les rendements énergétiques d'origine du système.`
        ]
      }
    ],
    'air-air': [
      {
        q: [
          `La climatisation réversible consomme-t-elle beaucoup d'électricité à ${commune.nom} ?`,
          `Quel est le coût de fonctionnement d'une clim réversible à ${commune.nom} ?`
        ],
        a: [
          `Non. Grâce à la technologie Inverter, la PAC Air-Air adapte sa puissance en continu et consomme très peu d'électricité. Elle permet de diviser par 4 vos factures de chauffage par rapport à des radiateurs électriques classiques, tout en assurant le confort de climatisation l'été pour un coût d'usage modéré.`,
          `La climatisation réversible moderne est de classe énergétique A++ ou A+++. En programmant correctement les températures (recommandé à 19°C en hiver et 26°C en été), sa consommation reste très maîtrisée.`
        ]
      },
      {
        q: [
          `Où doit-on installer l'unité extérieure de la clim réversible à ${commune.nom} ?`,
          `Quelles sont les contraintes d'implantation pour l'unité extérieure d'une PAC Air-Air ?`
        ],
        a: [
          `L'unité extérieure doit être placée dans un endroit aéré, de préférence à l'abri des vents dominants et sur une façade non visible directement depuis la rue. Afin de préserver les bruits de voisinage, nos techniciens veillent à l'éloigner des limites séparatives directes et installent des silentblocs anti-vibrations.`,
          `Une déclaration préalable en mairie de ${commune.nom} est obligatoire avant d'installer un module extérieur visible. Nos équipes s'occupent de préparer les plans d'urbanisme nécessaires pour votre dossier.`
        ]
      },
      {
        q: [
          `Quels sont les avantages d'une PAC Air-Air multi-splits à ${commune.nom} ?`,
          `Pourquoi installer une climatisation réversible multi-splits dans sa maison ?`
        ],
        a: [
          `Le système multi-splits permet de raccorder plusieurs unités intérieures sur un seul module extérieur. Cela permet de réguler la température de chaque pièce (chambres, salon) de manière indépendante avec des télécommandes dédiées, tout en purifiant l'air ambiant grâce aux filtres intégrés.`,
          `C'est la solution idéale en Isère pour chauffer l'hiver et rafraîchir l'été des habitations sur plusieurs niveaux ou disposant de plusieurs pièces de vie.`
        ]
      }
    ],
    geothermie: [
      {
        q: [
          `Pourquoi la géothermie est-elle le système le plus performant à ${commune.nom} ?`,
          `Quels sont les avantages d'une PAC géothermique en Isère ?`
        ],
        a: [
          `La température du sol à 100 mètres de profondeur reste stable (entre 10°C et 12°C) toute l'année, quelles que soient les gelées en Isère. Le rendement (COP) de la PAC géothermique reste constant et supérieur à 4.8, sans baisse de puissance au cœur de l'hiver. De plus, elle ne produit aucun bruit extérieur.`,
          `La géothermie verticale ou horizontale offre la meilleure efficacité énergétique du marché. Elle permet également de bénéficier du rafraîchissement passif (geocooling) en été pour un coût électrique presque nul.`
        ]
      },
      {
        q: [
          `Faut-il une autorisation pour réaliser un forage géothermique à ${commune.nom} ?`,
          `Quelles sont les démarches administratives pour la géothermie en Isère ?`
        ],
        a: [
          `Oui. Les forages verticaux profonds pour sondes géothermiques nécessitent une déclaration préalable auprès de la DREAL Auvergne-Rhône-Alpes et de la mairie de ${commune.nom}. Nos équipes et nos foreurs agréés s'occupent de réaliser l'ensemble des études géologiques et des dossiers réglementaires.`,
          `La réglementation impose de faire appel à des entreprises certifiées RGE Foreur pour garantir la protection des nappes phréatiques souterraines de l'Isère.`
        ]
      },
      {
        q: [
          `Quelle est la durée de vie d'une installation géothermique à ${commune.nom} ?`,
          `La géothermie est-elle un investissement durable à ${commune.nom} ?`
        ],
        a: [
          `La pompe à chaleur géothermique présente la meilleure durabilité du marché. Les sondes en polyéthylène enterrées dans le sol sont garanties plus de 40 ans, tandis que l'unité intérieure (compresseur) installée dans un local technique abrité présente une durée de vie supérieure à 20 ans, soit 5 ans de plus qu'une PAC aérothermique.`,
          `Bien que l'investissement de départ soit supérieur à celui de l'aérothermie, les économies sur les factures et la longévité du système le rendent extrêmement rentable sur le long terme.`
        ]
      }
    ],
    entretien: [
      {
        q: [
          `À quelle fréquence doit-on faire entretenir sa PAC à ${commune.nom} ?`,
          `Quel est le rythme réglementaire pour l'entretien d'une pompe à chaleur ?`
        ],
        a: [
          `Pour les pompes à chaleur d'une puissance supérieure à 4 kW (soit la quasi-totalité des modèles résidentiels), l'entretien réglementaire obligatoire est bisannuel. Nous recommandons toutefois une visite annuelle préventive avant la saison de chauffe pour nettoyer l'échangeur extérieur et s'assurer de l'absence de fuite de fluide.`,
          `Un contrôle bisannuel par un frigoriste certifié est une obligation légale. Il donne lieu à la délivrance d'une attestation d'entretien indispensable pour votre assureur en cas de sinistre.`
        ]
      },
      {
        q: [
          `Que comprend la visite d'entretien de ma pompe à chaleur à ${commune.nom} ?`,
          `Quelles opérations effectue le technicien lors de la révision de ma PAC ?`
        ],
        a: [
          `La visite comprend le nettoyage complet des filtres et de l'échangeur extérieur (souvent encombré de feuilles), le contrôle de l'étanchéité du circuit de fluide frigorigène, la vérification des raccordements électriques, le test du compresseur et l'optimisation des réglages de régulation de votre chauffage.`,
          `Le technicien vérifie également la pression du vase d'expansion hydraulique et s'assure du bon fonctionnement des vannes de sécurité et des sondes de température.`
        ]
      },
      {
        q: [
          `Peut-on réaliser soi-même l'entretien de sa pompe à chaleur à ${commune.nom} ?`,
          `Quels gestes de maintenance puis-je faire moi-même sur ma PAC ?`
        ],
        a: [
          `L'entretien technique impliquant la manipulation de gaz sous pression doit impérativement être réalisé par un professionnel habilité. En tant que propriétaire, vous pouvez simplement veiller à ce que l'unité extérieure reste dégagée (retirer les feuilles mortes, la poussière ou la neige) et dépoussiérer les filtres intérieurs des splits de climatisation réversible.`,
          `Il ne faut jamais ouvrir le capot du circuit frigorifique ni toucher aux liaisons en cuivre, sous peine d'annulation de la garantie décennale et de risque de fuite de gaz.`
        ]
      }
    ],
    depannage: [
      {
        q: [
          `En combien de temps intervenez-vous pour un dépannage de PAC à ${commune.nom} ?`,
          `Quel est le délai de réparation d'une pompe à chaleur en panne en Isère ?`
        ],
        a: [
          `Nos équipes d'assistance de proximité basées en Isère interviennent sous 24 à 48 heures, en particulier en saison hivernale lorsque votre chauffage principal est en panne totale. Un premier diagnostic par téléphone permet souvent d'identifier les pannes courantes et d'orienter le technicien avec les bonnes pièces de rechange.`,
          `En cas d'urgence grand froid ou de gel des canalisations, nos dépanneurs d'altitude traitent les demandes en priorité pour rétablir une température hors-gel.`
        ]
      },
      {
        q: [
          `Pourquoi ma pompe à chaleur s'est-elle mise en sécurité à ${commune.nom} ?`,
          `Quelles sont les causes fréquentes d'arrêt d'une PAC en Isère ?`
        ],
        a: [
          `Une PAC se met en sécurité pour protéger ses organes internes. Les causes fréquentes sont un manque de débit d'eau (filtre hydraulique bouché), une pression de gaz insuffisante due à une micro-fuite, un défaut de ventilateur extérieur causé par le gel, ou une anomalie électrique sur le compresseur Inverter.`,
          `Consultez le code d'erreur affiché sur votre écran de contrôle et communiquez-le à notre technicien de dépannage lors de votre appel pour accélérer le diagnostic.`
        ]
      },
      {
        q: [
          `Quel est le coût moyen d'un dépannage de pompe à chaleur à ${commune.nom} ?`,
          `Combien coûte le diagnostic d'une PAC en panne en Isère ?`
        ],
        a: [
          `Le coût moyen d'un diagnostic d'urgence s'élève à **${estimatedPrices.depannage} €**, comprenant le déplacement du technicien et la première heure de recherche de panne sur site. Si un remplacement de pièce est requis, nous vous présentons un devis de réparation détaillé et transparent incluant les pièces d'origine certifiées.`,
          `Aucune réparation n'est engagée sans votre accord écrit préalable sur le devis, vous évitant toute mauvaise surprise sur votre facture d'intervention.`
        ]
      }
    ]
  };

  // Select 3 FAQs using deterministic combinatoric indexing
  const currentFaqList = faqTemplates[category === 'main' ? 'main' : category] || faqTemplates.main;
  const faqItems = currentFaqList.map((faqGroup, i) => {
    const qIndex = getVariantIndex(commune.slug, 20 + i, faqGroup.q.length);
    const aIndex = getVariantIndex(commune.slug, 30 + i, faqGroup.a.length);
    return {
      question: faqGroup.q[qIndex],
      answer: faqGroup.a[aIndex]
    };
  });

  return {
    introParagraph,
    logisticsAlert,
    useCaseText,
    pricesContext,
    faqItems,
    ecoText,
    localContext,
    climateZoneLabel: zoneLabels[climateZone],
    localAgencyName: agency.name
  };
}
