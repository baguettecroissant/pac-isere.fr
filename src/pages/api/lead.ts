export const prerender = false;

import type { APIRoute } from 'astro';
import { onRequestGet, onRequestOptions, onRequestPost } from '../../../functions/api/lead.js';

type RuntimeLocals = {
  runtime?: {
    env?: Record<string, string>;
  };
};

function runtimeEnv(locals: unknown): Record<string, string> {
  return (locals as RuntimeLocals | undefined)?.runtime?.env || {};
}

export const GET: APIRoute = async ({ request, locals }) =>
  onRequestGet({ request, env: runtimeEnv(locals) });

export const POST: APIRoute = async ({ request, locals }) =>
  onRequestPost({ request, env: runtimeEnv(locals) });

export const OPTIONS: APIRoute = async ({ request, locals }) =>
  onRequestOptions({ request, env: runtimeEnv(locals) });
