import JSZip from "https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm";
import { removeBackground } from "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.6.0/+esm";

const fileInput = document.querySelector("#fileInput");
const dropzone = document.querySelector("#dropzone");
const languageSelect = document.querySelector("#languageSelect");
const processButton = document.querySelector("#processButton");
const pngButton = document.querySelector("#pngButton");
const zipButton = document.querySelector("#zipButton");
const clearButton = document.querySelector("#clearButton");
const imageGrid = document.querySelector("#imageGrid");
const emptyState = document.querySelector("#emptyState");
const statusText = document.querySelector("#statusText");
const proPromptButton = document.querySelector("#proPromptButton");
const progressBar = document.querySelector("#progressBar");
const countText = document.querySelector("#countText");
const proForm = document.querySelector("#proForm");
const proEmail = document.querySelector("#proEmail");
const proCompany = document.querySelector("#proCompany");
const proVolume = document.querySelector("#proVolume");
const proMessage = document.querySelector("#proMessage");
const proErrorMessage = document.querySelector("#proErrorMessage");

const maxFilesPerBatch = 20;
const leadEndpoint = "https://formsubmit.co/ajax/ricardojvilela@gmail.com";
const proLeadConversionId = "AW-18177126609/nCaxCPrw1rEcENHhw9tD";

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
  benefitsLabel: "Vantagens do serviço",
  benefitPng: "PNG transparente",
  benefitZip: "ZIP organizado",
  fileSuffix: "sem-fundo",
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
    eyebrow: "Remoção de fundo em massa",
    title: "BatchCutout",
    lead: "Remova fundos de várias fotos ao mesmo tempo e exporte PNGs transparentes prontos para lojas online, catálogos e redes sociais.",
    benefitBatch: "Feito para muitas fotos",
    uploadLabel: "Carregar fotos",
    startNow: "Começar agora",
    uploadTitle: "Carregue as suas fotos",
    clear: "Limpar",
    selectPhotos: "Arraste ou selecione várias fotos",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC ou HEIF",
    removeBackgrounds: "Remover fundos",
    downloadPng: "Descarregar PNG",
    downloadZip: "Descarregar ZIP",
    resultsLabel: "Fotos processadas",
    queueTitle: "Fila de imagens",
    emptyState: "As imagens aparecem aqui depois da seleção.",
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
    eyebrow: "Bulk background removal",
    title: "BatchCutout",
    lead: "Remove backgrounds from multiple photos at once and export transparent PNGs ready for online stores, catalogues, and social media.",
    benefitsLabel: "Service benefits",
    benefitBatch: "Built for many photos",
    benefitPng: "Transparent PNG",
    benefitZip: "Organised ZIP",
    uploadLabel: "Upload photos",
    startNow: "Start now",
    uploadTitle: "Upload your photos",
    clear: "Clear",
    selectPhotos: "Drag or select multiple photos",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC, or HEIF",
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
    eyebrow: "Eliminación de fondo en masa",
    title: "BatchCutout",
    lead: "Quita el fondo de muchas fotos a la vez y exporta imágenes listas para tiendas online, catálogos y redes sociales.",
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
    queueTitle: "Cola de imágenes",
    emptyState: "Las imágenes aparecerán aquí después de la selección.",
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
    pageTitle: "BatchCutout - Suppression d'arrière-plan par lots",
    languageLabel: "Langue",
    eyebrow: "Suppression d'arrière-plan en masse",
    title: "BatchCutout",
    lead: "Supprimez l'arrière-plan de nombreuses photos en une seule fois et exportez des images prêtes pour les boutiques en ligne, les catalogues et les réseaux sociaux.",
    benefitsLabel: "Avantages du service",
    benefitBatch: "Conçu pour de nombreuses photos",
    benefitPng: "PNG transparent",
    benefitZip: "ZIP organisé",
    uploadLabel: "Importer des photos",
    startNow: "Commencer",
    uploadTitle: "Importez vos photos",
    clear: "Effacer",
    selectPhotos: "Glissez ou sélectionnez plusieurs photos",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC ou HEIF",
    removeBackgrounds: "Supprimer les arrière-plans",
    downloadPng: "Télécharger PNG",
    downloadZip: "Télécharger ZIP",
    resultsLabel: "Photos traitées",
    queueTitle: "File d'images",
    emptyState: "Les images apparaîtront ici après la sélection.",
    photoSingular: "photo",
    photoPlural: "photos",
    statusWaiting: "En attente de photos",
    statusLoaded: "Photos chargées",
    statusReady: "prête",
    statusProcessing: "traitement",
    statusProcessed: "arrière-plan supprimé",
    statusError: "erreur de traitement",
    statusProcessingCount: "Traitement de {current} sur {total}",
    statusReadyZip: "Prêt à télécharger le ZIP",
    statusFailures: "{count} image(s) en erreur",
    statusPreparingZip: "Préparation du ZIP",
    statusZipReady: "ZIP prêt",
    statusPngReady: "PNG prêt",
    zipFilename: "photos-sans-arriere-plan.zip",
    fileSuffix: "sans-arriere-plan",
  },
  de: {
    ...baseTranslation,
    pageTitle: "BatchCutout - Hintergründe im Stapel entfernen",
    languageLabel: "Sprache",
    eyebrow: "Hintergrundentfernung in großen Mengen",
    title: "BatchCutout",
    lead: "Entfernen Sie Hintergründe aus vielen Fotos gleichzeitig und exportieren Sie Bilder für Online-Shops, Kataloge und soziale Medien.",
    benefitsLabel: "Vorteile",
    benefitBatch: "Für viele Fotos gemacht",
    benefitPng: "Transparentes PNG",
    benefitZip: "Organisierte ZIP-Datei",
    uploadLabel: "Fotos hochladen",
    startNow: "Jetzt starten",
    uploadTitle: "Fotos hochladen",
    clear: "Löschen",
    selectPhotos: "Mehrere Fotos ziehen oder auswählen",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC oder HEIF",
    removeBackgrounds: "Hintergründe entfernen",
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
    selectPhotos: "Trascina o seleziona più foto",
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
    pageTitle: "BatchCutout - Usuwanie tła hurtowo",
    languageLabel: "Język",
    eyebrow: "Masowe usuwanie tła",
    title: "BatchCutout",
    lead: "Usuń tło z wielu zdjęć jednocześnie i wyeksportuj obrazy gotowe do sklepów online, katalogów i mediów społecznościowych.",
    benefitsLabel: "Zalety usługi",
    benefitBatch: "Stworzone dla wielu zdjęć",
    benefitPng: "Przezroczysty PNG",
    benefitZip: "Uporządkowany ZIP",
    uploadLabel: "Prześlij zdjęcia",
    startNow: "Zacznij teraz",
    uploadTitle: "Prześlij swoje zdjęcia",
    clear: "Wyczyść",
    selectPhotos: "Przeciągnij lub wybierz wiele zdjęć",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC lub HEIF",
    removeBackgrounds: "Usuń tła",
    downloadPng: "Pobierz PNG",
    downloadZip: "Pobierz ZIP",
    resultsLabel: "Przetworzone zdjęcia",
    queueTitle: "Kolejka obrazów",
    emptyState: "Obrazy pojawią się tutaj po wybraniu.",
    photoSingular: "zdjęcie",
    photoPlural: "zdjęcia",
    statusWaiting: "Oczekiwanie na zdjęcia",
    statusLoaded: "Zdjęcia załadowane",
    statusReady: "gotowe",
    statusProcessing: "przetwarzanie",
    statusProcessed: "tło usunięte",
    statusError: "błąd przetwarzania",
    statusProcessingCount: "Przetwarzanie {current} z {total}",
    statusReadyZip: "Gotowe do pobrania ZIP",
    statusFailures: "{count} obraz(y) z błędem",
    statusPreparingZip: "Przygotowywanie ZIP",
    statusZipReady: "ZIP gotowy",
    statusPngReady: "PNG gotowy",
    zipFilename: "zdjecia-bez-tla.zip",
    fileSuffix: "bez-tla",
  },
  sv: {
    ...baseTranslation,
    pageTitle: "BatchCutout - Ta bort bakgrund i bulk",
    languageLabel: "Språk",
    eyebrow: "Bakgrundsborttagning i bulk",
    title: "BatchCutout",
    lead: "Ta bort bakgrunden från många foton samtidigt och exportera bilder för webbutiker, kataloger och sociala medier.",
    benefitsLabel: "Fördelar",
    benefitBatch: "Byggt för många foton",
    benefitPng: "Transparent PNG",
    benefitZip: "Organiserad ZIP",
    uploadLabel: "Ladda upp foton",
    startNow: "Starta nu",
    uploadTitle: "Ladda upp dina foton",
    clear: "Rensa",
    selectPhotos: "Dra eller välj flera foton",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC eller HEIF",
    removeBackgrounds: "Ta bort bakgrunder",
    downloadPng: "Ladda ned PNG",
    downloadZip: "Ladda ned ZIP",
    resultsLabel: "Bearbetade foton",
    queueTitle: "Bildkö",
    emptyState: "Bilder visas här efter val.",
    photoSingular: "foto",
    photoPlural: "foton",
    statusWaiting: "Väntar på foton",
    statusLoaded: "Foton laddade",
    statusReady: "klar",
    statusProcessing: "bearbetar",
    statusProcessed: "bakgrund borttagen",
    statusError: "bearbetningsfel",
    statusProcessingCount: "Bearbetar {current} av {total}",
    statusReadyZip: "Redo att ladda ned ZIP",
    statusFailures: "{count} bild(er) med fel",
    statusPreparingZip: "Förbereder ZIP",
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
    lead: "Fjern baggrunden fra mange fotos på én gang og eksportér billeder klar til webshops, kataloger og sociale medier.",
    benefitsLabel: "Fordele",
    benefitBatch: "Lavet til mange fotos",
    benefitPng: "Transparent PNG",
    benefitZip: "Organiseret ZIP",
    uploadLabel: "Upload fotos",
    startNow: "Start nu",
    uploadTitle: "Upload dine fotos",
    clear: "Ryd",
    selectPhotos: "Træk eller vælg flere fotos",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC eller HEIF",
    removeBackgrounds: "Fjern baggrunde",
    downloadPng: "Download PNG",
    downloadZip: "Download ZIP",
    resultsLabel: "Behandlede fotos",
    queueTitle: "Billedkø",
    emptyState: "Billederne vises her efter valg.",
    photoSingular: "foto",
    photoPlural: "fotos",
    statusWaiting: "Venter på fotos",
    statusLoaded: "Fotos indlæst",
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
    languageLabel: "Språk",
    eyebrow: "Bakgrunnsfjerning i bulk",
    title: "BatchCutout",
    lead: "Fjern bakgrunnen fra mange bilder samtidig og eksporter bilder klare for nettbutikker, kataloger og sosiale medier.",
    benefitsLabel: "Fordeler",
    benefitBatch: "Laget for mange bilder",
    benefitPng: "Transparent PNG",
    benefitZip: "Organisert ZIP",
    uploadLabel: "Last opp bilder",
    startNow: "Start nå",
    uploadTitle: "Last opp bildene dine",
    clear: "Tøm",
    selectPhotos: "Dra eller velg flere bilder",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC eller HEIF",
    removeBackgrounds: "Fjern bakgrunner",
    downloadPng: "Last ned PNG",
    downloadZip: "Last ned ZIP",
    resultsLabel: "Behandlede bilder",
    queueTitle: "Bildekø",
    emptyState: "Bildene vises her etter valg.",
    photoSingular: "bilde",
    photoPlural: "bilder",
    statusWaiting: "Venter på bilder",
    statusLoaded: "Bilder lastet",
    statusReady: "klar",
    statusProcessing: "behandler",
    statusProcessed: "bakgrunn fjernet",
    statusError: "behandlingsfeil",
    statusProcessingCount: "Behandler {current} av {total}",
    statusReadyZip: "Klar til å laste ned ZIP",
    statusFailures: "{count} bilde(r) med feil",
    statusPreparingZip: "Forbereder ZIP",
    statusZipReady: "ZIP klar",
    statusPngReady: "PNG klar",
    zipFilename: "bilder-uten-bakgrunn.zip",
    fileSuffix: "uten-bakgrunn",
  },
  fi: {
    ...baseTranslation,
    pageTitle: "BatchCutout - Poista tausta eränä",
    languageLabel: "Kieli",
    eyebrow: "Taustan poisto eränä",
    title: "BatchCutout",
    lead: "Poista tausta monesta kuvasta kerralla ja vie kuvat verkkokauppoihin, katalogeihin ja sosiaaliseen mediaan.",
    benefitsLabel: "Palvelun edut",
    benefitBatch: "Tehty monille kuville",
    benefitPng: "Läpinäkyvä PNG",
    benefitZip: "Järjestetty ZIP",
    uploadLabel: "Lataa kuvat",
    startNow: "Aloita nyt",
    uploadTitle: "Lataa kuvasi",
    clear: "Tyhjennä",
    selectPhotos: "Vedä tai valitse useita kuvia",
    fileTypes: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC tai HEIF",
    removeBackgrounds: "Poista taustat",
    downloadPng: "Lataa PNG",
    downloadZip: "Lataa ZIP",
    resultsLabel: "Käsitellyt kuvat",
    queueTitle: "Kuvajono",
    emptyState: "Kuvat näkyvät täällä valinnan jälkeen.",
    photoSingular: "kuva",
    photoPlural: "kuvaa",
    statusWaiting: "Odotetaan kuvia",
    statusLoaded: "Kuvat ladattu",
    statusReady: "valmis",
    statusProcessing: "käsitellään",
    statusProcessed: "tausta poistettu",
    statusError: "käsittelyvirhe",
    statusProcessingCount: "Käsitellään {current}/{total}",
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
    trustText: "Ideal para lojas online, catálogos, marketplaces e equipas que tratam muitas imagens.",
    privacyNote: "As imagens são processadas no seu dispositivo e não são carregadas para os nossos servidores.",
    formatNote: "Alguns formatos podem depender do suporte do navegador.",
    batchLimitNote: "O modo gratuito permite até 20 imagens por lote.",
    privacyLink: "Privacidade e termos",
    statusTooManyFiles: "Foram adicionadas {accepted} de {total} imagens. Para processar todas de uma vez, peça acesso Pro.",
    statusNoSupportedFiles: "Nenhum ficheiro de imagem suportado foi encontrado.",
    statusEngineLoading: "A carregar o motor de remoção. A primeira vez pode demorar mais.",
    statusError: "não foi possível processar. Experimente JPG, PNG ou WebP.",
    removeImage: "Remover imagem",
  },
  en: {
    trustText: "Ideal for online stores, catalogues, marketplaces, and teams handling many images.",
    privacyNote: "Images are processed on your device and are not uploaded to our servers.",
    formatNote: "Some formats may depend on browser support.",
    batchLimitNote: "Free mode allows up to 20 images per batch.",
    privacyLink: "Privacy and terms",
    statusTooManyFiles: "{accepted} of {total} images were added. To process them all at once, request Pro access.",
    statusNoSupportedFiles: "No supported image file was found.",
    statusEngineLoading: "Loading the removal engine. The first run may take longer.",
    statusError: "could not be processed. Try JPG, PNG, or WebP.",
    removeImage: "Remove image",
  },
  es: {
    trustText: "Ideal para tiendas online, catálogos, marketplaces y equipos que gestionan muchas imágenes.",
    privacyNote: "Las imágenes se procesan en tu dispositivo y no se suben a nuestros servidores.",
    formatNote: "Algunos formatos pueden depender del soporte del navegador.",
    batchLimitNote: "El modo gratuito permite hasta 20 imágenes por lote.",
    privacyLink: "Privacidad y términos",
    statusTooManyFiles: "El modo gratuito permite hasta 20 imágenes por lote. Para más volumen, solicita acceso Pro.",
    statusNoSupportedFiles: "No se encontró ningún archivo de imagen compatible.",
    statusEngineLoading: "Cargando el motor de eliminación. La primera vez puede tardar más.",
    statusError: "no se pudo procesar. Prueba JPG, PNG o WebP.",
    removeImage: "Eliminar imagen",
  },
  fr: {
    trustText: "Idéal pour les boutiques en ligne, les catalogues, les marketplaces et les équipes qui traitent beaucoup d'images.",
    privacyNote: "Les images sont traitées sur votre appareil et ne sont pas envoyées à nos serveurs.",
    formatNote: "Certains formats peuvent dépendre de la prise en charge du navigateur.",
    batchLimitNote: "Le mode gratuit permet jusqu'à 20 images par lot.",
    privacyLink: "Confidentialité et conditions",
    statusTooManyFiles: "Le mode gratuit permet jusqu'à 20 images par lot. Pour plus de volume, demandez l'accès Pro.",
    statusNoSupportedFiles: "Aucun fichier image compatible n'a été trouvé.",
    statusEngineLoading: "Chargement du moteur de suppression. La première fois peut prendre plus de temps.",
    statusError: "n'a pas pu être traité. Essayez JPG, PNG ou WebP.",
    removeImage: "Supprimer l'image",
  },
  de: {
    trustText: "Ideal für Online-Shops, Kataloge, Marktplätze und Teams, die viele Bilder bearbeiten.",
    privacyNote: "Bilder werden auf Ihrem Gerät verarbeitet und nicht auf unsere Server hochgeladen.",
    formatNote: "Einige Formate können von der Browser-Unterstützung abhängen.",
    batchLimitNote: "Der kostenlose Modus erlaubt bis zu 20 Bilder pro Stapel.",
    privacyLink: "Datenschutz und Bedingungen",
    statusTooManyFiles: "Der kostenlose Modus erlaubt bis zu 20 Bilder pro Stapel. Für größere Mengen Pro-Zugang anfragen.",
    statusNoSupportedFiles: "Keine unterstützte Bilddatei gefunden.",
    statusEngineLoading: "Entfernungsmodul wird geladen. Der erste Lauf kann länger dauern.",
    statusError: "konnte nicht verarbeitet werden. Versuchen Sie JPG, PNG oder WebP.",
    removeImage: "Bild entfernen",
  },
  it: {
    trustText: "Ideale per negozi online, cataloghi, marketplace e team che gestiscono molte immagini.",
    privacyNote: "Le immagini vengono elaborate sul tuo dispositivo e non vengono caricate sui nostri server.",
    formatNote: "Alcuni formati possono dipendere dal supporto del browser.",
    batchLimitNote: "La modalità gratuita consente fino a 20 immagini per lotto.",
    privacyLink: "Privacy e termini",
    statusTooManyFiles: "La modalità gratuita consente fino a 20 immagini per lotto. Per volumi maggiori, richiedi l'accesso Pro.",
    statusNoSupportedFiles: "Nessun file immagine supportato trovato.",
    statusEngineLoading: "Caricamento del motore di rimozione. La prima volta può richiedere più tempo.",
    statusError: "non è stato possibile elaborarla. Prova JPG, PNG o WebP.",
    removeImage: "Rimuovi immagine",
  },
  nl: {
    trustText: "Ideaal voor webshops, catalogi, marketplaces en teams die veel afbeeldingen verwerken.",
    privacyNote: "Afbeeldingen worden op je apparaat verwerkt en niet naar onze servers geüpload.",
    formatNote: "Sommige formaten zijn afhankelijk van browserondersteuning.",
    batchLimitNote: "De gratis modus staat maximaal 20 afbeeldingen per batch toe.",
    privacyLink: "Privacy en voorwaarden",
    statusTooManyFiles: "De gratis modus staat maximaal 20 afbeeldingen per batch toe. Vraag Pro-toegang aan voor grotere volumes.",
    statusNoSupportedFiles: "Geen ondersteund afbeeldingsbestand gevonden.",
    statusEngineLoading: "Verwijderingsengine laden. De eerste keer kan langer duren.",
    statusError: "kon niet worden verwerkt. Probeer JPG, PNG of WebP.",
    removeImage: "Afbeelding verwijderen",
  },
  pl: {
    trustText: "Idealne dla sklepów online, katalogów, marketplace'ów i zespołów przetwarzających wiele zdjęć.",
    privacyNote: "Obrazy są przetwarzane na Twoim urządzeniu i nie są przesyłane na nasze serwery.",
    formatNote: "Niektóre formaty mogą zależeć od obsługi w przeglądarce.",
    batchLimitNote: "Tryb darmowy pozwala przetworzyć do 20 obrazów na partię.",
    privacyLink: "Prywatność i warunki",
    statusTooManyFiles: "Tryb darmowy pozwala przetworzyć do 20 obrazów na partię. Przy większych wolumenach poproś o dostęp Pro.",
    statusNoSupportedFiles: "Nie znaleziono obsługiwanego pliku obrazu.",
    statusEngineLoading: "Ładowanie silnika usuwania. Pierwsze uruchomienie może potrwać dłużej.",
    statusError: "nie można było przetworzyć. Spróbuj JPG, PNG lub WebP.",
    removeImage: "Usuń obraz",
  },
  sv: {
    trustText: "Perfekt för webbutiker, kataloger, marknadsplatser och team som hanterar många bilder.",
    privacyNote: "Bilderna bearbetas på din enhet och laddas inte upp till våra servrar.",
    formatNote: "Vissa format kan bero på webbläsarens stöd.",
    batchLimitNote: "Gratisläget tillåter upp till 20 bilder per batch.",
    privacyLink: "Integritet och villkor",
    statusTooManyFiles: "Gratisläget tillåter upp till 20 bilder per batch. För större volymer, begär Pro-åtkomst.",
    statusNoSupportedFiles: "Ingen bildfil som stöds hittades.",
    statusEngineLoading: "Laddar borttagningsmotorn. Första gången kan ta längre tid.",
    statusError: "kunde inte bearbetas. Prova JPG, PNG eller WebP.",
    removeImage: "Ta bort bild",
  },
  da: {
    trustText: "Ideel til webshops, kataloger, markedspladser og teams, der behandler mange billeder.",
    privacyNote: "Billederne behandles på din enhed og uploades ikke til vores servere.",
    formatNote: "Nogle formater kan afhænge af browserunderstøttelse.",
    batchLimitNote: "Gratis tilstand tillader op til 20 billeder pr. batch.",
    privacyLink: "Privatliv og vilkår",
    statusTooManyFiles: "Gratis tilstand tillader op til 20 billeder pr. batch. Ved større mængder kan du anmode om Pro-adgang.",
    statusNoSupportedFiles: "Ingen understøttet billedfil blev fundet.",
    statusEngineLoading: "Indlæser fjernelsesmotoren. Første gang kan tage længere tid.",
    statusError: "kunne ikke behandles. Prøv JPG, PNG eller WebP.",
    removeImage: "Fjern billede",
  },
  no: {
    trustText: "Ideelt for nettbutikker, kataloger, markedsplasser og team som håndterer mange bilder.",
    privacyNote: "Bildene behandles på enheten din og lastes ikke opp til serverne våre.",
    formatNote: "Noen formater kan avhenge av nettleserstøtte.",
    batchLimitNote: "Gratisversjonen tillater opptil 20 bilder per batch.",
    privacyLink: "Personvern og vilkår",
    statusTooManyFiles: "Gratisversjonen tillater opptil 20 bilder per batch. For større volum, be om Pro-tilgang.",
    statusNoSupportedFiles: "Ingen støttet bildefil ble funnet.",
    statusEngineLoading: "Laster fjerningsmotoren. Første gang kan ta lengre tid.",
    statusError: "kunne ikke behandles. Prøv JPG, PNG eller WebP.",
    removeImage: "Fjern bilde",
  },
  fi: {
    trustText: "Ihanteellinen verkkokaupoille, katalogeille, markkinapaikoille ja tiimeille, jotka käsittelevät paljon kuvia.",
    privacyNote: "Kuvat käsitellään laitteellasi eikä niitä ladata palvelimillemme.",
    formatNote: "Jotkin muodot voivat riippua selaimen tuesta.",
    batchLimitNote: "Ilmainen tila sallii enintään 20 kuvaa erässä.",
    privacyLink: "Tietosuoja ja ehdot",
    statusTooManyFiles: "Ilmainen tila sallii enintään 20 kuvaa erässä. Suurempia määriä varten pyydä Pro-käyttöoikeutta.",
    statusNoSupportedFiles: "Tuettua kuvatiedostoa ei löytynyt.",
    statusEngineLoading: "Ladataan poistomoottoria. Ensimmäinen kerta voi kestää pidempään.",
    statusError: "ei voitu käsitellä. Kokeile JPG-, PNG- tai WebP-muotoa.",
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
    proLead: "Processa mais de 20 imagens por lote? Peça acesso Pro para catálogos, lojas online e equipas.",
    proEmailPlaceholder: "O seu email",
    proCompanyPlaceholder: "Loja ou empresa",
    proVolumeLabel: "Volume mensal estimado",
    proCta: "Quero acesso Pro",
    proLimitCta: "Pedir acesso Pro",
    proNoCommitment: "Sem compromisso. Serve apenas para avisar quando o acesso Pro estiver disponível.",
    proMessage: "Pedido registado. Vamos contactar quando o acesso Pro estiver disponível.",
    proErrorMessage: "O envio automático ainda não está ativo. Vamos abrir uma mensagem de email.",
    proEmailSubject: "Interesse no BatchCutout Pro",
    proEmailBody: "Tenho interesse no acesso Pro do BatchCutout.\n\nEmail: {email}\nEmpresa: {company}\nVolume mensal estimado: {volume} imagens\nIdioma: {language}",
    demoBefore: "Antes",
    demoAfter: "Depois",
    audienceKicker: "Criado para volume",
    audienceTitle: "Para quem trata imagens todos os dias",
    audienceStoresTitle: "Lojas online",
    audienceStoresText: "Fotos de produto com fundo limpo para páginas de venda.",
    audienceCatalogsTitle: "Catálogos",
    audienceCatalogsText: "Preparação rápida de imagens para coleções e campanhas.",
    audienceTeamsTitle: "Equipas",
    audienceTeamsText: "Fluxo simples para quem recebe muitas fotos de uma só vez.",
    faqKicker: "Dúvidas rápidas",
    faqTitle: "Antes de começar",
    faqPrivacyQ: "As fotos são enviadas para um servidor?",
    faqPrivacyA: "Não. As imagens são processadas no seu dispositivo.",
    faqFormatsQ: "Que formatos são aceites?",
    faqFormatsA: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC, HEIF e outros formatos de imagem suportados pelo navegador.",
    faqVolumeQ: "Posso processar mais de 20 imagens?",
    faqVolumeA: "O modo gratuito permite 20 imagens por lote. Para volumes maiores, peça acesso Pro.",
  },
  en: {
    proKicker: "For teams and stores",
    proTitle: "Need to process hundreds of photos?",
    proLead: "Processing more than 20 images per batch? Request Pro access for catalogues, online stores, and teams.",
    proEmailPlaceholder: "Your email",
    proCompanyPlaceholder: "Store or company",
    proVolumeLabel: "Estimated monthly volume",
    proCta: "I want Pro access",
    proLimitCta: "Request Pro access",
    proNoCommitment: "No commitment. This only lets us notify you when Pro access is available.",
    proMessage: "Request registered. We will contact you when Pro access is available.",
    proErrorMessage: "Automatic submission is not active yet. We will open an email message instead.",
    proEmailSubject: "Interest in BatchCutout Pro",
    proEmailBody: "I am interested in BatchCutout Pro access.\n\nEmail: {email}\nCompany: {company}\nEstimated monthly volume: {volume} images\nLanguage: {language}",
    demoBefore: "Before",
    demoAfter: "After",
    audienceKicker: "Built for volume",
    audienceTitle: "For teams handling images every day",
    audienceStoresTitle: "Online stores",
    audienceStoresText: "Clean product photos for sales pages.",
    audienceCatalogsTitle: "Catalogues",
    audienceCatalogsText: "Fast image preparation for collections and campaigns.",
    audienceTeamsTitle: "Teams",
    audienceTeamsText: "A simple workflow for many photos at once.",
    faqKicker: "Quick questions",
    faqTitle: "Before you start",
    faqPrivacyQ: "Are photos sent to a server?",
    faqPrivacyA: "No. Images are processed on your device.",
    faqFormatsQ: "Which formats are supported?",
    faqFormatsA: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC, HEIF, and other image formats supported by your browser.",
    faqVolumeQ: "Can I process more than 20 images?",
    faqVolumeA: "Free mode allows 20 images per batch. For larger volumes, request Pro access.",
  },
};

for (const language of Object.keys(translations)) {
  Object.assign(translations[language], proTranslations[language] || proTranslations.en);
}

let items = [];
let currentLanguage = localStorage.getItem("language") || detectLanguage();
let engineHasLoaded = false;

function trackEvent(name, detail = {}) {
  window.dispatchEvent(new CustomEvent("rfel:analytics", { detail: { name, ...detail } }));
  window.dataLayer?.push({ event: name, ...detail });
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

function updateControls() {
  const hasItems = items.length > 0;
  const allReady = hasItems && items.every((item) => item.outputBlob);
  const singleReady = items.length === 1 && Boolean(items[0].outputBlob);
  const running = items.some((item) => item.statusKey === "statusProcessing");

  processButton.disabled = !hasItems || running;
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
  }
  trackEvent("photos_selected", { count: acceptedFiles.length, totalInQueue: items.length });
  render();
}

async function processImages() {
  trackEvent("background_removal_started", { count: items.length });
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

      const output = await removeBackground(item.file, {
        output: {
          format: "image/png",
          quality: 1,
        },
      });

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
  window.gtag?.("event", "generate_lead", {
    event_category: "commercial_intent",
    event_label: volume,
  });
  window.gtag?.("event", "pro_lead_submitted", {
    event_category: "commercial_intent",
    event_label: volume,
  });
  window.gtag?.("event", "conversion", {
    send_to: proLeadConversionId,
    value: 1.0,
    currency: "EUR",
  });
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
  const lead = {
    email,
    company,
    volume,
    language: currentLanguage,
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
proForm.addEventListener("submit", submitProInterest);

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
applyLanguage();
