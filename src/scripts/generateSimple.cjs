const fs = require('fs');
const path = require('path');

function parseMetaFile(metaPath) {
    if (!fs.existsSync(metaPath)) return null;
    
    const content = fs.readFileSync(metaPath, 'utf-8');
    const metadata = {};
    
    content.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...values] = line.split('=');
            if (key && values.length > 0) {
                const value = values.join('=').trim();
                
                if (key === 'tags') {
                    metadata[key] = value.split(',').map(tag => tag.trim());
                } else if (key === 'certifications') {
                    metadata[key] = value.split(',').map(cert => {
                        const [code, weight, domain] = cert.split(':');
                        return {
                            code: code.trim(),
                            weight: parseFloat(weight) || 1.0,
                            domain: domain?.trim() || ''
                        };
                    });
                } else if (key === 'order') {
                    metadata[key] = parseInt(value) || 0;
                } else {
                    metadata[key] = value;
                }
            }
        }
    });
    
    return metadata;
}

function generateSimpleSystem() {
    console.log('🚀 Generando sistema simple desde archivos .meta...');
    
    const allPages = [];
    const categoryIndexes = {};
    const certificationIndexes = {};
    
    const categories = ['sistemas', 'ciberseguridad', 'redes', 'programacion', 'cloud'];
    
    // Cargar configuración de certificaciones
    const certificationsConfigPath = path.join(__dirname, '../data/certifications/index.json');
    let certificationsConfig = { certifications: [] };
    if (fs.existsSync(certificationsConfigPath)) {
        try {
            certificationsConfig = JSON.parse(fs.readFileSync(certificationsConfigPath, 'utf-8'));
            console.log(`📋 Configuración de certificaciones cargada: ${certificationsConfig.certifications.length} certificaciones`);
        } catch (error) {
            console.error('❌ Error cargando configuración de certificaciones:', error.message);
        }
    }
    
    // Inicializar índices de certificaciones
    certificationsConfig.certifications.forEach(cert => {
        certificationIndexes[cert.code] = {
            certification: cert,
            topics: []
        };
    });
    
    categories.forEach(category => {
        console.log(`📁 Procesando categoría: ${category}`);
        const categoryPages = [];
        const categoryPath = path.join(__dirname, '../pages', category);
        
        if (!fs.existsSync(categoryPath)) {
            console.log(`⚠️  Directorio no encontrado: ${categoryPath}`);
            return;
        }
        
        // Escanear subdirectorios (secciones)
        const subdirs = fs.readdirSync(categoryPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        
        subdirs.forEach(section => {
            const sectionPath = path.join(categoryPath, section);
            console.log(`  📂 Procesando sección: ${section}`);
            
            const astroFiles = fs.readdirSync(sectionPath)
                .filter(file => file.endsWith('.astro'));
            
            astroFiles.forEach(file => {
                const astroPath = path.join(sectionPath, file);
                const metaPath = path.join(sectionPath, file.replace('.astro', '.meta'));
                
                try {
                    const metadata = parseMetaFile(metaPath);
                    
                    if (metadata && metadata.title && metadata.slug) {
                        const pageData = {
                            ...metadata,
                            category: category.charAt(0).toUpperCase() + category.slice(1),
                            section: section,
                            url: `/${category}/${section}/${metadata.slug}`,
                            searchContent: `${metadata.title} ${metadata.description || ''} ${metadata.tags?.join(' ') || ''}`
                        };
                        
                        allPages.push(pageData);
                        categoryPages.push(pageData);
                        
                        // Procesar certificaciones del tema
                        if (metadata.certifications && Array.isArray(metadata.certifications)) {
                            metadata.certifications.forEach(cert => {
                                if (certificationIndexes[cert.code]) {
                                    const certTopic = {
                                        ...pageData,
                                        certificationWeight: cert.weight,
                                        certificationDomain: cert.domain
                                    };
                                    certificationIndexes[cert.code].topics.push(certTopic);
                                    console.log(`    🏆 Agregado a certificación: ${cert.code} (${cert.name || cert.code})`);
                                }
                            });
                        }
                        
                        console.log(`    ✅ Procesado: ${metadata.title}`);
                        
                        // Generar JSON individual del tema
                        const jsonPath = path.join(__dirname, `../data/categories/${category}/${section}/${metadata.slug}.json`);
                        const jsonDir = path.dirname(jsonPath);
                        
                        if (!fs.existsSync(jsonDir)) {
                            fs.mkdirSync(jsonDir, { recursive: true });
                        }
                        
                        fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));
                        console.log(`    💾 JSON generado: ${jsonPath}`);
                    } else {
                        console.log(`    ⚠️  No se encontraron metadatos válidos para: ${file}`);
                    }
                } catch (error) {
                    console.error(`    ❌ Error procesando ${file}:`, error.message);
                }
            });
        });
        
        categoryIndexes[category] = categoryPages;
    });
    
    // Generar índice global
    const globalIndexPath = path.join(__dirname, '../../public/search-index.json');
    const globalIndexData = {
        pages: allPages,
        categories: Object.keys(categoryIndexes),
        lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync(globalIndexPath, JSON.stringify(globalIndexData, null, 2));
    console.log(`✅ Índice global generado: ${globalIndexPath} (${allPages.length} páginas)`);
    
    // Generar índices por categoría
    Object.entries(categoryIndexes).forEach(([category, pages]) => {
        const categoryIndexPath = path.join(__dirname, `../../public/search-${category}.json`);
        const categoryIndexData = { pages };
        
        fs.writeFileSync(categoryIndexPath, JSON.stringify(categoryIndexData, null, 2));
        console.log(`✅ Índice de ${category} generado: ${categoryIndexPath} (${pages.length} páginas)`);
    });
    
    // Generar índices por certificación
    Object.entries(certificationIndexes).forEach(([certCode, certData]) => {
        if (certData.topics.length > 0) {
            const certIndexPath = path.join(__dirname, `../../public/search-cert-${certCode}.json`);
            const certIndexData = {
                certification: certData.certification,
                topics: certData.topics.sort((a, b) => (b.certificationWeight || 0) - (a.certificationWeight || 0)),
                lastUpdated: new Date().toISOString()
            };
            
            fs.writeFileSync(certIndexPath, JSON.stringify(certIndexData, null, 2));
            console.log(`🏆 Índice de certificación ${certCode} generado: ${certIndexPath} (${certData.topics.length} temas)`);
        }
    });
    
    console.log('🎉 Sistema simple generado exitosamente!');
    console.log(`📊 Total: ${allPages.length} páginas procesadas`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
    generateSimpleSystem();
}

module.exports = { generateSimpleSystem };
