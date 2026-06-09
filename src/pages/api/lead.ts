import type { APIRoute } from 'astro';
import config from '../../data/config.json';

const VUD_API_KEY = config.viteundevis?.apiKey || '17695301406978e31c715766978e31c715ae';
const VUD_API_URL = 'https://www.viteundevis.com/api/get.php';
const VUD_PING_URL = 'https://www.viteundevis.com/api/ping.php';
const SITE_NAME = config.domain || 'pac-isere.fr';

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await request.json();

    const {
      nom,
      prenom,
      email,
      tel,
      adresse,
      cp,
      ville,
      catId, // work category (158, 40, 93, 162, 171)
      typeBien, // '1' = Maison, '2' = Appartement
      situation, // '1' = Propriétaire occupant, '2' = Locataire, '3' = Propriétaire bailleur
      chauffageActuel, // 'Electricite', 'Gaz', 'Fioul', 'Bois'
      delais, // '1' = Immédiat, '2' = < 3 mois, '3' = > 3 mois
    } = rawBody;

    // ── Server-side validation ──
    const errors: string[] = [];
    if (!nom || nom.trim().length < 2) errors.push('Nom requis (2 caractères minimum)');
    if (!prenom || prenom.trim().length < 2) errors.push('Prénom requis (2 caractères minimum)');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email invalide');
    if (!tel || tel.replace(/\D/g, '').length < 10) errors.push('Téléphone invalide (10 chiffres minimum)');
    if (!adresse || adresse.trim().length < 5) errors.push('Adresse complète requise (rue, numéro)');
    if (!cp || !/^38\d{3}$/.test(cp)) errors.push('Code postal invalide (doit être en Isère : 38XXX)');
    if (!ville || ville.trim().length < 2) errors.push('Ville requise');
    if (!catId) errors.push('Projet requis');

    if (errors.length > 0) {
      return new Response(JSON.stringify({ success: false, errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanTel = tel.replace(/\D/g, '');
    const isMobile = cleanTel.startsWith('06') || cleanTel.startsWith('07') || cleanTel.startsWith('336') || cleanTel.startsWith('337');

    // Build project description including current heating system
    const workDescription = `Projet: Travaux PAC en Isere. Chauffage actuel: ${chauffageActuel || 'Non renseigné'}. Delai: ${
      delais === '1' ? 'Immediat' : delais === '2' ? 'Moins de 3 mois' : 'Plus de 3 mois'
    }. Adresse chantier: ${adresse}, ${cp} ${ville}.`;

    // ── Step 1: PING ViteUnDevis to check for buyers ──
    const pingBody = new URLSearchParams({
      token: VUD_API_KEY,
      cat_id: String(catId),
      code_postal: cp,
      pays: 'fr',
      description: workDescription,
      cpl_mini: '0',
    });

    let pingResult = { accept: 0, recommande: 1, cpl: '0' };
    try {
      const pingRes = await fetch(VUD_PING_URL, {
        method: 'POST',
        body: pingBody,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      if (pingRes.ok) {
        pingResult = await pingRes.json();
      }
    } catch (e) {
      console.error('ViteUnDevis Ping error:', e);
      // We proceed even if ping fails, as recommended by ViteUnDevis to capture and queue leads
    }

    // ── Step 2: POST lead to ViteUnDevis API ──
    const vudPayload = new URLSearchParams({
      key: VUD_API_KEY,
      cat_id: String(catId),
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.trim(),
      tel: isMobile ? '' : cleanTel,
      mobile: isMobile ? cleanTel : '',
      adresse1: adresse.trim(),
      adresse2: '',
      cp: cp,
      ville: ville.trim(),
      cp_projet: cp,
      ville_projet: ville.trim(),
      pays: 'fr',
      tp: '1',                      // 1 = Particulier
      type_bien: typeBien || '1',   // 1 = Maison, 2 = Appartement
      situation: situation || '1',  // 1 = Propriétaire occupant, 2 = Locataire, 3 = Propriétaire bailleur
      delais: delais || '2',       // 1 = Urgent/Immédiat, 2 = < 3 mois, 3 = 3-6 mois, 4 = > 6 mois
      terrain: '0',
      permis: '3',                  // 3 = Non concerné
      description: workDescription,
      site_name: SITE_NAME,
      format_return: 'json',
      matin: '1',
      midi: '1',
      soir: '1',
      we: '0',
    });

    const vudRes = await fetch(VUD_API_URL, {
      method: 'POST',
      body: vudPayload,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': `partenaire-apivud-${VUD_API_KEY}`,
      },
    });

    const vudText = await vudRes.text();
    let vudData: any;

    try {
      vudData = JSON.parse(vudText);
    } catch (parseError) {
      console.error('Error parsing VUD response:', vudText);
      return new Response(JSON.stringify({
        success: false,
        errors: ['Réponse invalide de la plateforme partenaire. Veuillez réessayer.'],
      }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ── Step 3: Handle response ──
    const code = vudData?.code_retour?.[0]?.code?.toString();

    if (code === '200') {
      const devisId = vudData.devis_data?.devis_id || '';
      const devisHash = vudData.devis_data?.devis_hash || '';

      return new Response(JSON.stringify({
        success: true,
        devis_id: devisId,
        devis_hash: devisHash,
        ping: {
          accept: pingResult.accept,
          recommande: pingResult.recommande,
          cpl: pingResult.cpl,
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      const vudErrors = (vudData?.code_retour || []).map((e: any) => e.code_texte || `Erreur ${e.code}`);
      return new Response(JSON.stringify({
        success: false,
        errors: vudErrors.length > 0 ? vudErrors : ['Le partenaire d\'affiliation a refusé la demande.'],
      }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Submit API error:', error);
    return new Response(JSON.stringify({
      success: false,
      errors: ['Une erreur serveur est survenue. Veuillez réessayer dans quelques instants.'],
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
