import JSZip from "https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm";
import { removeBackground } from "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.6.0/+esm";

const fileInput = document.querySelector("#fileInput");
const dropzone = document.querySelector("#dropzone");
const languageSelect = document.querySelector("#languageSelect");
const processButton = document.querySelector("#processButton");
const pngButton = document.querySelector("#pngButton");
const zipButton = document.querySelector("#zipButton");
const clearButton = document.querySelector("#clearButton");
const paidAccessLink = document.querySelector("#paidAccessLink");
const imageGrid = document.querySelector("#imageGrid");
const emptyState = document.querySelector("#emptyState");
const statusText = document.querySelector("#statusText");
const progressBar = document.querySelector("#progressBar");
const countText = document.querySelector("#countText");

const maxFilesPerBatch = 50;

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
    selectPhotos: "Selecionar várias fotos",
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
    selectPhotos: "Select multiple photos",
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
    selectPhotos: "Seleccionar varias fotos",
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
    selectPhotos: "Sélectionner plusieurs photos",
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
    selectPhotos: "Mehrere Fotos auswählen",
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
    selectPhotos: "Seleziona più foto",
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
    selectPhotos: "Meerdere foto's selecteren",
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
    selectPhotos: "Wybierz wiele zdjęć",
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
    selectPhotos: "Välj flera foton",
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
    selectPhotos: "Vælg flere fotos",
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
    selectPhotos: "Velg flere bilder",
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
    selectPhotos: "Valitse useita kuvia",
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
    paidKicker: "Acesso pago em breve",
    paidTitle: "Precisa de processar imagens todas as semanas?",
    paidText: "Estamos a preparar planos para lojas e equipas que precisam de remover fundos em volume.",
    paidButton: "Pedir acesso pago",
    privacyNote: "As imagens são processadas no seu dispositivo e não são carregadas para os nossos servidores.",
    formatNote: "Alguns formatos podem depender do suporte do navegador.",
    batchLimitNote: "Para garantir estabilidade, processe até 50 imagens por lote.",
    privacyLink: "Privacidade e termos",
    statusTooManyFiles: "Limite de 50 imagens por lote. Foram adicionadas {count}.",
    statusNoSupportedFiles: "Nenhum ficheiro de imagem suportado foi encontrado.",
    statusEngineLoading: "A carregar o motor de remoção. A primeira vez pode demorar mais.",
    statusError: "não foi possível processar. Experimente JPG, PNG ou WebP.",
    removeImage: "Remover imagem",
  },
  en: {
    trustText: "Ideal for online stores, catalogues, marketplaces, and teams handling many images.",
    paidKicker: "Paid access coming soon",
    paidTitle: "Need to process images every week?",
    paidText: "We are preparing plans for stores and teams that need background removal at volume.",
    paidButton: "Request paid access",
    privacyNote: "Images are processed on your device and are not uploaded to our servers.",
    formatNote: "Some formats may depend on browser support.",
    batchLimitNote: "For stability, process up to 50 images per batch.",
    privacyLink: "Privacy and terms",
    statusTooManyFiles: "Limit of 50 images per batch. {count} were added.",
    statusNoSupportedFiles: "No supported image file was found.",
    statusEngineLoading: "Loading the removal engine. The first run may take longer.",
    statusError: "could not be processed. Try JPG, PNG, or WebP.",
    removeImage: "Remove image",
  },
  es: {
    trustText: "Ideal para tiendas online, catálogos, marketplaces y equipos que gestionan muchas imágenes.",
    paidKicker: "Acceso de pago próximamente",
    paidTitle: "¿Necesitas procesar imágenes cada semana?",
    paidText: "Estamos preparando planes para tiendas y equipos que necesitan quitar fondos en volumen.",
    paidButton: "Solicitar acceso de pago",
    privacyNote: "Las imágenes se procesan en tu dispositivo y no se suben a nuestros servidores.",
    formatNote: "Algunos formatos pueden depender del soporte del navegador.",
    batchLimitNote: "Para garantizar estabilidad, procesa hasta 50 imágenes por lote.",
    privacyLink: "Privacidad y términos",
    statusTooManyFiles: "Límite de 50 imágenes por lote. Se añadieron {count}.",
    statusNoSupportedFiles: "No se encontró ningún archivo de imagen compatible.",
    statusEngineLoading: "Cargando el motor de eliminación. La primera vez puede tardar más.",
    statusError: "no se pudo procesar. Prueba JPG, PNG o WebP.",
    removeImage: "Eliminar imagen",
  },
  fr: {
    trustText: "Idéal pour les boutiques en ligne, les catalogues, les marketplaces et les équipes qui traitent beaucoup d'images.",
    paidKicker: "Accès payant bientôt disponible",
    paidTitle: "Vous traitez des images chaque semaine ?",
    paidText: "Nous préparons des offres pour les boutiques et les équipes qui doivent supprimer des arrière-plans en volume.",
    paidButton: "Demander un accès payant",
    privacyNote: "Les images sont traitées sur votre appareil et ne sont pas envoyées à nos serveurs.",
    formatNote: "Certains formats peuvent dépendre de la prise en charge du navigateur.",
    batchLimitNote: "Pour garantir la stabilité, traitez jusqu'à 50 images par lot.",
    privacyLink: "Confidentialité et conditions",
    statusTooManyFiles: "Limite de 50 images par lot. {count} ont été ajoutées.",
    statusNoSupportedFiles: "Aucun fichier image compatible n'a été trouvé.",
    statusEngineLoading: "Chargement du moteur de suppression. La première fois peut prendre plus de temps.",
    statusError: "n'a pas pu être traité. Essayez JPG, PNG ou WebP.",
    removeImage: "Supprimer l'image",
  },
  de: {
    trustText: "Ideal für Online-Shops, Kataloge, Marktplätze und Teams, die viele Bilder bearbeiten.",
    paidKicker: "Bezahlter Zugang bald verfügbar",
    paidTitle: "Müssen Sie jede Woche Bilder bearbeiten?",
    paidText: "Wir bereiten Tarife für Shops und Teams vor, die Hintergründe in großem Umfang entfernen müssen.",
    paidButton: "Bezahlten Zugang anfragen",
    privacyNote: "Bilder werden auf Ihrem Gerät verarbeitet und nicht auf unsere Server hochgeladen.",
    formatNote: "Einige Formate können von der Browser-Unterstützung abhängen.",
    batchLimitNote: "Für stabile Ergebnisse bis zu 50 Bilder pro Stapel verarbeiten.",
    privacyLink: "Datenschutz und Bedingungen",
    statusTooManyFiles: "Limit von 50 Bildern pro Stapel. {count} wurden hinzugefügt.",
    statusNoSupportedFiles: "Keine unterstützte Bilddatei gefunden.",
    statusEngineLoading: "Entfernungsmodul wird geladen. Der erste Lauf kann länger dauern.",
    statusError: "konnte nicht verarbeitet werden. Versuchen Sie JPG, PNG oder WebP.",
    removeImage: "Bild entfernen",
  },
  it: {
    trustText: "Ideale per negozi online, cataloghi, marketplace e team che gestiscono molte immagini.",
    paidKicker: "Accesso a pagamento in arrivo",
    paidTitle: "Devi elaborare immagini ogni settimana?",
    paidText: "Stiamo preparando piani per negozi e team che devono rimuovere sfondi in volume.",
    paidButton: "Richiedi accesso a pagamento",
    privacyNote: "Le immagini vengono elaborate sul tuo dispositivo e non vengono caricate sui nostri server.",
    formatNote: "Alcuni formati possono dipendere dal supporto del browser.",
    batchLimitNote: "Per garantire stabilità, elabora fino a 50 immagini per lotto.",
    privacyLink: "Privacy e termini",
    statusTooManyFiles: "Limite di 50 immagini per lotto. Ne sono state aggiunte {count}.",
    statusNoSupportedFiles: "Nessun file immagine supportato trovato.",
    statusEngineLoading: "Caricamento del motore di rimozione. La prima volta può richiedere più tempo.",
    statusError: "non è stato possibile elaborarla. Prova JPG, PNG o WebP.",
    removeImage: "Rimuovi immagine",
  },
  nl: {
    trustText: "Ideaal voor webshops, catalogi, marketplaces en teams die veel afbeeldingen verwerken.",
    paidKicker: "Betaalde toegang binnenkort",
    paidTitle: "Moet je elke week afbeeldingen verwerken?",
    paidText: "We bereiden plannen voor winkels en teams die achtergronden op volume moeten verwijderen.",
    paidButton: "Vraag betaalde toegang aan",
    privacyNote: "Afbeeldingen worden op je apparaat verwerkt en niet naar onze servers geüpload.",
    formatNote: "Sommige formaten zijn afhankelijk van browserondersteuning.",
    batchLimitNote: "Verwerk voor stabiliteit maximaal 50 afbeeldingen per batch.",
    privacyLink: "Privacy en voorwaarden",
    statusTooManyFiles: "Limiet van 50 afbeeldingen per batch. {count} zijn toegevoegd.",
    statusNoSupportedFiles: "Geen ondersteund afbeeldingsbestand gevonden.",
    statusEngineLoading: "Verwijderingsengine laden. De eerste keer kan langer duren.",
    statusError: "kon niet worden verwerkt. Probeer JPG, PNG of WebP.",
    removeImage: "Afbeelding verwijderen",
  },
  pl: {
    trustText: "Idealne dla sklepów online, katalogów, marketplace'ów i zespołów przetwarzających wiele zdjęć.",
    paidKicker: "Płatny dostęp już wkrótce",
    paidTitle: "Przetwarzasz obrazy co tydzień?",
    paidText: "Przygotowujemy plany dla sklepów i zespołów, które usuwają tła na większą skalę.",
    paidButton: "Poproś o płatny dostęp",
    privacyNote: "Obrazy są przetwarzane na Twoim urządzeniu i nie są przesyłane na nasze serwery.",
    formatNote: "Niektóre formaty mogą zależeć od obsługi w przeglądarce.",
    batchLimitNote: "Dla stabilności przetwarzaj do 50 obrazów na partię.",
    privacyLink: "Prywatność i warunki",
    statusTooManyFiles: "Limit 50 obrazów na partię. Dodano {count}.",
    statusNoSupportedFiles: "Nie znaleziono obsługiwanego pliku obrazu.",
    statusEngineLoading: "Ładowanie silnika usuwania. Pierwsze uruchomienie może potrwać dłużej.",
    statusError: "nie można było przetworzyć. Spróbuj JPG, PNG lub WebP.",
    removeImage: "Usuń obraz",
  },
  sv: {
    trustText: "Perfekt för webbutiker, kataloger, marknadsplatser och team som hanterar många bilder.",
    paidKicker: "Betald åtkomst kommer snart",
    paidTitle: "Behöver du bearbeta bilder varje vecka?",
    paidText: "Vi förbereder planer för butiker och team som behöver ta bort bakgrunder i volym.",
    paidButton: "Begär betald åtkomst",
    privacyNote: "Bilderna bearbetas på din enhet och laddas inte upp till våra servrar.",
    formatNote: "Vissa format kan bero på webbläsarens stöd.",
    batchLimitNote: "För stabilitet, bearbeta upp till 50 bilder per batch.",
    privacyLink: "Integritet och villkor",
    statusTooManyFiles: "Gräns på 50 bilder per batch. {count} lades till.",
    statusNoSupportedFiles: "Ingen bildfil som stöds hittades.",
    statusEngineLoading: "Laddar borttagningsmotorn. Första gången kan ta längre tid.",
    statusError: "kunde inte bearbetas. Prova JPG, PNG eller WebP.",
    removeImage: "Ta bort bild",
  },
  da: {
    trustText: "Ideel til webshops, kataloger, markedspladser og teams, der behandler mange billeder.",
    paidKicker: "Betalt adgang kommer snart",
    paidTitle: "Skal du behandle billeder hver uge?",
    paidText: "Vi forbereder planer til butikker og teams, der skal fjerne baggrunde i stort omfang.",
    paidButton: "Anmod om betalt adgang",
    privacyNote: "Billederne behandles på din enhed og uploades ikke til vores servere.",
    formatNote: "Nogle formater kan afhænge af browserunderstøttelse.",
    batchLimitNote: "For stabilitet, behandl op til 50 billeder pr. batch.",
    privacyLink: "Privatliv og vilkår",
    statusTooManyFiles: "Grænse på 50 billeder pr. batch. {count} blev tilføjet.",
    statusNoSupportedFiles: "Ingen understøttet billedfil blev fundet.",
    statusEngineLoading: "Indlæser fjernelsesmotoren. Første gang kan tage længere tid.",
    statusError: "kunne ikke behandles. Prøv JPG, PNG eller WebP.",
    removeImage: "Fjern billede",
  },
  no: {
    trustText: "Ideelt for nettbutikker, kataloger, markedsplasser og team som håndterer mange bilder.",
    paidKicker: "Betalt tilgang kommer snart",
    paidTitle: "Trenger du å behandle bilder hver uke?",
    paidText: "Vi forbereder planer for butikker og team som må fjerne bakgrunner i stort volum.",
    paidButton: "Be om betalt tilgang",
    privacyNote: "Bildene behandles på enheten din og lastes ikke opp til serverne våre.",
    formatNote: "Noen formater kan avhenge av nettleserstøtte.",
    batchLimitNote: "For stabilitet, behandle opptil 50 bilder per batch.",
    privacyLink: "Personvern og vilkår",
    statusTooManyFiles: "Grense på 50 bilder per batch. {count} ble lagt til.",
    statusNoSupportedFiles: "Ingen støttet bildefil ble funnet.",
    statusEngineLoading: "Laster fjerningsmotoren. Første gang kan ta lengre tid.",
    statusError: "kunne ikke behandles. Prøv JPG, PNG eller WebP.",
    removeImage: "Fjern bilde",
  },
  fi: {
    trustText: "Ihanteellinen verkkokaupoille, katalogeille, markkinapaikoille ja tiimeille, jotka käsittelevät paljon kuvia.",
    paidKicker: "Maksullinen käyttö tulossa pian",
    paidTitle: "Käsitteletkö kuvia joka viikko?",
    paidText: "Valmistelemme paketteja kaupoille ja tiimeille, jotka poistavat taustoja suurina määrinä.",
    paidButton: "Pyydä maksullista käyttöä",
    privacyNote: "Kuvat käsitellään laitteellasi eikä niitä ladata palvelimillemme.",
    formatNote: "Jotkin muodot voivat riippua selaimen tuesta.",
    batchLimitNote: "Vakauden vuoksi käsittele enintään 50 kuvaa erässä.",
    privacyLink: "Tietosuoja ja ehdot",
    statusTooManyFiles: "Raja on 50 kuvaa erässä. Lisättiin {count}.",
    statusNoSupportedFiles: "Tuettua kuvatiedostoa ei löytynyt.",
    statusEngineLoading: "Ladataan poistomoottoria. Ensimmäinen kerta voi kestää pidempään.",
    statusError: "ei voitu käsitellä. Kokeile JPG-, PNG- tai WebP-muotoa.",
    removeImage: "Poista kuva",
  },
};

for (const [language, values] of Object.entries(translatedAddons)) {
  Object.assign(translations[language], values);
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
      count: items.length,
    });
    render();
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
    count: acceptedFiles.length,
  });
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
paidAccessLink.addEventListener("click", () => trackEvent("paid_access_requested"));

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

dropzone.addEventListener("drop", (event) => addFiles(event.dataTransfer.files));

setStatus("statusWaiting");
applyLanguage();
