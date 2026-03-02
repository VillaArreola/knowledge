const SITE = 'https://kb.villaarreola.com';

export async function GET() {
  // Páginas principales (hubs de categoría)
  const mainPages = [
    { url: `${SITE}/`,               priority: 1.0, changefreq: 'weekly'  },
    { url: `${SITE}/redes`,          priority: 0.9, changefreq: 'weekly'  },
    { url: `${SITE}/sistemas`,       priority: 0.9, changefreq: 'weekly'  },
    { url: `${SITE}/ciberseguridad`, priority: 0.9, changefreq: 'weekly'  },
    { url: `${SITE}/cloud`,          priority: 0.9, changefreq: 'weekly'  },
    { url: `${SITE}/programacion`,   priority: 0.9, changefreq: 'weekly'  },
    { url: `${SITE}/portafolio`,     priority: 0.6, changefreq: 'monthly' },
  ];

  // Certificaciones
  const certPages = [
    { url: `${SITE}/cert/200-301`,       priority: 0.8, changefreq: 'monthly' },
    { url: `${SITE}/cert/AI-900`,        priority: 0.8, changefreq: 'monthly' },
    { url: `${SITE}/cert/CFE`,           priority: 0.8, changefreq: 'monthly' },
    { url: `${SITE}/cert/CLF-C02`,       priority: 0.8, changefreq: 'monthly' },
    { url: `${SITE}/cert/NSE4_FGT-7.2`, priority: 0.8, changefreq: 'monthly' },
    { url: `${SITE}/cert/SY0-701`,       priority: 0.8, changefreq: 'monthly' },
  ];

  // Páginas de contenido
  const contentPages = [
    // Redes
    { url: `${SITE}/redes/sdwan`,              priority: 0.7, changefreq: 'monthly' },
    { url: `${SITE}/redes/switching`,          priority: 0.7, changefreq: 'monthly' },
    { url: `${SITE}/redes/wifi`,               priority: 0.7, changefreq: 'monthly' },
    { url: `${SITE}/redes/fundamentos/tcp-ip`, priority: 0.7, changefreq: 'monthly' },
    // Sistemas
    { url: `${SITE}/sistemas/gobernanza/iam`,                priority: 0.7, changefreq: 'monthly' },
    { url: `${SITE}/sistemas/operativos/linux`,              priority: 0.7, changefreq: 'monthly' },
    { url: `${SITE}/sistemas/virtualizacion/virtualizacion`, priority: 0.7, changefreq: 'monthly' },
    { url: `${SITE}/sistemas/virtualizacion/vmware`,         priority: 0.7, changefreq: 'monthly' },
    // Ciberseguridad
    { url: `${SITE}/ciberseguridad/criptografia/criptografia`,          priority: 0.7, changefreq: 'monthly' },
    { url: `${SITE}/ciberseguridad/criptografia/interactivo`,           priority: 0.7, changefreq: 'monthly' },
    { url: `${SITE}/ciberseguridad/criptografia/pki`,                   priority: 0.7, changefreq: 'monthly' },
    { url: `${SITE}/ciberseguridad/fundamentos/cia`,                    priority: 0.7, changefreq: 'monthly' },
    { url: `${SITE}/ciberseguridad/fundamentos/control-ciberseguridad`, priority: 0.7, changefreq: 'monthly' },
    { url: `${SITE}/ciberseguridad/fundamentos/nist`,                   priority: 0.7, changefreq: 'monthly' },
    { url: `${SITE}/ciberseguridad/redes-seguras/firewall`,             priority: 0.7, changefreq: 'monthly' },
    // Cloud
    { url: `${SITE}/cloud/aws/aws`, priority: 0.7, changefreq: 'monthly' },
    // Programación
    { url: `${SITE}/programacion/fundamentos/algoritmos`, priority: 0.7, changefreq: 'monthly' },
  ];

  const allPages = [...mainPages, ...certPages, ...contentPages];
  const lastmod = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
