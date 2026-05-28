import JSZip from "https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm";
import { removeBackground } from "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.6.0/+esm";

const fileInput = document.querySelector("#fileInput");
const dropzone = document.querySelector("#dropzone");
const languageSelect = document.querySelector("#languageSelect");
const brandCta = document.querySelector("#brandCta");
const processButton = document.querySelector("#processButton");
const pngButton = document.querySelector("#pngButton");
const zipButton = document.querySelector("#zipButton");
const clearButton = document.querySelector("#clearButton");
const imageGrid = document.querySelector("#imageGrid");
const emptyState = document.querySelector("#emptyState");
const statusText = document.querySelector("#statusText");
const proPromptButton = document.querySelector("#proPromptButton");
const inlineProCta = document.querySelector("#inlineProCta");
const progressBar = document.querySelector("#progressBar");
const countText = document.querySelector("#countText");
const proForm = document.querySelector("#proForm");
const proEmail = document.querySelector("#proEmail");
const proCompany = document.querySelector("#proCompany");
const proVolume = document.querySelector("#proVolume");
const proMessage = document.querySelector("#proMessage");
const proErrorMessage = document.querySelector("#proErrorMessage");
const feedbackOptions = document.querySelector("#feedbackOptions");
const feedbackThanks = document.querySelector("#feedbackThanks");
const postDownloadFeedback = document.querySelector("#postDownloadFeedback");
const postDownloadOptions = document.querySelector("#postDownloadOptions");
const postDownloadThanks = document.querySelector("#postDownloadThanks");

const defaultMaxFilesPerBatch = 20;
const requestedLimit = Number(new URLSearchParams(window.location.search).get("limit"));
const maxFilesPerBatch = [2, 3, 5, 10, 20].includes(requestedLimit)
  ? requestedLimit
  : defaultMaxFilesPerBatch;
const minExportSide = 1200;
const leadEndpoint = "https://formsubmit.co/ajax/ricardojvilela@gmail.com";
const proLeadConversionId = "AW-18177126609/riWOCOiI67McENHhw9tD";
const downloadZipConversionId = "AW-18177126609/2EdRCMzF7bMcENHhw9tD";
const limit20ConversionId = "AW-18177126609/prPXCPXD8LMcENHhw9tD";
const consentStorageKey = "batchcutout_consent";
const feedbackStorageKey = "batchcutout_feedback_goal";
const debugMode = new URLSearchParams(window.location.search).get("debug") === "1";
const debugEventsStorageKey = "batchcutout_debug_events";
const attributionStorageKey = "batchcutout_attribution";
let debugList;

const supportedExtensions = [
  ".jpg",
  ".jpeg",
  ".jfif",
  ".pjpeg",
  ".pjp",
  ".png",
  ".apng",
  ".webp",
  ".avif",
  ".gif",
  ".bmp",
  ".tif",
  ".tiff",
  ".svg",
  ".heic",
  ".heif",
  ".ico",
  ".cur",
];

const baseTranslation = {
  feedbackKicker: "Ajude-nos a melhorar",
  feedbackTitle: "O que procurava fazer hoje?",
  feedbackBulk: "Remover fundos em lote",
  feedbackStore: "Preparar fotos para loja",
  feedbackQuality: "Testar qualidade",
  feedbackCompare: "Comparar ferramentas",
  feedbackThanks: "Obrigado. Isto ajuda-nos a melhorar a ferramenta.",
  postDownloadKicker: "Feedback rÃƒÂ¡pido",
  postDownloadTitle: "O BatchCutout ajudou nas suas fotos?",
  postDownloadSavedTime: "Sim, poupou tempo",
  postDownloadNeedsQuality: "Precisa de melhor recorte",
  postDownloadLargerBatches: "Preciso de lotes maiores",
  postDownloadThanks: "Obrigado. A sua resposta ajuda-nos a melhorar a ferramenta.",
  benefitsLabel: "Vantagens do serviÃ§o",
  benefitPng: "PNG transparente",
  benefitZip: "ZIP pronto para loja",
  fileSuffix: "sem-fundo",
  cookieText: "Usamos mediÃ§Ã£o simples para perceber visitas e pedidos Pro. Pode aceitar ou continuar sem mediÃ§Ã£o.",
  cookieAccept: "Aceitar mediÃ§Ã£o",
  cookieDecline: "Continuar sem mediÃ§Ã£o",
};

const languageNames = {
  pt: "pt-PT",
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
  nl: "nl",
  pl: "pl",
  sv: "sv",
  da: "da",
  no: "no",
  fi: "fi",
};

const languageAliases = {
  nb: "no",
  nn: "no",
};

const translations = {
  pt: {
    ...baseTranslation,
    pageTitle: "BatchCutout - Remover fundo em lote",
    languageLabel: "Idioma",
    eyebrow: "RemoÃ§Ã£o de fundo em massa",
    title: "BatchCutout",
    lead: "Teste gr\u00e1tis: remova o fundo de at\u00e9 {limit} imagens agora. Descarregue PNGs transparentes ou um ZIP pronto para loja.",
    benefitBatch: "V\u00e1rias fotos de uma vez",
    uploadLabel: "Carregar fotos",
    startNow: "ComeÃ§ar agora",
    uploadTitle: "Carregue as suas fotos",
    clear: "Limpar",
    selectPhotos: "Arraste as fotos para come\u00e7ar",
    fileTypes: "Processa no browser. Exporta PNG ou ZIP.",
    removeBackgrounds: "Remover fundos",
    downloadPng: "Descarregar PNG",
    downloadZip: "Descarregar ZIP",
    resultsLabel: "Fotos processadas",
    queueTitle: "Fila de imagens",
    emptyState: "As imagens aparecem aqui depois da seleÃ§Ã£o.",
    photoSingular: "foto",
    photoPlural: "fotos",
    statusWaiting: "A aguardar fotos",
    statusLoaded: "Fotos carregadas",
    statusReady: "pronta",
    statusProcessing: "a processar",
    statusProcessed: "sem fundo",
    statusError: "erro ao processar",
    statusProcessingCount: "A processar {current} de {total}",
    statusReadyZip: "Pronto para descarregar ZIP",
    statusFailures: "{count} imagem(ns) com erro",
    statusPreparingZip: "A preparar ZIP",
    statusZipReady: "ZIP pronto",
    statusPngReady: "PNG pronto",
    zipFilename: "fotos-sem-fundo.zip",
  },
  en: {
    ...baseTranslation,
    pageTitle: "BatchCutout - Bulk Background Remover",
    languageLabel: "Language",
    feedbackKicker: "Help us improve",
    feedbackTitle: "What were you trying to do today?",
    feedbackBulk: "Remove backgrounds in bulk",
    feedbackStore: "Prepare store photos",
    feedbackQuality: "Test quality",
    feedbackCompare: "Compare tools",
    feedbackThanks: "Thanks. This helps us improve the tool.",
    postDownloadKicker: "Quick feedback",
    postDownloadTitle: "Did BatchCutout work for your product photos?",
    postDownloadSavedTime: "Yes, it saved time",
    postDownloadNeedsQuality: "Needs better cutout",
    postDownloadLargerBatches: "I need larger batches",
    postDownloadThanks: "Thanks. This helps us improve the tool.",
    eyebrow: "Bulk background removal",
    title: "BatchCutout",
    lead: "Free test: remove the background from up to {limit} images now. Download transparent PNGs or a store-ready ZIP.",
    benefitsLabel: "Service benefits",
    benefitBatch: "Multiple photos at once",
    benefitPng: "Transparent PNG",
    benefitZip: "Store-ready ZIP",
    uploadLabel: "Upload photos",
    startNow: "Start now",
    uploadTitle: "Upload your photos",
    clear: "Clear",
    selectPhotos: "Drag photos here to start",
    fileTypes: "Processed in your browser. Export PNG or ZIP.",
    removeBackgrounds: "Remove backgrounds",
    downloadPng: "Download PNG",
    downloadZip: "Download ZIP",
    resultsLabel: "Processed photos",
    queueTitle: "Image queue",
    emptyState: "Images will appear here after selection.",
    photoSingular: "photo",
    photoPlural: "photos",
    statusWaiting: "Waiting for photos",
    statusLoaded: "Photos loaded",
    statusReady: "ready",
    statusProcessing: "processing",
    statusProcessed: "background removed",
    statusError: "processing error",
    statusProcessingCount: "Processing {current} of {total}",
    statusReadyZip: "Ready to download ZIP",
    statusFailures: "{count} image(s) with errors",
    statusPreparingZip: "Preparing ZIP",
    statusZipReady: "ZIP ready",
    statusPngReady: "PNG ready",
    zipFilename: "background-removed-photos.zip",
    fileSuffix: "background-removed",
  },
  es: {
    ...baseTranslation,
    pageTitle: "BatchCutout - Quitar fondo por lotes",
    languageLabel: "Idioma",
    eyebrow: "EliminaciÃ³n de fondo en masa",
    title: "BatchCutout",
    lead: "Quita el fondo de muchas fotos a la vez y exporta imÃ¡genes listas para tiendas online, catÃ¡logos y redes sociales.",
    benefitsLabel: "Ventajas del servicio",
    benefitBatch: "Hecho para muchas fotos",
    benefitPng: "PNG transparente",
    benefitZip: "ZIP organizado",
    uploadLabel: "Subir fotos",
    startNow: "Empezar ahora",
    uploadTitle: "Sube tus fotos",
    clear: "Limpiar",
    selectPhotos: "Arrastra o selecciona varias fotos",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC o HEIF",
    removeBackgrounds: "Quitar fondos",
    downloadPng: "Descargar PNG",
    downloadZip: "Descargar ZIP",
    resultsLabel: "Fotos procesadas",
    queueTitle: "Cola de imÃ¡genes",
    emptyState: "Las imÃ¡genes aparecerÃ¡n aquÃ­ despuÃ©s de la selecciÃ³n.",
    photoSingular: "foto",
    photoPlural: "fotos",
    statusWaiting: "Esperando fotos",
    statusLoaded: "Fotos cargadas",
    statusReady: "lista",
    statusProcessing: "procesando",
    statusProcessed: "sin fondo",
    statusError: "error al procesar",
    statusProcessingCount: "Procesando {current} de {total}",
    statusReadyZip: "Listo para descargar ZIP",
    statusFailures: "{count} imagen(es) con error",
    statusPreparingZip: "Preparando ZIP",
    statusZipReady: "ZIP listo",
    statusPngReady: "PNG listo",
    zipFilename: "fotos-sin-fondo.zip",
    fileSuffix: "sin-fondo",
  },
  fr: {
    ...baseTranslation,
    pageTitle: "BatchCutout - Suppression d'arriÃ¨re-plan par lots",
    languageLabel: "Langue",
    eyebrow: "Suppression d'arriÃ¨re-plan en masse",
    title: "BatchCutout",
    lead: "Supprimez l'arriÃ¨re-plan de nombreuses photos en une seule fois et exportez des images prÃªtes pour les boutiques en ligne, les catalogues et les rÃ©seaux sociaux.",
    benefitsLabel: "Avantages du service",
    benefitBatch: "ConÃ§u pour de nombreuses photos",
    benefitPng: "PNG transparent",
    benefitZip: "ZIP organisÃ©",
    uploadLabel: "Importer des photos",
    startNow: "Commencer",
    uploadTitle: "Importez vos photos",
    clear: "Effacer",
    selectPhotos: "Glissez ou sÃ©lectionnez plusieurs photos",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC ou HEIF",
    removeBackgrounds: "Supprimer les arriÃ¨re-plans",
    downloadPng: "TÃ©lÃ©charger PNG",
    downloadZip: "TÃ©lÃ©charger ZIP",
    resultsLabel: "Photos traitÃ©es",
    queueTitle: "File d'images",
    emptyState: "Les images apparaÃ®tront ici aprÃ¨s la sÃ©lection.",
    photoSingular: "photo",
    photoPlural: "photos",
    statusWaiting: "En attente de photos",
    statusLoaded: "Photos chargÃ©es",
    statusReady: "prÃªte",
    statusProcessing: "traitement",
    statusProcessed: "arriÃ¨re-plan supprimÃ©",
    statusError: "erreur de traitement",
    statusProcessingCount: "Traitement de {current} sur {total}",
    statusReadyZip: "PrÃªt Ã  tÃ©lÃ©charger le ZIP",
    statusFailures: "{count} image(s) en erreur",
    statusPreparingZip: "PrÃ©paration du ZIP",
    statusZipReady: "ZIP prÃªt",
    statusPngReady: "PNG prÃªt",
    zipFilename: "photos-sans-arriere-plan.zip",
    fileSuffix: "sans-arriere-plan",
  },
  de: {
    ...baseTranslation,
    pageTitle: "BatchCutout - HintergrÃ¼nde im Stapel entfernen",
    languageLabel: "Sprache",
    eyebrow: "Hintergrundentfernung in groÃŸen Mengen",
    title: "BatchCutout",
    lead: "Entfernen Sie HintergrÃ¼nde aus vielen Fotos gleichzeitig und exportieren Sie Bilder fÃ¼r Online-Shops, Kataloge und soziale Medien.",
    benefitsLabel: "Vorteile",
    benefitBatch: "FÃ¼r viele Fotos gemacht",
    benefitPng: "Transparentes PNG",
    benefitZip: "Organisierte ZIP-Datei",
    uploadLabel: "Fotos hochladen",
    startNow: "Jetzt starten",
    uploadTitle: "Fotos hochladen",
    clear: "LÃ¶schen",
    selectPhotos: "Mehrere Fotos ziehen oder auswÃ¤hlen",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC oder HEIF",
    removeBackgrounds: "HintergrÃ¼nde entfernen",
    downloadPng: "PNG herunterladen",
    downloadZip: "ZIP herunterladen",
    resultsLabel: "Verarbeitete Fotos",
    queueTitle: "Bildwarteschlange",
    emptyState: "Die Bilder erscheinen hier nach der Auswahl.",
    photoSingular: "Foto",
    photoPlural: "Fotos",
    statusWaiting: "Warten auf Fotos",
    statusLoaded: "Fotos geladen",
    statusReady: "bereit",
    statusProcessing: "wird verarbeitet",
    statusProcessed: "Hintergrund entfernt",
    statusError: "Verarbeitungsfehler",
    statusProcessingCount: "{current} von {total} wird verarbeitet",
    statusReadyZip: "Bereit zum ZIP-Download",
    statusFailures: "{count} Bild(er) mit Fehlern",
    statusPreparingZip: "ZIP wird vorbereitet",
    statusZipReady: "ZIP bereit",
    statusPngReady: "PNG bereit",
    zipFilename: "fotos-ohne-hintergrund.zip",
    fileSuffix: "ohne-hintergrund",
  },
  it: {
    ...baseTranslation,
    pageTitle: "BatchCutout - Rimuovi sfondo in blocco",
    languageLabel: "Lingua",
    eyebrow: "Rimozione sfondo di massa",
    title: "BatchCutout",
    lead: "Rimuovi lo sfondo da molte foto contemporaneamente ed esporta immagini pronte per negozi online, cataloghi e social media.",
    benefitsLabel: "Vantaggi del servizio",
    benefitBatch: "Pensato per molte foto",
    benefitPng: "PNG trasparente",
    benefitZip: "ZIP organizzato",
    uploadLabel: "Carica foto",
    startNow: "Inizia ora",
    uploadTitle: "Carica le tue foto",
    clear: "Pulisci",
    selectPhotos: "Trascina o seleziona piÃ¹ foto",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC o HEIF",
    removeBackgrounds: "Rimuovi sfondi",
    downloadPng: "Scarica PNG",
    downloadZip: "Scarica ZIP",
    resultsLabel: "Foto elaborate",
    queueTitle: "Coda immagini",
    emptyState: "Le immagini appariranno qui dopo la selezione.",
    photoSingular: "foto",
    photoPlural: "foto",
    statusWaiting: "In attesa di foto",
    statusLoaded: "Foto caricate",
    statusReady: "pronta",
    statusProcessing: "elaborazione",
    statusProcessed: "sfondo rimosso",
    statusError: "errore di elaborazione",
    statusProcessingCount: "Elaborazione {current} di {total}",
    statusReadyZip: "Pronto per scaricare lo ZIP",
    statusFailures: "{count} immagine/i con errore",
    statusPreparingZip: "Preparazione ZIP",
    statusZipReady: "ZIP pronto",
    statusPngReady: "PNG pronto",
    zipFilename: "foto-senza-sfondo.zip",
    fileSuffix: "senza-sfondo",
  },
  nl: {
    ...baseTranslation,
    pageTitle: "BatchCutout - Achtergrond in bulk verwijderen",
    languageLabel: "Taal",
    eyebrow: "Achtergrond verwijderen in bulk",
    title: "BatchCutout",
    lead: "Verwijder achtergronden uit veel foto's tegelijk en exporteer beelden voor webshops, catalogi en sociale media.",
    benefitsLabel: "Voordelen",
    benefitBatch: "Gemaakt voor veel foto's",
    benefitPng: "Transparante PNG",
    benefitZip: "Georganiseerde ZIP",
    uploadLabel: "Foto's uploaden",
    startNow: "Nu starten",
    uploadTitle: "Upload je foto's",
    clear: "Wissen",
    selectPhotos: "Sleep of selecteer meerdere foto's",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC of HEIF",
    removeBackgrounds: "Achtergronden verwijderen",
    downloadPng: "PNG downloaden",
    downloadZip: "ZIP downloaden",
    resultsLabel: "Verwerkte foto's",
    queueTitle: "Afbeeldingswachtrij",
    emptyState: "Afbeeldingen verschijnen hier na selectie.",
    photoSingular: "foto",
    photoPlural: "foto's",
    statusWaiting: "Wachten op foto's",
    statusLoaded: "Foto's geladen",
    statusReady: "klaar",
    statusProcessing: "verwerken",
    statusProcessed: "achtergrond verwijderd",
    statusError: "verwerkingsfout",
    statusProcessingCount: "{current} van {total} verwerken",
    statusReadyZip: "Klaar om ZIP te downloaden",
    statusFailures: "{count} afbeelding(en) met fouten",
    statusPreparingZip: "ZIP voorbereiden",
    statusZipReady: "ZIP klaar",
    statusPngReady: "PNG klaar",
    zipFilename: "fotos-zonder-achtergrond.zip",
    fileSuffix: "zonder-achtergrond",
  },
  pl: {
    ...baseTranslation,
    pageTitle: "BatchCutout - Usuwanie tÅ‚a hurtowo",
    languageLabel: "JÄ™zyk",
    eyebrow: "Masowe usuwanie tÅ‚a",
    title: "BatchCutout",
    lead: "UsuÅ„ tÅ‚o z wielu zdjÄ™Ä‡ jednoczeÅ›nie i wyeksportuj obrazy gotowe do sklepÃ³w online, katalogÃ³w i mediÃ³w spoÅ‚ecznoÅ›ciowych.",
    benefitsLabel: "Zalety usÅ‚ugi",
    benefitBatch: "Stworzone dla wielu zdjÄ™Ä‡",
    benefitPng: "Przezroczysty PNG",
    benefitZip: "UporzÄ…dkowany ZIP",
    uploadLabel: "PrzeÅ›lij zdjÄ™cia",
    startNow: "Zacznij teraz",
    uploadTitle: "PrzeÅ›lij swoje zdjÄ™cia",
    clear: "WyczyÅ›Ä‡",
    selectPhotos: "PrzeciÄ…gnij lub wybierz wiele zdjÄ™Ä‡",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC lub HEIF",
    removeBackgrounds: "UsuÅ„ tÅ‚a",
    downloadPng: "Pobierz PNG",
    downloadZip: "Pobierz ZIP",
    resultsLabel: "Przetworzone zdjÄ™cia",
    queueTitle: "Kolejka obrazÃ³w",
    emptyState: "Obrazy pojawiÄ… siÄ™ tutaj po wybraniu.",
    photoSingular: "zdjÄ™cie",
    photoPlural: "zdjÄ™cia",
    statusWaiting: "Oczekiwanie na zdjÄ™cia",
    statusLoaded: "ZdjÄ™cia zaÅ‚adowane",
    statusReady: "gotowe",
    statusProcessing: "przetwarzanie",
    statusProcessed: "tÅ‚o usuniÄ™te",
    statusError: "bÅ‚Ä…d przetwarzania",
    statusProcessingCount: "Przetwarzanie {current} z {total}",
    statusReadyZip: "Gotowe do pobrania ZIP",
    statusFailures: "{count} obraz(y) z bÅ‚Ä™dem",
    statusPreparingZip: "Przygotowywanie ZIP",
    statusZipReady: "ZIP gotowy",
    statusPngReady: "PNG gotowy",
    zipFilename: "zdjecia-bez-tla.zip",
    fileSuffix: "bez-tla",
  },
  sv: {
    ...baseTranslation,
    pageTitle: "BatchCutout - Ta bort bakgrund i bulk",
    languageLabel: "SprÃ¥k",
    eyebrow: "Bakgrundsborttagning i bulk",
    title: "BatchCutout",
    lead: "Ta bort bakgrunden frÃ¥n mÃ¥nga foton samtidigt och exportera bilder fÃ¶r webbutiker, kataloger och sociala medier.",
    benefitsLabel: "FÃ¶rdelar",
    benefitBatch: "Byggt fÃ¶r mÃ¥nga foton",
    benefitPng: "Transparent PNG",
    benefitZip: "Organiserad ZIP",
    uploadLabel: "Ladda upp foton",
    startNow: "Starta nu",
    uploadTitle: "Ladda upp dina foton",
    clear: "Rensa",
    selectPhotos: "Dra eller vÃ¤lj flera foton",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC eller HEIF",
    removeBackgrounds: "Ta bort bakgrunder",
    downloadPng: "Ladda ned PNG",
    downloadZip: "Ladda ned ZIP",
    resultsLabel: "Bearbetade foton",
    queueTitle: "BildkÃ¶",
    emptyState: "Bilder visas hÃ¤r efter val.",
    photoSingular: "foto",
    photoPlural: "foton",
    statusWaiting: "VÃ¤ntar pÃ¥ foton",
    statusLoaded: "Foton laddade",
    statusReady: "klar",
    statusProcessing: "bearbetar",
    statusProcessed: "bakgrund borttagen",
    statusError: "bearbetningsfel",
    statusProcessingCount: "Bearbetar {current} av {total}",
    statusReadyZip: "Redo att ladda ned ZIP",
    statusFailures: "{count} bild(er) med fel",
    statusPreparingZip: "FÃ¶rbereder ZIP",
    statusZipReady: "ZIP klar",
    statusPngReady: "PNG klar",
    zipFilename: "foton-utan-bakgrund.zip",
    fileSuffix: "utan-bakgrund",
  },
  da: {
    ...baseTranslation,
    pageTitle: "BatchCutout - Fjern baggrund i bulk",
    languageLabel: "Sprog",
    eyebrow: "Baggrundsfjernelse i bulk",
    title: "BatchCutout",
    lead: "Fjern baggrunden fra mange fotos pÃ¥ Ã©n gang og eksportÃ©r billeder klar til webshops, kataloger og sociale medier.",
    benefitsLabel: "Fordele",
    benefitBatch: "Lavet til mange fotos",
    benefitPng: "Transparent PNG",
    benefitZip: "Organiseret ZIP",
    uploadLabel: "Upload fotos",
    startNow: "Start nu",
    uploadTitle: "Upload dine fotos",
    clear: "Ryd",
    selectPhotos: "TrÃ¦k eller vÃ¦lg flere fotos",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC eller HEIF",
    removeBackgrounds: "Fjern baggrunde",
    downloadPng: "Download PNG",
    downloadZip: "Download ZIP",
    resultsLabel: "Behandlede fotos",
    queueTitle: "BilledkÃ¸",
    emptyState: "Billederne vises her efter valg.",
    photoSingular: "foto",
    photoPlural: "fotos",
    statusWaiting: "Venter pÃ¥ fotos",
    statusLoaded: "Fotos indlÃ¦st",
    statusReady: "klar",
    statusProcessing: "behandler",
    statusProcessed: "baggrund fjernet",
    statusError: "behandlingsfejl",
    statusProcessingCount: "Behandler {current} af {total}",
    statusReadyZip: "Klar til at downloade ZIP",
    statusFailures: "{count} billede(r) med fejl",
    statusPreparingZip: "Forbereder ZIP",
    statusZipReady: "ZIP klar",
    statusPngReady: "PNG klar",
    zipFilename: "fotos-uden-baggrund.zip",
    fileSuffix: "uden-baggrund",
  },
  no: {
    ...baseTranslation,
    pageTitle: "BatchCutout - Fjern bakgrunn i bulk",
    languageLabel: "SprÃ¥k",
    eyebrow: "Bakgrunnsfjerning i bulk",
    title: "BatchCutout",
    lead: "Fjern bakgrunnen fra mange bilder samtidig og eksporter bilder klare for nettbutikker, kataloger og sosiale medier.",
    benefitsLabel: "Fordeler",
    benefitBatch: "Laget for mange bilder",
    benefitPng: "Transparent PNG",
    benefitZip: "Organisert ZIP",
    uploadLabel: "Last opp bilder",
    startNow: "Start nÃ¥",
    uploadTitle: "Last opp bildene dine",
    clear: "TÃ¸m",
    selectPhotos: "Dra eller velg flere bilder",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC eller HEIF",
    removeBackgrounds: "Fjern bakgrunner",
    downloadPng: "Last ned PNG",
    downloadZip: "Last ned ZIP",
    resultsLabel: "Behandlede bilder",
    queueTitle: "BildekÃ¸",
    emptyState: "Bildene vises her etter valg.",
    photoSingular: "bilde",
    photoPlural: "bilder",
    statusWaiting: "Venter pÃ¥ bilder",
    statusLoaded: "Bilder lastet",
    statusReady: "klar",
    statusProcessing: "behandler",
    statusProcessed: "bakgrunn fjernet",
    statusError: "behandlingsfeil",
    statusProcessingCount: "Behandler {current} av {total}",
    statusReadyZip: "Klar til Ã¥ laste ned ZIP",
    statusFailures: "{count} bilde(r) med feil",
    statusPreparingZip: "Forbereder ZIP",
    statusZipReady: "ZIP klar",
    statusPngReady: "PNG klar",
    zipFilename: "bilder-uten-bakgrunn.zip",
    fileSuffix: "uten-bakgrunn",
  },
  fi: {
    ...baseTranslation,
    pageTitle: "BatchCutout - Poista tausta erÃ¤nÃ¤",
    languageLabel: "Kieli",
    eyebrow: "Taustan poisto erÃ¤nÃ¤",
    title: "BatchCutout",
    lead: "Poista tausta monesta kuvasta kerralla ja vie kuvat verkkokauppoihin, katalogeihin ja sosiaaliseen mediaan.",
    benefitsLabel: "Palvelun edut",
    benefitBatch: "Tehty monille kuville",
    benefitPng: "LÃ¤pinÃ¤kyvÃ¤ PNG",
    benefitZip: "JÃ¤rjestetty ZIP",
    uploadLabel: "Lataa kuvat",
    startNow: "Aloita nyt",
    uploadTitle: "Lataa kuvasi",
    clear: "TyhjennÃ¤",
    selectPhotos: "VedÃ¤ tai valitse useita kuvia",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC tai HEIF",
    removeBackgrounds: "Poista taustat",
    downloadPng: "Lataa PNG",
    downloadZip: "Lataa ZIP",
    resultsLabel: "KÃ¤sitellyt kuvat",
    queueTitle: "Kuvajono",
    emptyState: "Kuvat nÃ¤kyvÃ¤t tÃ¤Ã¤llÃ¤ valinnan jÃ¤lkeen.",
    photoSingular: "kuva",
    photoPlural: "kuvaa",
    statusWaiting: "Odotetaan kuvia",
    statusLoaded: "Kuvat ladattu",
    statusReady: "valmis",
    statusProcessing: "kÃ¤sitellÃ¤Ã¤n",
    statusProcessed: "tausta poistettu",
    statusError: "kÃ¤sittelyvirhe",
    statusProcessingCount: "KÃ¤sitellÃ¤Ã¤n {current}/{total}",
    statusReadyZip: "Valmis lataamaan ZIP",
    statusFailures: "{count} kuva(a), joissa virhe",
    statusPreparingZip: "Valmistellaan ZIP",
    statusZipReady: "ZIP valmis",
    statusPngReady: "PNG valmis",
    zipFilename: "kuvat-ilman-taustaa.zip",
    fileSuffix: "ilman-taustaa",
  },
};

const translatedAddons = {
  pt: {
    trustText: "Ideal para lojas online, catÃ¡logos, marketplaces e equipas que tratam muitas imagens.",
    privacyNote: "Processamento local",
    formatNote: "VÃ¡rios formatos",
    batchLimitNote: "{limit} imagens grÃ¡tis",
    privacyLink: "Privacidade e termos",
    statusTooManyFiles: "Foram adicionadas {accepted} de {total} imagens. Para processar todas de uma vez, peÃ§a acesso Pro.",
    statusNoSupportedFiles: "Nenhum ficheiro de imagem suportado foi encontrado.",
    statusEngineLoading: "A carregar o motor de remoÃ§Ã£o. A primeira vez pode demorar mais.",
    statusError: "nÃ£o foi possÃ­vel processar. Experimente JPG, PNG ou WebP.",
    removeImage: "Remover imagem",
  },
  en: {
    trustText: "Ideal for online stores, catalogues, marketplaces, and teams handling many images.",
    privacyNote: "Local processing",
    formatNote: "Multiple formats",
    batchLimitNote: "{limit} images free",
    privacyLink: "Privacy and terms",
    statusTooManyFiles: "{accepted} of {total} images were added. To process them all at once, request Pro access.",
    statusNoSupportedFiles: "No supported image file was found.",
    statusEngineLoading: "Loading the removal engine. The first run may take longer.",
    statusError: "could not be processed. Try JPG, PNG, or WebP.",
    removeImage: "Remove image",
  },
  es: {
    trustText: "Ideal para tiendas online, catÃ¡logos, marketplaces y equipos que gestionan muchas imÃ¡genes.",
    privacyNote: "Las imÃ¡genes se procesan en tu dispositivo y no se suben a nuestros servidores.",
    formatNote: "Algunos formatos pueden depender del soporte del navegador.",
    batchLimitNote: "El modo gratuito permite hasta 20 imÃ¡genes por lote.",
    privacyLink: "Privacidad y tÃ©rminos",
    statusTooManyFiles: "El modo gratuito permite hasta 20 imÃ¡genes por lote. Para mÃ¡s volumen, solicita acceso Pro.",
    statusNoSupportedFiles: "No se encontrÃ³ ningÃºn archivo de imagen compatible.",
    statusEngineLoading: "Cargando el motor de eliminaciÃ³n. La primera vez puede tardar mÃ¡s.",
    statusError: "no se pudo procesar. Prueba JPG, PNG o WebP.",
    removeImage: "Eliminar imagen",
  },
  fr: {
    trustText: "IdÃ©al pour les boutiques en ligne, les catalogues, les marketplaces et les Ã©quipes qui traitent beaucoup d'images.",
    privacyNote: "Les images sont traitÃ©es sur votre appareil et ne sont pas envoyÃ©es Ã  nos serveurs.",
    formatNote: "Certains formats peuvent dÃ©pendre de la prise en charge du navigateur.",
    batchLimitNote: "Le mode gratuit permet jusqu'Ã  {limit} images par lot.",
    privacyLink: "ConfidentialitÃ© et conditions",
    statusTooManyFiles: "Le mode gratuit permet jusqu'Ã  {limit} images par lot. Pour plus de volume, demandez l'accÃ¨s Pro.",
    statusNoSupportedFiles: "Aucun fichier image compatible n'a Ã©tÃ© trouvÃ©.",
    statusEngineLoading: "Chargement du moteur de suppression. La premiÃ¨re fois peut prendre plus de temps.",
    statusError: "n'a pas pu Ãªtre traitÃ©. Essayez JPG, PNG ou WebP.",
    removeImage: "Supprimer l'image",
  },
  de: {
    trustText: "Ideal fÃ¼r Online-Shops, Kataloge, MarktplÃ¤tze und Teams, die viele Bilder bearbeiten.",
    privacyNote: "Bilder werden auf Ihrem GerÃ¤t verarbeitet und nicht auf unsere Server hochgeladen.",
    formatNote: "Einige Formate kÃ¶nnen von der Browser-UnterstÃ¼tzung abhÃ¤ngen.",
    batchLimitNote: "Der kostenlose Modus erlaubt bis zu {limit} Bilder pro Stapel.",
    privacyLink: "Datenschutz und Bedingungen",
    statusTooManyFiles: "Der kostenlose Modus erlaubt bis zu {limit} Bilder pro Stapel. FÃ¼r grÃ¶ÃŸere Mengen Pro-Zugang anfragen.",
    statusNoSupportedFiles: "Keine unterstÃ¼tzte Bilddatei gefunden.",
    statusEngineLoading: "Entfernungsmodul wird geladen. Der erste Lauf kann lÃ¤nger dauern.",
    statusError: "konnte nicht verarbeitet werden. Versuchen Sie JPG, PNG oder WebP.",
    removeImage: "Bild entfernen",
  },
  it: {
    trustText: "Ideale per negozi online, cataloghi, marketplace e team che gestiscono molte immagini.",
    privacyNote: "Le immagini vengono elaborate sul tuo dispositivo e non vengono caricate sui nostri server.",
    formatNote: "Alcuni formati possono dipendere dal supporto del browser.",
    batchLimitNote: "La modalitÃ  gratuita consente fino a 20 immagini per lotto.",
    privacyLink: "Privacy e termini",
    statusTooManyFiles: "La modalitÃ  gratuita consente fino a 20 immagini per lotto. Per volumi maggiori, richiedi l'accesso Pro.",
    statusNoSupportedFiles: "Nessun file immagine supportato trovato.",
    statusEngineLoading: "Caricamento del motore di rimozione. La prima volta puÃ² richiedere piÃ¹ tempo.",
    statusError: "non Ã¨ stato possibile elaborarla. Prova JPG, PNG o WebP.",
    removeImage: "Rimuovi immagine",
  },
  nl: {
    trustText: "Ideaal voor webshops, catalogi, marketplaces en teams die veel afbeeldingen verwerken.",
    privacyNote: "Afbeeldingen worden op je apparaat verwerkt en niet naar onze servers geÃ¼pload.",
    formatNote: "Sommige formaten zijn afhankelijk van browserondersteuning.",
    batchLimitNote: "De gratis modus staat maximaal {limit} afbeeldingen per batch toe.",
    privacyLink: "Privacy en voorwaarden",
    statusTooManyFiles: "De gratis modus staat maximaal {limit} afbeeldingen per batch toe. Vraag Pro-toegang aan voor grotere volumes.",
    statusNoSupportedFiles: "Geen ondersteund afbeeldingsbestand gevonden.",
    statusEngineLoading: "Verwijderingsengine laden. De eerste keer kan langer duren.",
    statusError: "kon niet worden verwerkt. Probeer JPG, PNG of WebP.",
    removeImage: "Afbeelding verwijderen",
  },
  pl: {
    trustText: "Idealne dla sklepÃ³w online, katalogÃ³w, marketplace'Ã³w i zespoÅ‚Ã³w przetwarzajÄ…cych wiele zdjÄ™Ä‡.",
    privacyNote: "Obrazy sÄ… przetwarzane na Twoim urzÄ…dzeniu i nie sÄ… przesyÅ‚ane na nasze serwery.",
    formatNote: "NiektÃ³re formaty mogÄ… zaleÅ¼eÄ‡ od obsÅ‚ugi w przeglÄ…darce.",
    batchLimitNote: "Tryb darmowy pozwala przetworzyÄ‡ do {limit} obrazÃ³w na partiÄ™.",
    privacyLink: "PrywatnoÅ›Ä‡ i warunki",
    statusTooManyFiles: "Tryb darmowy pozwala przetworzyÄ‡ do {limit} obrazÃ³w na partiÄ™. Przy wiÄ™kszych wolumenach poproÅ› o dostÄ™p Pro.",
    statusNoSupportedFiles: "Nie znaleziono obsÅ‚ugiwanego pliku obrazu.",
    statusEngineLoading: "Åadowanie silnika usuwania. Pierwsze uruchomienie moÅ¼e potrwaÄ‡ dÅ‚uÅ¼ej.",
    statusError: "nie moÅ¼na byÅ‚o przetworzyÄ‡. SprÃ³buj JPG, PNG lub WebP.",
    removeImage: "UsuÅ„ obraz",
  },
  sv: {
    trustText: "Perfekt fÃ¶r webbutiker, kataloger, marknadsplatser och team som hanterar mÃ¥nga bilder.",
    privacyNote: "Bilderna bearbetas pÃ¥ din enhet och laddas inte upp till vÃ¥ra servrar.",
    formatNote: "Vissa format kan bero pÃ¥ webblÃ¤sarens stÃ¶d.",
    batchLimitNote: "GratislÃ¤get tillÃ¥ter upp till {limit} bilder per batch.",
    privacyLink: "Integritet och villkor",
    statusTooManyFiles: "GratislÃ¤get tillÃ¥ter upp till {limit} bilder per batch. FÃ¶r stÃ¶rre volymer, begÃ¤r Pro-Ã¥tkomst.",
    statusNoSupportedFiles: "Ingen bildfil som stÃ¶ds hittades.",
    statusEngineLoading: "Laddar borttagningsmotorn. FÃ¶rsta gÃ¥ngen kan ta lÃ¤ngre tid.",
    statusError: "kunde inte bearbetas. Prova JPG, PNG eller WebP.",
    removeImage: "Ta bort bild",
  },
  da: {
    trustText: "Ideel til webshops, kataloger, markedspladser og teams, der behandler mange billeder.",
    privacyNote: "Billederne behandles pÃ¥ din enhed og uploades ikke til vores servere.",
    formatNote: "Nogle formater kan afhÃ¦nge af browserunderstÃ¸ttelse.",
    batchLimitNote: "Gratis tilstand tillader op til {limit} billeder pr. batch.",
    privacyLink: "Privatliv og vilkÃ¥r",
    statusTooManyFiles: "Gratis tilstand tillader op til {limit} billeder pr. batch. Ved stÃ¸rre mÃ¦ngder kan du anmode om Pro-adgang.",
    statusNoSupportedFiles: "Ingen understÃ¸ttet billedfil blev fundet.",
    statusEngineLoading: "IndlÃ¦ser fjernelsesmotoren. FÃ¸rste gang kan tage lÃ¦ngere tid.",
    statusError: "kunne ikke behandles. PrÃ¸v JPG, PNG eller WebP.",
    removeImage: "Fjern billede",
  },
  no: {
    trustText: "Ideelt for nettbutikker, kataloger, markedsplasser og team som hÃ¥ndterer mange bilder.",
    privacyNote: "Bildene behandles pÃ¥ enheten din og lastes ikke opp til serverne vÃ¥re.",
    formatNote: "Noen formater kan avhenge av nettleserstÃ¸tte.",
    batchLimitNote: "Gratisversjonen tillater opptil {limit} bilder per batch.",
    privacyLink: "Personvern og vilkÃ¥r",
    statusTooManyFiles: "Gratisversjonen tillater opptil {limit} bilder per batch. For stÃ¸rre volum, be om Pro-tilgang.",
    statusNoSupportedFiles: "Ingen stÃ¸ttet bildefil ble funnet.",
    statusEngineLoading: "Laster fjerningsmotoren. FÃ¸rste gang kan ta lengre tid.",
    statusError: "kunne ikke behandles. PrÃ¸v JPG, PNG eller WebP.",
    removeImage: "Fjern bilde",
  },
  fi: {
    trustText: "Ihanteellinen verkkokaupoille, katalogeille, markkinapaikoille ja tiimeille, jotka kÃ¤sittelevÃ¤t paljon kuvia.",
    privacyNote: "Kuvat kÃ¤sitellÃ¤Ã¤n laitteellasi eikÃ¤ niitÃ¤ ladata palvelimillemme.",
    formatNote: "Jotkin muodot voivat riippua selaimen tuesta.",
    batchLimitNote: "Ilmainen tila sallii enintÃ¤Ã¤n {limit} kuvaa erÃ¤ssÃ¤.",
    privacyLink: "Tietosuoja ja ehdot",
    statusTooManyFiles: "Ilmainen tila sallii enintÃ¤Ã¤n {limit} kuvaa erÃ¤ssÃ¤. Suurempia mÃ¤Ã¤riÃ¤ varten pyydÃ¤ Pro-kÃ¤yttÃ¶oikeutta.",
    statusNoSupportedFiles: "Tuettua kuvatiedostoa ei lÃ¶ytynyt.",
    statusEngineLoading: "Ladataan poistomoottoria. EnsimmÃ¤inen kerta voi kestÃ¤Ã¤ pidempÃ¤Ã¤n.",
    statusError: "ei voitu kÃ¤sitellÃ¤. Kokeile JPG-, PNG- tai WebP-muotoa.",
    removeImage: "Poista kuva",
  },
};

for (const [language, values] of Object.entries(translatedAddons)) {
  Object.assign(translations[language], values);
}

const proTranslations = {
  pt: {
    proKicker: "Para equipas e lojas",
    proTitle: "Precisa de processar centenas de fotos?",
    proLead: "Remova limites e prepare lotes maiores para catÃ¡logos, lojas online e equipas.",
    proEmailPlaceholder: "O seu email",
    proCompanyPlaceholder: "Loja ou empresa",
    proVolumeLabel: "Volume mensal estimado",
    proCta: "Quero acesso Pro",
    proLimitCta: "Pedir acesso Pro",
    proNoCommitment: "Sem compromisso. Primeiro acesso para quem trabalha com volume.",
    proMessage: "Pedido registado. Vamos contactar quando o acesso Pro estiver disponÃ­vel.",
    proErrorMessage: "O envio automÃ¡tico ainda nÃ£o estÃ¡ ativo. Vamos abrir uma mensagem de email.",
    proEmailSubject: "Interesse no BatchCutout Pro",
    proEmailBody: "Tenho interesse no acesso Pro do BatchCutout.\n\nEmail: {email}\nEmpresa: {company}\nVolume mensal estimado: {volume} imagens\nIdioma: {language}",
    brandCta: "Testar com {limit} imagens",
    inlineProCta: "Mais de {limit} imagens? PeÃ§a acesso Pro",
    emptyTitle: "Os seus PNGs transparentes aparecem aqui",
    emptyState: "Depois pode descarregar uma imagem ou exportar tudo em ZIP.",
    demoLabel: "Exemplo antes e depois",
    demoBefore: "Antes",
    demoAfter: "Depois",
    freeLimitBadge: "{limit} imagens grÃ¡tis por lote",
    audienceKicker: "Criado para volume",
    audienceTitle: "Para quem trata imagens todos os dias",
    audienceStoresTitle: "Lojas online",
    audienceStoresText: "Produto pronto para venda.",
    audienceCatalogsTitle: "CatÃ¡logos",
    audienceCatalogsText: "ColeÃ§Ãµes prontas mais depressa.",
    audienceTeamsTitle: "Equipas",
    audienceTeamsText: "Menos trabalho repetitivo.",
    faqKicker: "DÃºvidas rÃ¡pidas",
    faqTitle: "Antes de comeÃ§ar",
    faqPrivacyQ: "As fotos sÃ£o enviadas para um servidor?",
    faqPrivacyA: "NÃ£o. As imagens sÃ£o processadas no seu dispositivo.",
    faqFormatsQ: "Que formatos sÃ£o aceites?",
    faqFormatsA: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC, HEIF e outros formatos de imagem suportados pelo navegador.",
    faqVolumeQ: "Posso processar mais de {limit} imagens?",
    faqVolumeA: "O modo gratuito permite {limit} imagens por lote. Para volumes maiores, peÃ§a acesso Pro.",
  },
  en: {
    proKicker: "For teams and stores",
    proTitle: "Need to process hundreds of photos?",
    proLead: "Remove limits and prepare larger batches for catalogues, online stores, and teams.",
    proEmailPlaceholder: "Your email",
    proCompanyPlaceholder: "Store or company",
    proVolumeLabel: "Estimated monthly volume",
    proCta: "I want Pro access",
    proLimitCta: "Request Pro access",
    proNoCommitment: "No commitment. Early access for high-volume workflows.",
    proMessage: "Request registered. We will contact you when Pro access is available.",
    proErrorMessage: "Automatic submission is not active yet. We will open an email message instead.",
    proEmailSubject: "Interest in BatchCutout Pro",
    proEmailBody: "I am interested in BatchCutout Pro access.\n\nEmail: {email}\nCompany: {company}\nEstimated monthly volume: {volume} images\nLanguage: {language}",
    brandCta: "Test with {limit} images",
    inlineProCta: "More than {limit} images? Request Pro access",
    emptyTitle: "Your transparent PNGs appear here",
    emptyState: "Then download one image or export everything as a ZIP.",
    demoLabel: "Before and after example",
    demoBefore: "Before",
    demoAfter: "After",
    freeLimitBadge: "{limit} free images per batch",
    audienceKicker: "Built for volume",
    audienceTitle: "For teams handling images every day",
    audienceStoresTitle: "Online stores",
    audienceStoresText: "Products ready to sell.",
    audienceCatalogsTitle: "Catalogues",
    audienceCatalogsText: "Collections ready faster.",
    audienceTeamsTitle: "Teams",
    audienceTeamsText: "Less repetitive work.",
    faqKicker: "Quick questions",
    faqTitle: "Before you start",
    faqPrivacyQ: "Are photos sent to a server?",
    faqPrivacyA: "No. Images are processed on your device.",
    faqFormatsQ: "Which formats are supported?",
    faqFormatsA: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC, HEIF, and other image formats supported by your browser.",
    faqVolumeQ: "Can I process more than {limit} images?",
    faqVolumeA: "Free mode allows {limit} images per batch. For larger volumes, request Pro access.",
  },
};

for (const language of Object.keys(translations)) {
  Object.assign(translations[language], proTranslations[language] || proTranslations.en);
}

let items = [];
let currentLanguage = localStorage.getItem("language") || detectLanguage();
let engineHasLoaded = false;

const analyticsEvents = {
  brand_cta_clicked: { category: "engagement", label: "start_free" },
  photos_selected: { category: "upload", label: "photos_selected" },
  upload_rejected: { category: "upload", label: "upload_rejected" },
  upload: { category: "funnel", label: "upload", step: 1 },
  processar: { category: "funnel", label: "processar", step: 2 },
  download_png: { category: "funnel", label: "download_png", step: 3 },
  download_zip: { category: "funnel", label: "download_zip", step: 3 },
  limite_20: { category: "funnel", label: "limite_20", step: 4 },
  lead_pro: { category: "funnel", label: "lead_pro", step: 5 },
  background_removal_started: { category: "processing", label: "started" },
  background_removal_finished: { category: "processing", label: "finished" },
  png_downloaded: { category: "download", label: "single_png" },
  zip_downloaded: { category: "download", label: "zip" },
  pro_interest_prompt_clicked: { category: "commercial_intent", label: "pro_interest" },
  pro_lead_submitted: { category: "commercial_intent", label: "pro_lead" },
  feedback_goal_selected: { category: "feedback", label: "visitor_goal" },
  post_download_feedback_selected: { category: "feedback", label: "post_download" },
};

function trackEvent(name, detail = {}) {
  const config = analyticsEvents[name] || { category: "interaction", label: name };
  const numericValue = Number(detail.count || detail.totalInQueue || detail.accepted || detail.value || 0);
  const attributionParams = getAttributionParams();
  const eventParams = {
    event_category: config.category,
    event_label: detail.reason || detail.volume || config.label,
    funnel_step: config.step || detail.funnel_step || undefined,
    value: Number.isFinite(numericValue) ? numericValue : 0,
    language: currentLanguage,
    ...attributionParams,
    ...detail,
  };

  window.dispatchEvent(new CustomEvent("rfel:analytics", { detail: { name, ...detail } }));
  window.dataLayer?.push({ event: name, ...eventParams });
  window.gtag?.("event", name, eventParams);
  recordDebugEvent(name, eventParams);
}

function getAttributionParams() {
  const params = new URLSearchParams(window.location.search);
  const storedAttribution = getStoredAttribution();
  const attribution = {
    page_path: window.location.pathname,
    page_title: document.title,
    page_location: window.location.href.split("#")[0],
    free_limit: maxFilesPerBatch,
    limit_variant: maxFilesPerBatch === defaultMaxFilesPerBatch ? "default" : `limit_${maxFilesPerBatch}`,
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign") || params.get("source"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term"),
    gclid: params.get("gclid"),
    gbraid: params.get("gbraid"),
    wbraid: params.get("wbraid"),
    first_source: storedAttribution.first?.source,
    first_campaign: storedAttribution.first?.campaign,
    first_landing_page: storedAttribution.first?.landing_page,
    first_seen_at: storedAttribution.first?.seen_at,
    last_source: storedAttribution.last?.source,
    last_campaign: storedAttribution.last?.campaign,
    last_landing_page: storedAttribution.last?.landing_page,
    last_seen_at: storedAttribution.last?.seen_at,
  };

  return Object.fromEntries(Object.entries(attribution).filter(([, value]) => Boolean(value)));
}

function getStoredAttribution() {
  try {
    return JSON.parse(localStorage.getItem(attributionStorageKey) || "{}");
  } catch {
    return {};
  }
}

function getVisitAttribution() {
  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer && !document.referrer.includes(window.location.hostname)
    ? document.referrer
    : "";
  const source = params.get("utm_source") || params.get("source") || (params.get("gclid") ? "google" : "") || referrer || "direct";

  return {
    source,
    medium: params.get("utm_medium") || (params.get("gclid") ? "cpc" : ""),
    campaign: params.get("utm_campaign") || params.get("campaign") || "",
    content: params.get("utm_content") || "",
    term: params.get("utm_term") || "",
    gclid: params.get("gclid") || "",
    gbraid: params.get("gbraid") || "",
    wbraid: params.get("wbraid") || "",
    landing_page: window.location.href.split("#")[0],
    referrer,
    free_limit: maxFilesPerBatch,
    seen_at: new Date().toISOString(),
  };
}

function persistAttribution() {
  const current = getVisitAttribution();
  const stored = getStoredAttribution();
  const hasCampaignSignal = ["utm_source", "utm_medium", "utm_campaign", "source", "gclid", "gbraid", "wbraid"]
    .some((key) => new URLSearchParams(window.location.search).has(key));
  const next = {
    first: stored.first || current,
    last: hasCampaignSignal || !stored.last ? current : stored.last,
  };

  localStorage.setItem(attributionStorageKey, JSON.stringify(next));
  recordDebugEvent("attribution_saved", next);
}

function trackGoogleAdsConversion(sendTo, { value = 1.0, currency = "EUR" } = {}) {
  if (!sendTo) return;
  window.gtag?.("event", "conversion", {
    send_to: sendTo,
    value,
    currency,
  });
  recordDebugEvent("google_ads_conversion", { send_to: sendTo, value, currency });
}

function getDebugEvents() {
  try {
    return JSON.parse(localStorage.getItem(debugEventsStorageKey) || "[]");
  } catch {
    return [];
  }
}

function saveDebugEvents(events) {
  localStorage.setItem(debugEventsStorageKey, JSON.stringify(events.slice(-30)));
}

function renderDebugEvents() {
  if (!debugList) return;

  const events = getDebugEvents().slice(-8).reverse();
  debugList.innerHTML = events.length
    ? events
        .map((event) => `
          <li>
            <strong>${event.name}</strong>
            <span>${event.time}</span>
            <code>${JSON.stringify(event.detail)}</code>
          </li>
        `)
        .join("")
    : "<li><span>No events yet.</span></li>";
}

function recordDebugEvent(name, detail = {}) {
  if (!debugMode) return;

  const events = getDebugEvents();
  events.push({
    name,
    detail,
    time: new Date().toLocaleTimeString(),
  });
  saveDebugEvents(events);
  renderDebugEvents();
}

function initDebugPanel() {
  if (!debugMode) return;

  const panel = document.createElement("aside");
  panel.className = "debug-panel";
  panel.innerHTML = `
    <div>
      <strong>BatchCutout debug</strong>
      <button type="button">Clear</button>
    </div>
    <ul></ul>
  `;

  debugList = panel.querySelector("ul");
  panel.querySelector("button").addEventListener("click", () => {
    localStorage.removeItem(debugEventsStorageKey);
    renderDebugEvents();
  });

  document.body.append(panel);
  renderDebugEvents();
}

function trackLimit20(detail = {}) {
  trackEvent("limite_20", detail);
  trackGoogleAdsConversion(limit20ConversionId);
}

function updateConsent(consent) {
  const granted = consent === "accepted";
  localStorage.setItem(consentStorageKey, consent);
  window.gtag?.("consent", "update", {
    ad_storage: granted ? "granted" : "denied",
    ad_user_data: granted ? "granted" : "denied",
    ad_personalization: granted ? "granted" : "denied",
    analytics_storage: granted ? "granted" : "denied",
  });
}

function showConsentBanner() {
  if (localStorage.getItem(consentStorageKey)) return;

  const banner = document.createElement("section");
  banner.className = "consent-banner";
  banner.setAttribute("aria-label", "Cookie consent");
  banner.innerHTML = `
    <p>${t("cookieText")}</p>
    <div>
      <button type="button" class="consent-decline">${t("cookieDecline")}</button>
      <button type="button" class="consent-accept">${t("cookieAccept")}</button>
    </div>
  `;

  banner.querySelector(".consent-accept").addEventListener("click", () => {
    updateConsent("accepted");
    banner.remove();
    trackEvent("measurement_consent_accepted");
  });

  banner.querySelector(".consent-decline").addEventListener("click", () => {
    updateConsent("declined");
    banner.remove();
  });

  document.body.appendChild(banner);
}

function detectLanguage() {
  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const browserLanguage of browserLanguages) {
    const languageCode = browserLanguage.toLowerCase().split("-")[0];
    const normalizedCode = languageAliases[languageCode] || languageCode;

    if (translations[normalizedCode]) {
      return normalizedCode;
    }
  }

  return "en";
}

function t(key, params = {}) {
  params = { limit: maxFilesPerBatch, ...params };
  const value = translations[currentLanguage][key] || translations.pt[key] || key;

  return Object.entries(params).reduce(
    (text, [name, replacement]) => text.replace(`{${name}}`, replacement),
    value,
  );
}

function setStatus(key, progress = 0, params = {}) {
  statusText.dataset.statusKey = key;
  statusText.dataset.statusParams = JSON.stringify(params);
  statusText.textContent = t(key, params);
  progressBar.value = progress;
  proPromptButton.classList.toggle("hidden", key !== "statusTooManyFiles");
}

function refreshStatusText() {
  const key = statusText.dataset.statusKey || "statusWaiting";
  const params = JSON.parse(statusText.dataset.statusParams || "{}");
  statusText.textContent = t(key, params);
}

function applyLanguage() {
  document.documentElement.lang = languageNames[currentLanguage] || currentLanguage;
  document.title = t("pageTitle");

  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }

  for (const element of document.querySelectorAll("[data-i18n-aria]")) {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  }

  for (const element of document.querySelectorAll("[data-i18n-placeholder]")) {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  }

  languageSelect.value = currentLanguage;
  refreshStatusText();
  render();
}

function cleanName(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function isSupportedImage(file) {
  const lowerName = file.name.toLowerCase();
  return file.type.startsWith("image/") || supportedExtensions.some((extension) => lowerName.endsWith(extension));
}

async function ensureMinimumPngResolution(blob) {
  const bitmap = await createImageBitmap(blob);
  const currentMinSide = Math.min(bitmap.width, bitmap.height);

  if (currentMinSide >= minExportSide) {
    bitmap.close?.();
    return blob;
  }

  const scale = minExportSide / currentMinSide;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(bitmap.width * scale);
  canvas.height = Math.ceil(bitmap.height * scale);

  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  return new Promise((resolve, reject) => {
    canvas.toBlob((upscaledBlob) => {
      if (upscaledBlob) {
        resolve(upscaledBlob);
      } else {
        reject(new Error("PNG export failed"));
      }
    }, "image/png");
  });
}

function updateControls() {
  const hasItems = items.length > 0;
  const allReady = hasItems && items.every((item) => item.outputBlob);
  const hasPendingItems = items.some((item) => !item.outputBlob);
  const singleReady = items.length === 1 && Boolean(items[0].outputBlob);
  const running = items.some((item) => item.statusKey === "statusProcessing");

  processButton.disabled = !hasItems || !hasPendingItems || running;
  pngButton.disabled = !singleReady || running;
  zipButton.disabled = !allReady || running;
  clearButton.disabled = !hasItems || running;
  emptyState.classList.toggle("hidden", hasItems);
  countText.textContent = `${items.length} ${items.length === 1 ? t("photoSingular") : t("photoPlural")}`;
}

function render() {
  imageGrid.innerHTML = "";

  for (const [index, item] of items.entries()) {
    const card = document.createElement("article");
    card.className = "image-card";
    card.innerHTML = `
      <div class="preview">
        <img alt="" src="${item.previewUrl}">
      </div>
      <div class="card-body">
        <div class="filename" title="${item.file.name}">${item.file.name}</div>
        <div class="file-state ${item.statusClass}">${t(item.statusKey)}</div>
      </div>
    `;
    const removeButton = document.createElement("button");
    removeButton.className = "remove-image-button";
    removeButton.type = "button";
    removeButton.textContent = t("removeImage");
    removeButton.disabled = item.statusKey === "statusProcessing";
    removeButton.addEventListener("click", () => removeItem(index));
    card.querySelector(".card-body").append(removeButton);
    imageGrid.append(card);
  }

  updateControls();
}

function removeItem(index) {
  const [removedItem] = items.splice(index, 1);

  if (removedItem) {
    URL.revokeObjectURL(removedItem.previewUrl);
  }

  fileInput.value = "";

  if (!items.length) {
    setStatus("statusWaiting");
  }

  trackEvent("image_removed", { remaining: items.length });
  render();
}

function addFiles(fileList) {
  const imageFiles = [...fileList].filter(isSupportedImage);
  const availableSlots = Math.max(maxFilesPerBatch - items.length, 0);
  const acceptedFiles = imageFiles.slice(0, availableSlots);

  if (!acceptedFiles.length) {
    setStatus(imageFiles.length ? "statusTooManyFiles" : "statusNoSupportedFiles", 0, {
      accepted: 0,
      total: items.length + imageFiles.length,
    });
    render();
    if (imageFiles.length) {
      showProInterest("batch_limit");
      trackLimit20({
        accepted: 0,
        attempted: imageFiles.length,
        totalInQueue: items.length,
        reason: "batch_limit",
      });
    }
    trackEvent("upload_rejected", { reason: imageFiles.length ? "batch_limit" : "unsupported_files" });
    return;
  }

  const rejectedByLimit = imageFiles.length - acceptedFiles.length;
  const nextItems = acceptedFiles.map((file) => ({
    file,
    previewUrl: URL.createObjectURL(file),
    outputBlob: null,
    statusKey: "statusReady",
    statusClass: "",
  }));

  items = [...items, ...nextItems];
  setStatus(rejectedByLimit ? "statusTooManyFiles" : "statusLoaded", 0, {
    accepted: acceptedFiles.length,
    count: acceptedFiles.length,
    total: imageFiles.length,
  });
  if (rejectedByLimit) {
    showProInterest("batch_limit");
    trackLimit20({
      accepted: acceptedFiles.length,
      attempted: imageFiles.length,
      rejected: rejectedByLimit,
      totalInQueue: items.length,
      reason: "batch_limit",
    });
  }
  trackEvent("photos_selected", { count: acceptedFiles.length, totalInQueue: items.length });
  trackEvent("upload", { count: acceptedFiles.length, totalInQueue: items.length });
  render();
}

async function processImages() {
  trackEvent("background_removal_started", { count: items.length });
  trackEvent("processar", { count: items.length });
  processButton.disabled = true;
  pngButton.disabled = true;
  zipButton.disabled = true;
  clearButton.disabled = true;

  const total = items.length;

  for (const [index, item] of items.entries()) {
    item.statusKey = "statusProcessing";
    item.statusClass = "";
    setStatus("statusProcessingCount", Math.round((index / total) * 100), {
      current: index + 1,
      total,
    });
    render();

    try {
      if (!engineHasLoaded) {
        setStatus("statusEngineLoading", progressBar.value);
      }

      const removedBackground = await removeBackground(item.file, {
        output: {
          format: "image/png",
          quality: 1,
        },
      });
      const output = await ensureMinimumPngResolution(removedBackground);

      item.outputBlob = output;
      URL.revokeObjectURL(item.previewUrl);
      item.previewUrl = URL.createObjectURL(output);
      item.statusKey = "statusProcessed";
      item.statusClass = "ready";
      engineHasLoaded = true;
    } catch (error) {
      console.error(error);
      item.statusKey = "statusError";
      item.statusClass = "error";
      engineHasLoaded = true;
    }

    setStatus("statusProcessingCount", Math.round(((index + 1) / total) * 100), {
      current: index + 1,
      total,
    });
    render();
  }

  const failures = items.filter((item) => !item.outputBlob).length;
  setStatus(failures ? "statusFailures" : "statusReadyZip", 100, { count: failures });
  trackEvent("background_removal_finished", { count: items.length, failures });
  updateControls();
}

async function downloadZip() {
  const zip = new JSZip();
  const readyItems = items.filter((item) => item.outputBlob);

  for (const [index, item] of readyItems.entries()) {
    const baseName = cleanName(item.file.name) || `imagem-${index + 1}`;
    zip.file(`${baseName}-${t("fileSuffix")}.png`, item.outputBlob);
  }

  setStatus("statusPreparingZip", 100);
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = t("zipFilename");
  link.click();
  URL.revokeObjectURL(url);
  setStatus("statusZipReady", 100);
  trackEvent("zip_downloaded", { count: readyItems.length });
  trackEvent("download_zip", { count: readyItems.length });
  trackGoogleAdsConversion(downloadZipConversionId);
  showPostDownloadFeedback("zip", readyItems.length);
}

function downloadSinglePng() {
  const item = items[0];

  if (!item?.outputBlob) {
    return;
  }

  const baseName = cleanName(item.file.name) || "imagem";
  const url = URL.createObjectURL(item.outputBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${baseName}-${t("fileSuffix")}.png`;
  link.click();
  URL.revokeObjectURL(url);
  setStatus("statusPngReady", 100);
  trackEvent("png_downloaded", { count: 1 });
  trackEvent("download_png", { count: 1 });
  showPostDownloadFeedback("png", 1);
}

function clearAll() {
  for (const item of items) {
    URL.revokeObjectURL(item.previewUrl);
  }

  items = [];
  fileInput.value = "";
  setStatus("statusWaiting");
  trackEvent("queue_cleared");
  render();
}

function showProInterest(reason = "manual") {
  document.querySelector("#pro-title")?.scrollIntoView({ behavior: "smooth", block: "center" });
  proEmail.focus({ preventScroll: true });
  trackEvent("pro_interest_prompt_clicked", { reason, totalInQueue: items.length });
}

function selectFeedbackGoal(goal) {
  if (!goal) return;

  localStorage.setItem(feedbackStorageKey, goal);
  renderFeedbackGoal(goal);
  trackEvent("feedback_goal_selected", { goal });
}

function showPostDownloadFeedback(downloadType, count) {
  postDownloadFeedback?.classList.remove("hidden");
  postDownloadFeedback?.setAttribute("data-download-type", downloadType);
  postDownloadFeedback?.setAttribute("data-download-count", String(count));
  postDownloadFeedback?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function selectPostDownloadFeedback(answer) {
  if (!answer) return;

  const downloadType = postDownloadFeedback?.getAttribute("data-download-type") || "unknown";
  const downloadCount = Number(postDownloadFeedback?.getAttribute("data-download-count") || 0);

  for (const button of postDownloadOptions?.querySelectorAll("[data-post-download-feedback]") || []) {
    button.classList.toggle("is-selected", button.dataset.postDownloadFeedback === answer);
  }

  postDownloadThanks?.classList.remove("hidden");
  trackEvent("post_download_feedback_selected", {
    answer,
    downloadType,
    count: Number.isFinite(downloadCount) ? downloadCount : 0,
  });

  if (answer === "larger_batches") {
    showProInterest("post_download_larger_batches");
  }
}

function renderFeedbackGoal(goal) {
  for (const button of feedbackOptions?.querySelectorAll("[data-feedback-goal]") || []) {
    button.classList.toggle("is-selected", button.dataset.feedbackGoal === goal);
  }
  feedbackThanks?.classList.remove("hidden");
}

function openLeadEmail({ email, company, volume }) {
  const subject = encodeURIComponent(t("proEmailSubject"));
  const body = encodeURIComponent(t("proEmailBody", {
    email,
    company,
    volume,
    language: currentLanguage,
  }));

  window.location.href = `mailto:ricardojvilela@gmail.com?subject=${subject}&body=${body}`;
}

function trackLeadConversion(volume, hasCompany) {
  trackEvent("pro_lead_submitted", {
    volume,
    hasCompany,
    language: currentLanguage,
  });
  trackEvent("lead_pro", {
    volume,
    hasCompany,
    language: currentLanguage,
  });
  window.gtag?.("event", "generate_lead", {
    event_category: "commercial_intent",
    event_label: volume,
  });
  trackGoogleAdsConversion(proLeadConversionId);
}

async function submitProInterest(event) {
  event.preventDefault();

  if (!proEmail.checkValidity()) {
    proEmail.reportValidity();
    return;
  }

  const email = proEmail.value.trim();
  const company = proCompany.value.trim() || "-";
  const volume = proVolume.value;
  const hasCompany = company !== "-";
  const attribution = getAttributionParams();
  const lead = {
    email,
    company,
    volume,
    language: currentLanguage,
    attribution,
    submittedAt: new Date().toISOString(),
  };

  localStorage.setItem("batchcutoutProLead", JSON.stringify(lead));
  proMessage.classList.add("hidden");
  proErrorMessage.classList.add("hidden");
  proForm.querySelector("button").disabled = true;

  try {
    const response = await fetch(leadEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _subject: "Novo lead BatchCutout Pro",
        _template: "table",
        email,
        company,
        volume,
        language: currentLanguage,
        source: window.location.href,
        attribution: JSON.stringify(attribution),
        firstSource: attribution.first_source || "",
        firstCampaign: attribution.first_campaign || "",
        firstLandingPage: attribution.first_landing_page || "",
        lastSource: attribution.last_source || "",
        lastCampaign: attribution.last_campaign || "",
        lastLandingPage: attribution.last_landing_page || "",
        gclid: attribution.gclid || "",
        gbraid: attribution.gbraid || "",
        wbraid: attribution.wbraid || "",
        freeLimit: attribution.free_limit || "",
        limitVariant: attribution.limit_variant || "",
        submittedAt: lead.submittedAt,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || (data.success !== true && data.success !== "true")) {
      throw new Error("Lead submission failed");
    }

    trackLeadConversion(volume, hasCompany);
    proMessage.classList.remove("hidden");
    proMessage.textContent = t("proMessage");
    proForm.reset();
    window.location.href = "./obrigado.html";
  } catch (error) {
    console.error(error);
    trackLeadConversion(volume, hasCompany);
    proErrorMessage.classList.remove("hidden");
    proErrorMessage.textContent = t("proErrorMessage");
    openLeadEmail({ email, company, volume });
  } finally {
    proForm.querySelector("button").disabled = false;
  }
}

languageSelect.addEventListener("change", (event) => {
  currentLanguage = event.target.value;
  localStorage.setItem("language", currentLanguage);
  trackEvent("language_changed", { language: currentLanguage });
  applyLanguage();
});
fileInput.addEventListener("change", (event) => addFiles(event.target.files));
processButton.addEventListener("click", processImages);
pngButton.addEventListener("click", downloadSinglePng);
zipButton.addEventListener("click", downloadZip);
clearButton.addEventListener("click", clearAll);
proPromptButton.addEventListener("click", () => showProInterest("status_limit_cta"));
brandCta.addEventListener("click", () => {
  dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
  fileInput.focus({ preventScroll: true });
  trackEvent("brand_cta_clicked");
});
inlineProCta.addEventListener("click", () => showProInterest("inline_pro_cta"));
proForm.addEventListener("submit", submitProInterest);
feedbackOptions?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-feedback-goal]");
  selectFeedbackGoal(button?.dataset.feedbackGoal);
});
postDownloadOptions?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-post-download-feedback]");
  selectPostDownloadFeedback(button?.dataset.postDownloadFeedback);
});

for (const eventName of ["dragenter", "dragover", "dragleave", "drop"]) {
  document.addEventListener(eventName, (event) => {
    event.preventDefault();
  });
}

for (const eventName of ["dragenter", "dragover"]) {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("dragging");
  });
}

for (const eventName of ["dragleave", "drop"]) {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragging");
  });
}

dropzone.addEventListener("drop", (event) => {
  const files = event.dataTransfer?.files;

  if (files?.length) {
    addFiles(files);
  }
});

setStatus("statusWaiting");
persistAttribution();
applyLanguage();
renderFeedbackGoal(localStorage.getItem(feedbackStorageKey));
showConsentBanner();
initDebugPanel();
