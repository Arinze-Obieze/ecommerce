function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
}

export async function sendZeptoMail({ to, subject, html, text }) {
  const normalizedTo = normalizeEmail(to);
  const normalizedSubject = String(subject || '').trim();
  const normalizedHtml = String(html || '').trim();
  const normalizedText = String(text || '').trim();

  if (!normalizedTo || !isValidEmail(normalizedTo)) {
    return { ok: false, status: 400, error: 'Valid "to" email is required' };
  }

  if (!normalizedSubject) {
    return { ok: false, status: 400, error: 'Email subject is required' };
  }

  if (!normalizedHtml && !normalizedText) {
    return { ok: false, status: 400, error: 'Provide at least one of html or text body' };
  }

  const zeptoHost = String(process.env.ZEPTOMAIL_HOST || '').trim() || 'api.zeptomail.com';
  const zeptoApiUrl = process.env.ZEPTOMAIL_API_URL || `https://${zeptoHost}/v1.1/email`;
  const zeptoApiKey = String(process.env.ZEPTOMAIL_API_KEY || process.env.ZEPTOMAIL_TOKEN || '').trim();
  const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL;
  const fromName = process.env.ZEPTOMAIL_FROM_NAME || 'Platform';
  const authHeader = /^zoho-enczapikey\s+/i.test(zeptoApiKey)
    ? zeptoApiKey
    : `Zoho-enczapikey ${zeptoApiKey}`;

  if (!zeptoApiKey || !fromEmail) {
    return {
      ok: false,
      status: 500,
      error:
        'Missing ZeptoMail configuration. Set ZEPTOMAIL_TOKEN (or ZEPTOMAIL_API_KEY) and ZEPTOMAIL_FROM_EMAIL.',
    };
  }

  const payload = {
    from: {
      address: fromEmail,
      name: fromName,
    },
    to: [
      {
        email_address: {
          address: normalizedTo,
        },
      },
    ],
    subject: normalizedSubject,
    ...(normalizedHtml ? { htmlbody: normalizedHtml } : {}),
    ...(normalizedText ? { textbody: normalizedText } : {}),
  };

  const response = await fetch(zeptoApiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  if (!response.ok) {
    return {
      ok: false,
      status: 502,
      error: 'Failed to send email via ZeptoMail',
      details: responseText || response.statusText,
    };
  }

  return {
    ok: true,
    status: 200,
    data: {
      to: normalizedTo,
      subject: normalizedSubject,
      provider: 'zeptomail',
      response: responseText,
    },
  };
}
