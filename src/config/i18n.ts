import i18n from 'i18next';
import Backend from 'i18next-fs-backend';

i18n
    .use(Backend)
    .init({
        // debug: true,
        lng: 'pt',
        fallbackLng: 'en',
        defaultNS: 'translation',
        backend: {
            loadPath: './src/locales/{{lng}}/translation.json',
        },
        preload: ['en', 'pt'], // Precarrega os idiomas
    });

// Função para definir o idioma globalmente
export const setLanguage = async (language: string) => {
    await i18n.changeLanguage(language);
};

// Função global de tradução
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const t = (key: string, options?: any) => i18n.t(key, options);

export default i18n;
