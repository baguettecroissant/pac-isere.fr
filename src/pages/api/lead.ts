export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import config from '../../data/config.json';

const VUD_API_KEY = config.viteundevis?.apiKey || '';
const VUD_API_URL = 'https://www.viteundevis.com/api/get.php';
const VUD_PING_URL = 'https://www.viteundevis.com/api/ping.php';
const SITE_NAME = config.domain || '';
const DEPT_CODE = config.departmentCode || '';
const DEPT_NAME = config.department || '';

// Supabase PimpSEO client
const supabase = createClient(
  config.supabaseUrl || '',
  config.supabaseAnonKey || ''
);

// Category name mapping
const CAT_NAMES: Record<number, string> = {
  158: 'Installation PAC Air/Eau',
  40: 'Climatisation Réversible (Air/Air)',
  93: 'PAC Géothermique',
  162: 'Entretien Annuel PAC',
  171: 'Dépannage & Urgence PAC',
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await request.json();

    const {
      nom, prenom, email, tel, adresse, cp, ville,
      catId, typeBien, situation, chauffageActuel, delais,
      pageUrl
    } = rawBody;

    // ── Server-side validation ──
    const errors: string[] = [];
    if (!nom || nom.trim().length < 2) errors.push('Nom requis (2 caractères minimum)');
    if (!prenom || prenom.trim().length < 2) errors.push('Prénom requis (2 caractères minimum)');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email invalide');
    if (!tel || tel.replace(/\D/g, '').length < 10) errors.push('Téléphone invalide (10 chiffres minimum)');
    if (!adresse || adresse.trim().length < 5) errors.push('Adresse complète requise (rue, numéro)');
    const cpRegex = new RegExp(`^${DEPT_CODE}\\d{3}$`);
    if (!cp || !cpRegex.test(cp)) errors.push(`Code postal invalide (doit être dans le département ${DEPT_CODE})`);
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

    const workDescription = `Projet: Travaux PAC en ${DEPT_NAME} (${DEPT_CODE}). Chauffage actuel: ${chauffageActuel || 'Non renseigné'}. Delai: ${
      delais === '1' ? 'Immediat' : delais === '2' ? 'Moins de 3 mois' : 'Plus de 3 mois'
    }. Adresse chantier: ${adresse}, ${cp} ${ville}.`;

    // ── Step 1: PING ViteUnDevis ──
    let pingResult = { accept: 0, recommande: 0, cpl: '0', ecpl: '0', nb_buyers: 0 };
    try {
      const pingBody = new URLSearchParams({
        token: VUD_API_KEY,
        cat_id: String(catId),
        code_postal: cp,
        pays: 'fr',
        description: workDescription,
        cpl_mini: '0',
      });
      const pingRes = await fetch(VUD_PING_URL, {
        method: 'POST',
        body: pingBody,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      if (pingRes.ok) {
        const pingData = await pingRes.json();
        pingResult = {
          accept: pingData.accept || 0,
          recommande: pingData.recommande || 0,
          cpl: pingData.cpl || '0',
          ecpl: pingData.ecpl || '0',
          nb_buyers: pingData.nb_buyers || 0,
        };
      }
    } catch (e) {
      console.error('ViteUnDevis Ping error:', e);
    }

    // ── Step 2: POST lead to ViteUnDevis ──
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
      tp: '1',
      type_bien: typeBien || '1',
      situation: situation || '1',
      delais: delais || '2',
      terrain: '0',
      permis: '3',
      description: workDescription,
      site_name: SITE_NAME,
      format_return: 'json',
      matin: '1',
      midi: '1',
      soir: '1',
      we: '0',
    });

    let vudData: any = null;
    let vudSuccess = false;
    let devisId = '';
    let devisHash = '';

    try {
      const vudRes = await fetch(VUD_API_URL, {
        method: 'POST',
        body: vudPayload,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': `partenaire-apivud-${VUD_API_KEY}`,
        },
      });

      const vudText = await vudRes.text();
      vudData = JSON.parse(vudText);

      const code = vudData?.code_retour?.[0]?.code?.toString();
      if (code === '200') {
        vudSuccess = true;
        devisId = vudData.devis_data?.devis_id || '';
        devisHash = vudData.devis_data?.devis_hash || '';
      }
    } catch (e) {
      console.error('ViteUnDevis POST error:', e);
    }

    // ── Step 3: Store lead in Supabase PimpSEO ──
    const delaisLabel = delais === '1' ? 'Immédiat' : delais === '2' ? 'Moins de 3 mois' : 'Plus de 3 mois';
    const typeBienLabel = typeBien === '1' ? 'Maison' : 'Appartement';
    const situationLabel = situation === '1' ? 'Propriétaire occupant' : situation === '2' ? 'Locataire' : 'Propriétaire bailleur';

    try {
      const { error: supaError } = await supabase.from('rank_rent_leads').insert({
        source_site: SITE_NAME,
        niche: 'pompe-a-chaleur',
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        telephone: cleanTel,
        adresse: adresse.trim(),
        ville: ville.trim(),
        code_postal: cp,
        departement: DEPT_NAME,
        cat_id: Number(catId),
        cat_name: CAT_NAMES[Number(catId)] || `Catégorie ${catId}`,
        type_bien: typeBienLabel,
        situation: situationLabel,
        chauffage_actuel: chauffageActuel || 'Non renseigné',
        delais: delaisLabel,
        description: workDescription,
        vud_ping_accept: Boolean(pingResult.accept),
        vud_ping_recommande: Boolean(pingResult.recommande),
        vud_ping_cpl: Number(pingResult.cpl) || 0,
        vud_ping_ecpl: Number(pingResult.ecpl) || 0,
        vud_ping_buyers: pingResult.nb_buyers || 0,
        vud_devis_id: devisId || null,
        vud_devis_hash: devisHash || null,
        vud_status: vudSuccess ? 'accepted' : 'rejected',
        vud_response: vudData || null,
        vud_cpl: Number(pingResult.cpl) || 0,
        vud_validated: vudSuccess,
        page_url: pageUrl || null,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || null,
        user_agent: request.headers.get('user-agent') || null,
      });

      if (supaError) {
        console.error('Supabase insert error:', supaError);
      }
    } catch (e) {
      console.error('Supabase error:', e);
      // Don't fail the request if Supabase fails — VUD is the priority
    }

    // ── Step 4: Return response ──
    if (vudSuccess) {
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
        errors: vudErrors.length > 0 ? vudErrors : ['Le partenaire a refusé la demande. Veuillez vérifier vos informations.'],
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
