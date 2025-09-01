const fs = require('fs');
const path = require('path');

function generateSearchSystem() {
    console.log('🚀 Iniciando generación del sistema de búsqueda...');
    
    const allPages = [];
    const categoryIndexes = {};
    const certificationIndexes = {};
    
    const categories = ['sistemas', 'ciberseguridad', 'redes', 'programacion'];
    
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
        const categoryPath = path.join(__dirname, '../data/categories', category);
        
        // Verificar si existe el directorio de la categoría
        if (!fs.existsSync(categoryPath)) {
            console.log(`⚠️  Directorio no encontrado: ${categoryPath}`);
            return;
        }
        
        // Verificar si existe el archivo index.json
        const categoryIndexPath = path.join(categoryPath, 'index.json');
        if (!fs.existsSync(categoryIndexPath)) {
            console.log(`⚠️  Archivo index.json no encontrado: ${categoryIndexPath}`);
            return;
        }
        
        try {
            const categoryData = JSON.parse(fs.readFileSync(categoryIndexPath, 'utf-8'));
            
            categoryData.sections.forEach(section => {
                const sectionPath = path.join(categoryPath, section.slug);
                if (fs.existsSync(sectionPath)) {
                    console.log(`  📂 Procesando sección: ${section.slug}`);
                    const sectionFiles = fs.readdirSync(sectionPath);
                    sectionFiles.forEach(file => {
                        if (file.endsWith('.json')) {
                            const topicPath = path.join(sectionPath, file);
                            try {
                                const topicData = JSON.parse(fs.readFileSync(topicPath, 'utf-8'));
                                const pageData = {
                                    ...topicData,
                                    category: categoryData.name,
                                    section: section.slug,
                                    url: `/${category}/${section.slug}/${topicData.slug}`,
                                    searchContent: `${topicData.title} ${topicData.description} ${topicData.tags?.join(' ') || ''}`
                                };
                                
                                allPages.push(pageData);
                                categoryPages.push(pageData);
                                
                                // Procesar certificaciones del tema
                                if (topicData.certifications && Array.isArray(topicData.certifications)) {
                                    topicData.certifications.forEach(cert => {
                                        if (certificationIndexes[cert.code]) {
                                            const certTopic = {
                                                ...pageData,
                                                certificationWeight: cert.weight,
                                                certificationDomain: cert.domain
                                            };
                                            certificationIndexes[cert.code].topics.push(certTopic);
                                            console.log(`    🏆 Agregado a certificación: ${cert.code} (${cert.name})`);
                                        }
                                    });
                                }
                                
                                console.log(`    ✅ Procesado: ${topicData.title}`);
                            } catch (error) {
                                console.error(`    ❌ Error procesando ${file}:`, error.message);
                            }
                        }
                    });
                } else {
                    console.log(`  ⚠️  Sección no encontrada: ${sectionPath}`);
                }
            });
            
            categoryIndexes[category] = categoryPages;
        } catch (error) {
            console.error(`❌ Error procesando categoría ${category}:`, error.message);
        }
    });
    
    // Generar índice global solo para certificaciones
    const globalIndexPath = path.join(__dirname, '../../public/search-index.json');
    const globalIndexData = {
        pages: allPages,
        categories: Object.keys(categoryIndexes),
        lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync(globalIndexPath, JSON.stringify(globalIndexData, null, 2));
    console.log(`✅ Índice global generado (solo para certificaciones): ${globalIndexPath} (${allPages.length} páginas)`);
    
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
    
    console.log('🎉 Sistema de búsqueda generado exitosamente!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
    generateSearchSystem();
}

module.exports = { generateSearchSystem };
