import JSZip from "https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm";
import { removeBackground } from "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.6.0/+esm";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const fileInput = document.querySelector("#fileInput");
const dropzone = document.querySelector("#dropzone");
const dropzoneBadge = document.querySelector(".dropzone-badge");
const dropzoneHelper = document.querySelector(".dropzone-helper");
const languageSelect = document.querySelector("#languageSelect");
const brandCta = document.querySelector("#brandCta");
const brandLead = document.querySelector(".lead");
const brandProLink = document.querySelector(".brand-pro-link");
const freeTestFlow = document.querySelector(".free-test-flow");
const proSubscriberPromoBlocks = document.querySelectorAll("[data-pro-subscriber-promo]");
const processButton = document.querySelector("#processButton");
const pngButton = document.querySelector("#pngButton");
const zipButton = document.querySelector("#zipButton");
const downloadReadyHint = document.querySelector("#downloadReadyHint");
const clearButton = document.querySelector("#clearButton");
const imageGrid = document.querySelector("#imageGrid");
const emptyState = document.querySelector("#emptyState");
const statusText = document.querySelector("#statusText");
const proPromptButton = document.querySelector("#proPromptButton");
const statusVolumeContact = document.querySelector("#statusVolumeContact");
const inlineProCta = document.querySelector("#inlineProCta");
const zipProCta = document.querySelector("#zipProCta");
const progressBar = document.querySelector("#progressBar");
const countText = document.querySelector("#countText");
const postDownloadNextPanel = document.querySelector("#postDownloadNextPanel");
const postDownloadFounderCta = document.querySelector("#postDownloadFounderCta");
const postDownloadSaveLinkCta = document.querySelector("#postDownloadSaveLinkCta");
const postDownloadEmailForm = document.querySelector("#postDownloadEmailForm");
const postDownloadEmail = document.querySelector("#postDownloadEmail");
const postDownloadEmailMessage = document.querySelector("#postDownloadEmailMessage");
const postDownloadFeedback = document.querySelector("#postDownloadFeedback");
const postDownloadOptions = document.querySelector("#postDownloadOptions");
const postDownloadThanks = document.querySelector("#postDownloadThanks");
const leadCapturePanel = document.querySelector("#leadCapturePanel");
const leadCaptureForm = document.querySelector("#leadCaptureForm");
const leadCaptureEmail = document.querySelector("#leadCaptureEmail");
const leadCaptureDismiss = document.querySelector("#leadCaptureDismiss");
const leadCaptureMessage = document.querySelector("#leadCaptureMessage");
const proInterestPanel = document.querySelector("#proInterestPanel");
const proInlineForm = document.querySelector("#proInlineForm");
const proInlineMessage = document.querySelector("#proInlineMessage");
const proInlineSuccessCard = document.querySelector("#proInlineSuccessCard");
const accountPanel = document.querySelector("#accountPanel");
const accountBadge = document.querySelector("#accountBadge");
const accountStatus = document.querySelector("#accountStatus");
const accountMessage = document.querySelector("#accountMessage");
const accountForm = document.querySelector("#accountForm");
const accountEmail = document.querySelector("#accountEmail");
const accountPassword = document.querySelector("#accountPassword");
const accountSubmit = document.querySelector("#accountSubmit");
const accountCreate = document.querySelector("#accountCreate");
const accountActions = document.querySelector("#accountActions");
const accountRefresh = document.querySelector("#accountRefresh");
const accountLogout = document.querySelector("#accountLogout");
const billingActions = document.querySelector("#billingActions");
const billingPortal = document.querySelector("#billingPortal");
const batchLimitNote = document.querySelector("[data-i18n='batchLimitNote']");

const defaultMaxFilesPerBatch = 2;
const pageParams = new URLSearchParams(window.location.search);
const requestedLimit = Number(pageParams.get("limit"));
const requestedCheckoutPlan = pageParams.get("checkout_plan");
const checkoutStatus = pageParams.get("checkout");
const checkoutSessionId = pageParams.get("session_id");
const checkoutPlans = new Set(["monthly", "annual", "early"]);
let maxFilesPerBatch = [2, 3, 5, 10, 20].includes(requestedLimit)
  ? requestedLimit
  : defaultMaxFilesPerBatch;
const minExportSide = 1200;
const defaultProBatchLimit = 100;
const defaultProMonthlyLimit = 2000;
const downloadZipConversionId = "AW-18177126609/2EdRCMzF7bMcENHhw9tD";
const batchLimitConversionId = "AW-18177126609/prPXCPXD8LMcENHhw9tD";
const paidSubscriptionConversionId = "AW-18177126609/fpcoCP2kmMgcENHhw9tD";
const consentStorageKey = "batchcutout_consent";
const debugMode = pageParams.get("debug") === "1";
const debugEventsStorageKey = "batchcutout_debug_events";
const attributionStorageKey = "batchcutout_attribution";
const visitorStorageKey = "batchcutout_visitor_id";
const sessionStorageKey = "batchcutout_session_id";
const paidConversionStorageKey = "batchcutout_paid_conversion_sessions";
const leadCaptureEmailStorageKey = "batchcutout_lead_capture_email";
const leadCaptureDismissedStorageKey = "batchcutout_lead_capture_dismissed";
const pendingCheckoutPlanStorageKey = "batchcutout_pending_checkout_plan";
const serverEventNames = new Set([
  "tool_page_view",
  "tool_drag_upload_intent",
  "tool_upload_started",
  "tool_upload_added",
  "download_ready_shown",
  "batch_limit_exceeded",
  "tool_processing_started",
  "tool_processing_completed",
  "tool_download_png",
  "tool_download_zip",
  "post_download_next_shown",
  "post_download_founder_clicked",
  "post_download_save_link_clicked",
  "tool_pro_clicked",
  "monthly_limit_reached",
  "high_volume_contact_clicked",
  "pro_prompt_shown",
  "pro_form_started",
  "pro_submit_attempt",
  "pro_checkout_login_required",
  "pro_checkout_started",
  "pro_purchase_conversion_sent",
  "lead_capture_shown",
  "lead_capture_submitted",
  "lead_capture_dismissed",
  "lead_capture_invalid",
  "billing_portal_opened",
  "account_signup_started",
  "account_signup_succeeded",
  "account_signup_failed",
  "account_login_succeeded",
  "account_login_failed",
]);
let debugList;
let supabaseClient = null;
let authConfig = null;
let currentAccount = null;
let lastUsageReservation = null;
let hasStartedRequestedCheckout = false;
let hasTrackedRequestedCheckoutLoginRequired = false;

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
  parentBrand: "Um produto NexaFlow Labs",
  feedbackTitle: "O que procurava fazer hoje?",
  feedbackBulk: "Remover fundos em lote",
  feedbackStore: "Preparar fotos para loja",
  feedbackQuality: "Testar qualidade",
  feedbackCompare: "Comparar ferramentas",
  feedbackThanks: "Obrigado. Isto ajuda-nos a melhorar a ferramenta.",
  postDownloadKicker: "Feedback rápido",
  postDownloadTitle: "O BatchCutout ajudou nas suas fotos?",
  postDownloadSavedTime: "Sim, poupou tempo",
  postDownloadNeedsQuality: "Precisa de melhor recorte",
  postDownloadLargerBatches: "Preciso de lotes maiores",
  postDownloadThanks: "Obrigado. A sua resposta ajuda-nos a melhorar a ferramenta.",
  postDownloadNextKicker: "Próximo lote",
  postDownloadNextTitle: "Resultado descarregado. Quer repetir isto em mais produtos?",
  postDownloadNextText: "O plano fundador desbloqueia lotes até 100 imagens e 2.000 imagens por mês. Se ainda está a avaliar, guarde o link por email.",
  postDownloadFounderCta: "Ativar fundador - 15 EUR/mês",
  postDownloadSaveLinkCta: "Enviar link por email",
  postDownloadNextNote: "Sem cartão no teste grátis. Pagamento seguro por Stripe quando escolher Pro.",
  leadCaptureKicker: "Guardar contacto",
  leadCaptureTitle: "Quer guardar este fluxo para voltar depois?",
  leadCaptureText: "Deixe o email e enviamos o link da ferramenta e dicas úteis para preparar fotos de produto em lote.",
  leadCapturePlaceholder: "O seu email",
  leadCaptureSubmit: "Guardar link",
  leadCaptureDismiss: "Agora não",
  leadCaptureNote: "Pode pedir remoção respondendo ao email. Não enviamos as suas imagens.",
  leadCaptureSuccess: "Pedido guardado. Deve receber o link do BatchCutout dentro de instantes.",
  leadCaptureInvalid: "Introduza um email válido.",
  proInlineKicker: "BatchCutout Pro",
  proInlineTitle: "Transforme este teste em produção por 15 EUR/mês",
  proInlineLead: "Já viu o resultado com fotos reais. O plano fundador desbloqueia lotes até 100 imagens para catálogos, variantes e marketplaces.",
  proInlineBenefits: "Plano fundador 15 EUR/mês. Pro mensal 19 EUR/mês. Anual 190 EUR/ano.",
  proPlanContrastLabel: "Comparação entre grátis e Pro",
  proFreeLabel: "Grátis",
  proFreeLimit: "2 imagens por lote",
  proBatchLabel: "Pro",
  proBatchLimit: "100 imagens por lote",
  proMonthlyLabel: "Mensal",
  proMonthlyLimit: "2.000 imagens por mês",
  proCancelLabel: "Controlo",
  proCancelText: "Cancele quando quiser",
  proEmailPlaceholder: "O seu email",
  proInlineButton: "Comprar Pro",
  proInlineSuccess: "A abrir pagamento Pro.",
  proInlineSuccessTitle: "Pagamento seguro",
  proInlineSuccessDetail: "Depois do pagamento, o acesso Pro é ativado automaticamente na conta.",
  proInlineError: "Não foi possível enviar automaticamente. Vamos abrir uma mensagem de email.",
  downloadReadyHint: "Resultado pronto. Para repetir este fluxo com mais produtos, o Pro desbloqueia 100 imagens por lote.",
  zipProCta: "Processar até 100 imagens por lote - desde 15 EUR/mês",
  benefitsLabel: "Vantagens do serviço",
  benefitPng: "PNG transparente",
  benefitZip: "ZIP pronto para loja",
  fileSuffix: "sem-fundo",
  cookieText: "Usamos medição simples para perceber visitas e adesões Pro. Pode aceitar ou continuar sem medição.",
  cookieAccept: "Aceitar medição",
  cookieDecline: "Continuar sem medição",
  accountKicker: "Acesso Pro",
  accountBadgeGuest: "Sem sessão",
  accountBadgeFree: "Grátis",
  accountBadgePro: "Pro",
  accountStatusGuest: "Crie conta para ativar Pro ou entre para gerir o seu acesso.",
  accountStatusLoading: "A verificar a sua conta...",
  accountStatusFree: "Conta gratuita. O Pro ativa até 100 imagens por lote e 2.000 imagens por mês.",
  accountStatusPro: "Conta Pro ativa. Até {batchLimit} imagens por lote e {monthlyRemaining} de {monthlyLimit} disponíveis este mês.",
  accountStatusConfigMissing: "Login Pro ainda não configurado neste ambiente.",
  accountEmailPlaceholder: "O seu email",
  accountPasswordPlaceholder: "A sua password",
  accountSubmit: "Entrar",
  accountSubmitSending: "A entrar...",
  accountCreate: "Criar conta e continuar",
  accountCreateSending: "A criar conta...",
  accountRefresh: "Atualizar conta",
  accountLogout: "Sair",
  billingEarly: "Plano fundador - 15 EUR/mês (melhor entrada)",
  billingMonthly: "Pro mensal - 19 EUR/mês",
  billingAnnual: "Pro anual - 190 EUR/ano",
  billingPortal: "Gerir pagamento",
  billingCheckoutStarting: "A abrir pagamento...",
  billingPortalStarting: "A abrir gestão de pagamento...",
  billingCheckoutSuccess: "Pagamento recebido. A ativação Pro pode demorar alguns segundos.",
  billingCheckoutCancelled: "Pagamento cancelado. Pode tentar novamente quando quiser.",
  billingLoginRequired: "Crie conta ou entre. Depois abrimos automaticamente o plano Pro escolhido.",
  billingCheckoutError: "Não foi possível abrir o pagamento agora.",
  billingPortalError: "Não foi possível abrir a gestão de pagamento agora.",
  accountMagicLinkSent: "Sessão iniciada.",
  accountSignupSuccess: "Conta criada. Se a confirmação de email estiver ativa, verifique a sua caixa de entrada antes de entrar.",
  accountSignupReady: "Conta criada. A abrir o pagamento Pro escolhido...",
  accountSignupReadyNoPlan: "Conta criada. Escolha o plano Pro quando quiser ativar os limites pagos.",
  accountLoggedOut: "Sessão terminada.",
  accountAuthError: "Não foi possível entrar. Confirme a password ou crie conta se ainda não tiver.",
  accountSignupError: "Não foi possível criar a conta. Se este email já existir, use Entrar.",
  accountReserveError: "A sua conta não permite este lote neste momento.",
  accountMonthlyLimitReached: "A sua conta Pro atingiu o limite mensal de {monthlyLimit} imagens.",
  volumeContactCta: "Falar sobre volume maior",
  volumeContactEmailSubject: "BatchCutout - preciso de mais volume",
  volumeContactEmailBody: "Olá,\n\nA minha conta Pro atingiu o limite mensal e preciso de avaliar mais volume.\n\nEmail da conta: {email}\nLimite mensal atual: {monthlyLimit} imagens\nImagens restantes: {monthlyRemaining}\n\nFonte: {source}\n\nObrigado.",
  statusTooManyFilesPro: "O seu acesso atual permite até {limit} imagens por lote.",
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
    lead: "Plano gr\u00e1tis: remova o fundo de at\u00e9 {limit} imagens agora. Descarregue PNGs transparentes ou um ZIP pronto para loja.",
    benefitBatch: "V\u00e1rias fotos de uma vez",
    uploadLabel: "Carregar fotos",
    startNow: "Começar agora",
    uploadTitle: "Carregue as suas fotos",
    clear: "Limpar",
    selectPhotos: "Arraste as fotos para come\u00e7ar",
    fileTypes: "Processa no browser. Exporta PNG ou ZIP.",
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
    parentBrand: "A NexaFlow Labs product",
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
    postDownloadNextKicker: "Next batch",
    postDownloadNextTitle: "Result downloaded. Want to repeat this for more products?",
    postDownloadNextText: "The founder plan unlocks batches up to 100 images and 2,000 images per month. If you are still evaluating, save the link by email.",
    postDownloadFounderCta: "Start founder plan - EUR 15/month",
    postDownloadSaveLinkCta: "Send link by email",
    postDownloadNextNote: "No card for the free test. Secure Stripe payment when you choose Pro.",
    leadCaptureKicker: "Stay in touch",
    leadCaptureTitle: "Want to save this workflow for later?",
    leadCaptureText: "Leave your email and we will send the tool link plus useful tips for preparing product photos in batches.",
    leadCapturePlaceholder: "Your email",
    leadCaptureSubmit: "Save link",
    leadCaptureDismiss: "Not now",
    leadCaptureNote: "You can opt out by replying to the email. We do not send your images.",
    leadCaptureSuccess: "Saved. You should receive the BatchCutout link shortly.",
    leadCaptureInvalid: "Enter a valid email.",
    cookieText: "We use simple measurement to understand visits and Pro signups. You can accept or continue without measurement.",
    cookieAccept: "Accept measurement",
    cookieDecline: "Continue without measurement",
    proInlineKicker: "BatchCutout Pro",
    proInlineTitle: "Turn this test into production for EUR 15/month",
    proInlineLead: "You have seen the result with real photos. The founder plan unlocks batches up to 100 images for catalogs, variants, and marketplaces.",
    proInlineBenefits: "Founder plan EUR 15/month. Monthly Pro EUR 19/month. Annual EUR 190/year.",
    proPlanContrastLabel: "Free versus Pro comparison",
    proFreeLabel: "Free",
    proFreeLimit: "2 images per batch",
    proBatchLabel: "Pro",
    proBatchLimit: "100 images per batch",
    proMonthlyLabel: "Monthly",
    proMonthlyLimit: "2,000 images per month",
    proCancelLabel: "Control",
    proCancelText: "Cancel anytime",
    proEmailPlaceholder: "Your email",
    proInlineButton: "Buy Pro",
    proInlineSuccess: "Opening Pro payment.",
    proInlineSuccessTitle: "Secure payment",
    proInlineSuccessDetail: "After payment, Pro access is activated automatically on your account.",
    proInlineError: "We could not submit automatically. Opening an email draft instead.",
    accountKicker: "Pro access",
    accountBadgeGuest: "No session",
    accountBadgeFree: "Free",
    accountBadgePro: "Pro",
    accountStatusGuest: "Create an account to activate Pro, or sign in to manage your access.",
    accountStatusLoading: "Checking your account...",
    accountStatusFree: "Free account. Pro unlocks up to 100 images per batch and 2,000 images per month.",
    accountStatusPro: "Pro account active. Up to {batchLimit} images per batch and {monthlyRemaining} of {monthlyLimit} available this month.",
    accountStatusConfigMissing: "Pro login is not configured in this environment yet.",
    accountEmailPlaceholder: "Your email",
    accountPasswordPlaceholder: "Your password",
    accountSubmit: "Sign in",
    accountSubmitSending: "Signing in...",
    accountCreate: "Create account and continue",
    accountCreateSending: "Creating account...",
    accountRefresh: "Refresh account",
    accountLogout: "Sign out",
    billingEarly: "Founder plan - EUR 15/month (best start)",
    billingMonthly: "Pro monthly - EUR 19/month",
    billingAnnual: "Pro annual - EUR 190/year",
    billingPortal: "Manage payment",
    billingCheckoutStarting: "Opening payment...",
    billingPortalStarting: "Opening billing...",
    billingCheckoutSuccess: "Payment received. Pro activation can take a few seconds.",
    billingCheckoutCancelled: "Payment cancelled. You can try again whenever you want.",
    billingLoginRequired: "Create an account or sign in. Then we automatically open the Pro plan you chose.",
    billingCheckoutError: "We could not open payment right now.",
    billingPortalError: "We could not open billing management right now.",
    accountMagicLinkSent: "Signed in.",
    accountSignupSuccess: "Account created. If email confirmation is enabled, check your inbox before signing in.",
    accountSignupReady: "Account created. Opening the Pro payment you chose...",
    accountSignupReadyNoPlan: "Account created. Choose a Pro plan whenever you want to activate paid limits.",
    accountLoggedOut: "Signed out.",
    accountAuthError: "We could not sign you in. Check the password or create an account if you do not have one yet.",
    accountSignupError: "We could not create the account. If this email already exists, use Sign in.",
    accountReserveError: "Your account does not allow this batch right now.",
    accountMonthlyLimitReached: "Your Pro account reached the monthly limit of {monthlyLimit} images.",
    volumeContactCta: "Talk about higher volume",
    volumeContactEmailSubject: "BatchCutout - I need more volume",
    volumeContactEmailBody: "Hi,\n\nMy Pro account reached the monthly limit and I need to evaluate more volume.\n\nAccount email: {email}\nCurrent monthly limit: {monthlyLimit} images\nImages remaining: {monthlyRemaining}\n\nSource: {source}\n\nThanks.",
    statusTooManyFilesPro: "Your current access allows up to {limit} images per batch.",
    downloadReadyHint: "Result ready. To repeat this workflow with more products, Pro unlocks 100 images per batch.",
    zipProCta: "Process up to 100 images per batch - from EUR 15/month",
    eyebrow: "Bulk background removal",
    title: "BatchCutout",
    lead: "Free plan: remove the background from up to {limit} images now. Download transparent PNGs or a store-ready ZIP.",
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
    privacyNote: "Processamento local",
    formatNote: "Vários formatos",
    batchLimitNote: "{limit} imagens grátis. Para mais volume, escolha Pro.",
    privacyLink: "Privacidade, termos e contacto",
    statusTooManyFiles: "Foram adicionadas {accepted} de {total} imagens. Para processar lotes maiores de uma vez, escolha Pro.",
    statusNoSupportedFiles: "Nenhum ficheiro de imagem suportado foi encontrado.",
    statusEngineLoading: "A carregar o motor de remoção. A primeira vez pode demorar mais.",
    statusError: "não foi possível processar. Experimente JPG, PNG ou WebP.",
    removeImage: "Remover imagem",
  },
  en: {
    trustText: "Ideal for online stores, catalogues, marketplaces, and teams handling many images.",
    privacyNote: "Local processing",
    formatNote: "Multiple formats",
    batchLimitNote: "{limit} images free. Need more volume? Choose Pro.",
    privacyLink: "Privacy, terms, and contact",
    statusTooManyFiles: "{accepted} of {total} images were added. To process larger batches at once, choose Pro.",
    statusNoSupportedFiles: "No supported image file was found.",
    statusEngineLoading: "Loading the removal engine. The first run may take longer.",
    statusError: "could not be processed. Try JPG, PNG, or WebP.",
    removeImage: "Remove image",
  },
  es: {
    trustText: "Ideal para tiendas online, catálogos, marketplaces y equipos que gestionan muchas imágenes.",
    privacyNote: "Las imágenes se procesan en tu dispositivo y no se suben a nuestros servidores.",
    formatNote: "Algunos formatos pueden depender del soporte del navegador.",
    batchLimitNote: "El modo gratuito permite hasta {limit} imágenes por lote.",
    privacyLink: "Privacidad y términos",
    statusTooManyFiles: "El modo gratuito permite hasta {limit} imágenes por lote. Para más volumen, solicita acceso Pro.",
    statusNoSupportedFiles: "No se encontró ningún archivo de imagen compatible.",
    statusEngineLoading: "Cargando el motor de eliminación. La primera vez puede tardar más.",
    statusError: "no se pudo procesar. Prueba JPG, PNG o WebP.",
    removeImage: "Eliminar imagen",
  },
  fr: {
    trustText: "Idéal pour les boutiques en ligne, les catalogues, les marketplaces et les équipes qui traitent beaucoup d'images.",
    privacyNote: "Les images sont traitées sur votre appareil et ne sont pas envoyées à nos serveurs.",
    formatNote: "Certains formats peuvent dépendre de la prise en charge du navigateur.",
    batchLimitNote: "Le mode gratuit permet jusqu'à {limit} images par lot.",
    privacyLink: "Confidentialité et conditions",
    statusTooManyFiles: "Le mode gratuit permet jusqu'à {limit} images par lot. Pour plus de volume, demandez l'accès Pro.",
    statusNoSupportedFiles: "Aucun fichier image compatible n'a été trouvé.",
    statusEngineLoading: "Chargement du moteur de suppression. La première fois peut prendre plus de temps.",
    statusError: "n'a pas pu être traité. Essayez JPG, PNG ou WebP.",
    removeImage: "Supprimer l'image",
  },
  de: {
    trustText: "Ideal für Online-Shops, Kataloge, Marktplätze und Teams, die viele Bilder bearbeiten.",
    privacyNote: "Bilder werden auf Ihrem Gerät verarbeitet und nicht auf unsere Server hochgeladen.",
    formatNote: "Einige Formate können von der Browser-Unterstützung abhängen.",
    batchLimitNote: "Der kostenlose Modus erlaubt bis zu {limit} Bilder pro Stapel.",
    privacyLink: "Datenschutz und Bedingungen",
    statusTooManyFiles: "Der kostenlose Modus erlaubt bis zu {limit} Bilder pro Stapel. Für größere Mengen Pro-Zugang anfragen.",
    statusNoSupportedFiles: "Keine unterstützte Bilddatei gefunden.",
    statusEngineLoading: "Entfernungsmodul wird geladen. Der erste Lauf kann länger dauern.",
    statusError: "konnte nicht verarbeitet werden. Versuchen Sie JPG, PNG oder WebP.",
    removeImage: "Bild entfernen",
  },
  it: {
    trustText: "Ideale per negozi online, cataloghi, marketplace e team che gestiscono molte immagini.",
    privacyNote: "Le immagini vengono elaborate sul tuo dispositivo e non vengono caricate sui nostri server.",
    formatNote: "Alcuni formati possono dipendere dal supporto del browser.",
    batchLimitNote: "La modalità gratuita consente fino a {limit} immagini per lotto.",
    privacyLink: "Privacy e termini",
    statusTooManyFiles: "La modalità gratuita consente fino a {limit} immagini per lotto. Per volumi maggiori, richiedi l'accesso Pro.",
    statusNoSupportedFiles: "Nessun file immagine supportato trovato.",
    statusEngineLoading: "Caricamento del motore di rimozione. La prima volta può richiedere più tempo.",
    statusError: "non è stato possibile elaborarla. Prova JPG, PNG o WebP.",
    removeImage: "Rimuovi immagine",
  },
  nl: {
    trustText: "Ideaal voor webshops, catalogi, marketplaces en teams die veel afbeeldingen verwerken.",
    privacyNote: "Afbeeldingen worden op je apparaat verwerkt en niet naar onze servers geüpload.",
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
    trustText: "Idealne dla sklepów online, katalogów, marketplace'ów i zespołów przetwarzających wiele zdjęć.",
    privacyNote: "Obrazy są przetwarzane na Twoim urządzeniu i nie są przesyłane na nasze serwery.",
    formatNote: "Niektóre formaty mogą zależeć od obsługi w przeglądarce.",
    batchLimitNote: "Tryb darmowy pozwala przetworzyć do {limit} obrazów na partię.",
    privacyLink: "Prywatność i warunki",
    statusTooManyFiles: "Tryb darmowy pozwala przetworzyć do {limit} obrazów na partię. Przy większych wolumenach poproś o dostęp Pro.",
    statusNoSupportedFiles: "Nie znaleziono obsługiwanego pliku obrazu.",
    statusEngineLoading: "Ładowanie silnika usuwania. Pierwsze uruchomienie może potrwać dłużej.",
    statusError: "nie można było przetworzyć. Spróbuj JPG, PNG lub WebP.",
    removeImage: "Usuń obraz",
  },
  sv: {
    trustText: "Perfekt för webbutiker, kataloger, marknadsplatser och team som hanterar många bilder.",
    privacyNote: "Bilderna bearbetas på din enhet och laddas inte upp till våra servrar.",
    formatNote: "Vissa format kan bero på webbläsarens stöd.",
    batchLimitNote: "Gratisläget tillåter upp till {limit} bilder per batch.",
    privacyLink: "Integritet och villkor",
    statusTooManyFiles: "Gratisläget tillåter upp till {limit} bilder per batch. För större volymer, begär Pro-åtkomst.",
    statusNoSupportedFiles: "Ingen bildfil som stöds hittades.",
    statusEngineLoading: "Laddar borttagningsmotorn. Första gången kan ta längre tid.",
    statusError: "kunde inte bearbetas. Prova JPG, PNG eller WebP.",
    removeImage: "Ta bort bild",
  },
  da: {
    trustText: "Ideel til webshops, kataloger, markedspladser og teams, der behandler mange billeder.",
    privacyNote: "Billederne behandles på din enhed og uploades ikke til vores servere.",
    formatNote: "Nogle formater kan afhænge af browserunderstøttelse.",
    batchLimitNote: "Gratis tilstand tillader op til {limit} billeder pr. batch.",
    privacyLink: "Privatliv og vilkår",
    statusTooManyFiles: "Gratis tilstand tillader op til {limit} billeder pr. batch. Ved større mængder kan du anmode om Pro-adgang.",
    statusNoSupportedFiles: "Ingen understøttet billedfil blev fundet.",
    statusEngineLoading: "Indlæser fjernelsesmotoren. Første gang kan tage længere tid.",
    statusError: "kunne ikke behandles. Prøv JPG, PNG eller WebP.",
    removeImage: "Fjern billede",
  },
  no: {
    trustText: "Ideelt for nettbutikker, kataloger, markedsplasser og team som håndterer mange bilder.",
    privacyNote: "Bildene behandles på enheten din og lastes ikke opp til serverne våre.",
    formatNote: "Noen formater kan avhenge av nettleserstøtte.",
    batchLimitNote: "Gratisversjonen tillater opptil {limit} bilder per batch.",
    privacyLink: "Personvern og vilkår",
    statusTooManyFiles: "Gratisversjonen tillater opptil {limit} bilder per batch. For større volum, be om Pro-tilgang.",
    statusNoSupportedFiles: "Ingen støttet bildefil ble funnet.",
    statusEngineLoading: "Laster fjerningsmotoren. Første gang kan ta lengre tid.",
    statusError: "kunne ikke behandles. Prøv JPG, PNG eller WebP.",
    removeImage: "Fjern bilde",
  },
  fi: {
    trustText: "Ihanteellinen verkkokaupoille, katalogeille, markkinapaikoille ja tiimeille, jotka käsittelevät paljon kuvia.",
    privacyNote: "Kuvat käsitellään laitteellasi eikä niitä ladata palvelimillemme.",
    formatNote: "Jotkin muodot voivat riippua selaimen tuesta.",
    batchLimitNote: "Ilmainen tila sallii enintään {limit} kuvaa erässä.",
    privacyLink: "Tietosuoja ja ehdot",
    statusTooManyFiles: "Ilmainen tila sallii enintään {limit} kuvaa erässä. Suurempia määriä varten pyydä Pro-käyttöoikeutta.",
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
    proLead: "Remova limites e prepare lotes maiores para catálogos, lojas online e equipas.",
    proLimitCta: "Ver planos Pro",
    proNoCommitment: "Pagamento seguro por Stripe Checkout para quem trabalha com volume.",
    brandCta: "Testar grátis com {limit} imagens",
    brandCtaPro: "Carregar fotos",
    brandProLink: "Precisa de mais volume? Ver planos Pro",
    leadPro: "Conta ativa: remova fundos em lotes até {limit} imagens e exporte PNGs transparentes ou ZIP pronto para loja.",
    freeTestFlowLabel: "Como testar grátis",
    freeTestStepOneTitle: "1. Carregue {limit} fotos",
    freeTestStepOneText: "Sem conta e sem cartão.",
    freeTestStepTwoTitle: "2. Veja o PNG",
    freeTestStepTwoText: "Confirme a qualidade com fotos reais.",
    freeTestStepThreeTitle: "3. Passe a Pro se precisar de volume",
    freeTestStepThreeText: "Até 100 imagens por lote.",
    inlineProCta: "Quer desbloquear até 100 imagens por lote? Ver planos Pro",
    proInlineKicker: "BatchCutout Pro",
    proInlineTitle: "Transforme este teste em produção por 15 EUR/mês",
    proInlineLead: "Já viu o resultado com fotos reais. O plano fundador desbloqueia lotes até 100 imagens para catálogos, variantes e marketplaces.",
    proInlineBenefits: "Plano fundador 15 EUR/mês. Pro mensal 19 EUR/mês. Anual 190 EUR/ano.",
    proEmailPlaceholder: "O seu email",
    proInlineButton: "Comprar Pro",
    proInlineNote: "Pagamento seguro por Stripe Checkout.",
    proInlineSuccess: "A abrir pagamento Pro.",
    proInlineError: "Não foi possível enviar automaticamente. Vamos abrir uma mensagem de email.",
    downloadReadyHint: "Resultado pronto. Para repetir este fluxo com mais produtos, o Pro desbloqueia 100 imagens por lote.",
    zipProCta: "Processar até 100 imagens por lote - desde 15 EUR/mês",
    emptyTitle: "Os seus PNGs transparentes aparecem aqui",
    emptyState: "Depois pode descarregar uma imagem ou exportar tudo em ZIP.",
    demoLabel: "Exemplo antes e depois",
    demoBefore: "Antes",
    demoAfter: "Depois",
    freeLimitBadge: "{limit} imagens gr\u00e1tis por lote",
    proLimitBadge: "Até {limit} imagens por lote",
    dropzoneHelper: "Teste com {limit} imagens grátis. O Pro é só para quem precisa de lotes maiores.",
    dropzoneHelperPro: "Arraste ou selecione as imagens que quer processar nesta conta.",
    batchLimitNotePro: "Limite da conta: até {limit} imagens por lote e {monthlyLimit} imagens por mês.",
    audienceKicker: "Criado para volume",
    audienceTitle: "Para quem trata imagens todos os dias",
    audienceStoresTitle: "Lojas online",
    audienceStoresText: "Produto pronto para venda.",
    audienceCatalogsTitle: "Catálogos",
    audienceCatalogsText: "Coleções prontas mais depressa.",
    audienceTeamsTitle: "Equipas",
    audienceTeamsText: "Menos trabalho repetitivo.",
    faqKicker: "Dúvidas rápidas",
    faqTitle: "Antes de começar",
    faqPrivacyQ: "As fotos são enviadas para um servidor?",
    faqPrivacyA: "Não. As imagens são processadas no seu dispositivo.",
    faqFormatsQ: "Que formatos são aceites?",
    faqFormatsA: "JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC, HEIF e outros formatos de imagem suportados pelo navegador.",
    faqVolumeQ: "Posso processar mais de {limit} imagens?",
    faqVolumeA: "O modo gratuito permite {limit} imagens por lote. O Pro permite até 100 imagens por lote e 2.000 imagens por mês.",
  },
  en: {
    proKicker: "For teams and stores",
    proTitle: "Need to process hundreds of photos?",
    proLead: "Remove limits and prepare larger batches for catalogues, online stores, and teams.",
    proLimitCta: "View Pro plans",
    proNoCommitment: "Secure Stripe Checkout for high-volume workflows.",
    brandCta: "Start free with {limit} images",
    brandCtaPro: "Upload photos",
    brandProLink: "Need more volume? View Pro plans",
    leadPro: "Account active: remove backgrounds in batches up to {limit} images and export transparent PNGs or a store-ready ZIP.",
    freeTestFlowLabel: "How to test free",
    freeTestStepOneTitle: "1. Upload {limit} photos",
    freeTestStepOneText: "No account and no card.",
    freeTestStepTwoTitle: "2. See the PNG",
    freeTestStepTwoText: "Check quality with real photos.",
    freeTestStepThreeTitle: "3. Upgrade to Pro if you need volume",
    freeTestStepThreeText: "Up to 100 images per batch.",
    inlineProCta: "Want to unlock up to 100 images per batch? View Pro plans",
    proInlineKicker: "BatchCutout Pro",
    proInlineTitle: "Turn this test into production for EUR 15/month",
    proInlineLead: "You have seen the result with real photos. The founder plan unlocks batches up to 100 images for catalogs, variants, and marketplaces.",
    proInlineBenefits: "Founder plan EUR 15/month. Monthly Pro EUR 19/month. Annual EUR 190/year.",
    proEmailPlaceholder: "Your email",
    proInlineButton: "Buy Pro",
    proInlineNote: "Secure payment through Stripe Checkout.",
    proInlineSuccess: "Opening Pro payment.",
    proInlineError: "We could not submit automatically. Opening an email draft instead.",
    downloadReadyHint: "Result ready. To repeat this workflow with more products, Pro unlocks 100 images per batch.",
    zipProCta: "Process up to 100 images per batch - from EUR 15/month",
    emptyTitle: "Your transparent PNGs appear here",
    emptyState: "Then download one image or export everything as a ZIP.",
    demoLabel: "Before and after example",
    demoBefore: "Before",
    demoAfter: "After",
    freeLimitBadge: "{limit} free images per batch",
    proLimitBadge: "Up to {limit} images per batch",
    dropzoneHelper: "Test with {limit} free images. Pro is only for larger batches.",
    dropzoneHelperPro: "Drag or select the images you want to process on this account.",
    batchLimitNotePro: "Account limit: up to {limit} images per batch and {monthlyLimit} images per month.",
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
    faqVolumeA: "Free mode allows {limit} images per batch. Pro unlocks up to 100 images per batch and 2,000 images per month.",
  },
};

for (const language of Object.keys(translations)) {
  Object.assign(translations[language], proTranslations[language] || proTranslations.en);
}

let items = [];
let currentLanguage = getRequestedLanguage() || localStorage.getItem("language") || detectLanguage();
let engineHasLoaded = false;
let hasTrackedDragIntent = false;
let hasTrackedDownloadReady = false;

const analyticsEvents = {
  tool_page_view: { category: "funnel", label: "page_view", step: 0 },
  brand_cta_clicked: { category: "engagement", label: "start_free" },
  tool_drag_upload_intent: { category: "upload", label: "drag_upload_intent", step: 1 },
  tool_upload_started: { category: "funnel", label: "upload_started", step: 1 },
  tool_upload_added: { category: "funnel", label: "upload_added", step: 2 },
  download_ready_shown: { category: "funnel", label: "download_ready", step: 5 },
  batch_limit_exceeded: { category: "commercial_intent", label: "batch_limit_exceeded", step: 3 },
  tool_processing_started: { category: "funnel", label: "processing_started", step: 4 },
  tool_processing_completed: { category: "funnel", label: "processing_completed", step: 5 },
  tool_download_png: { category: "funnel", label: "download_png", step: 6 },
  tool_download_zip: { category: "funnel", label: "download_zip", step: 6 },
  tool_pro_clicked: { category: "commercial_intent", label: "pro_clicked", step: 7 },
  pro_prompt_shown: { category: "commercial_intent", label: "pro_prompt_shown", step: 7 },
  pro_form_started: { category: "commercial_intent", label: "pro_form_started", step: 8 },
  pro_submit_attempt: { category: "commercial_intent", label: "pro_submit_attempt", step: 9 },
  pro_checkout_login_required: { category: "commercial_intent", label: "checkout_login_required", step: 10 },
  pro_checkout_started: { category: "commercial_intent", label: "checkout_started", step: 11 },
  pro_purchase_conversion_sent: { category: "revenue", label: "purchase_conversion", step: 12 },
  monthly_limit_reached: { category: "commercial_intent", label: "monthly_limit_reached", step: 13 },
  high_volume_contact_clicked: { category: "commercial_intent", label: "high_volume_contact_clicked", step: 14 },
  lead_capture_shown: { category: "lead", label: "lead_capture_shown", step: 7 },
  lead_capture_submitted: { category: "lead", label: "lead_capture_submitted", step: 8 },
  lead_capture_dismissed: { category: "lead", label: "lead_capture_dismissed", step: 8 },
  lead_capture_invalid: { category: "lead", label: "lead_capture_invalid", step: 8 },
  billing_portal_opened: { category: "account", label: "billing_portal_opened" },
  account_signup_started: { category: "account", label: "signup_started" },
  account_signup_succeeded: { category: "account", label: "signup_succeeded" },
  account_signup_failed: { category: "account", label: "signup_failed" },
  account_login_succeeded: { category: "account", label: "login_succeeded" },
  account_login_failed: { category: "account", label: "login_failed" },
  photos_selected: { category: "upload", label: "photos_selected" },
  upload_rejected: { category: "upload", label: "upload_rejected" },
  upload: { category: "funnel", label: "upload", step: 1 },
  processar: { category: "funnel", label: "processar", step: 2 },
  download_png: { category: "funnel", label: "download_png", step: 3 },
  download_zip: { category: "funnel", label: "download_zip", step: 3 },
  limite_20: { category: "funnel", label: "batch_limit_legacy", step: 4 },
  background_removal_started: { category: "processing", label: "started" },
  background_removal_finished: { category: "processing", label: "finished" },
  png_downloaded: { category: "download", label: "single_png" },
  zip_downloaded: { category: "download", label: "zip" },
  pro_interest_prompt_clicked: { category: "commercial_intent", label: "pro_interest" },
  feedback_goal_selected: { category: "feedback", label: "visitor_goal" },
  post_download_feedback_selected: { category: "feedback", label: "post_download" },
};

const audienceSignals = {
  tool_upload_started: "upload_started",
  download_ready_shown: "result_ready",
  tool_pro_clicked: "pro_interest",
  pro_checkout_login_required: "checkout_login_required",
  pro_checkout_started: "checkout_started",
  lead_capture_submitted: "lead_capture",
  pro_purchase_conversion_sent: "paid_customer",
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
  if (audienceSignals[name]) {
    window.gtag?.("event", "batchcutout_audience_signal", {
      ...eventParams,
      event_label: audienceSignals[name],
      audience_signal: audienceSignals[name],
    });
  }
  recordDebugEvent(name, eventParams);
  sendServerEvent(name, eventParams);
}

function getStableId(storage, key) {
  try {
    const existing = storage.getItem(key);
    if (existing) return existing;
    const next = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    storage.setItem(key, next);
    return next;
  } catch {
    return "";
  }
}

function getVisitorId() {
  return getStableId(localStorage, visitorStorageKey);
}

function getSessionId() {
  return getStableId(sessionStorage, sessionStorageKey);
}

function sendServerEvent(name, detail = {}) {
  if (!serverEventNames.has(name)) return;

  const payload = JSON.stringify({
    name,
    detail,
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
  });

  try {
    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      if (sent) return;
    }
  } catch {
    // Ignore measurement transport errors.
  }

  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
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

function trackGoogleAdsConversion(sendTo, { value = 1.0, currency = "EUR", transaction_id = "" } = {}) {
  if (!sendTo) return;
  const payload = {
    send_to: sendTo,
    value,
    currency,
  };
  if (transaction_id) payload.transaction_id = transaction_id;
  window.gtag?.("event", "conversion", payload);
  recordDebugEvent("google_ads_conversion", payload);
}

function getTrackedPaidSessions() {
  try {
    const sessions = JSON.parse(localStorage.getItem(paidConversionStorageKey) || "[]");
    return Array.isArray(sessions) ? sessions : [];
  } catch {
    return [];
  }
}

function rememberPaidSession(sessionId) {
  if (!sessionId) return;
  const sessions = getTrackedPaidSessions().filter(Boolean);
  if (!sessions.includes(sessionId)) sessions.push(sessionId);
  localStorage.setItem(paidConversionStorageKey, JSON.stringify(sessions.slice(-20)));
}

function hasTrackedPaidSession(sessionId) {
  return Boolean(sessionId && getTrackedPaidSessions().includes(sessionId));
}

function checkoutValueForPlan(plan = "monthly") {
  if (plan === "annual") return 190;
  if (plan === "early") return 15;
  return 19;
}

function googleCommerceItem(plan = "monthly") {
  return {
    item_id: `batchcutout_pro_${plan}`,
    item_name: plan === "annual" ? "BatchCutout Pro Annual" : plan === "early" ? "BatchCutout Founder" : "BatchCutout Pro Monthly",
    item_category: "subscription",
    price: checkoutValueForPlan(plan),
    quantity: 1,
  };
}

function trackBeginCheckout(plan = "monthly", source = "app") {
  const value = checkoutValueForPlan(plan);
  window.gtag?.("event", "begin_checkout", {
    currency: "EUR",
    value,
    checkout_step: 1,
    checkout_option: plan,
    source,
    items: [googleCommerceItem(plan)],
  });
}

function setGoogleUserData(email = "") {
  if (!email || localStorage.getItem(consentStorageKey) !== "accepted") return;
  window.gtag?.("set", "user_data", {
    email,
  });
}

function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(normalizeEmail(value));
}

function getCapturedLeadEmail() {
  return normalizeEmail(localStorage.getItem(leadCaptureEmailStorageKey) || "");
}

function rememberAccountEmail(value = "") {
  const email = normalizeEmail(value);
  if (!isValidEmail(email)) return "";
  try {
    localStorage.setItem(leadCaptureEmailStorageKey, email);
  } catch {
    // Local storage only reduces repeated typing; checkout must work without it.
  }
  return email;
}

function prefillAccountEmail() {
  if (!accountEmail || accountEmail.value.trim()) return;
  const capturedEmail = getCapturedLeadEmail();
  if (isValidEmail(capturedEmail)) accountEmail.value = capturedEmail;
}

function authFailureReason(error) {
  return String(error?.code || error?.message || "auth_failed")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .slice(0, 120);
}

function setKnownGoogleUserData() {
  const knownEmail = currentAccount?.email || getCapturedLeadEmail();
  setGoogleUserData(knownEmail);
}

function trackPaidSubscriptionConversion(details = {}) {
  const sessionId = details.sessionId || details.stripe_session_id || checkoutSessionId;
  if (!sessionId || hasTrackedPaidSession(sessionId)) return;

  const plan = details.checkoutPlan || details.plan || "monthly";
  const amount = Number(details.amount || 0) || checkoutValueForPlan(plan);
  const currency = String(details.currency || "EUR").toUpperCase();
  const customerEmail = details.customerEmail || currentAccount?.email || "";

  setGoogleUserData(customerEmail);
  window.gtag?.("event", "purchase", {
    transaction_id: sessionId,
    value: amount,
    currency,
    affiliation: "Stripe Checkout",
    items: [googleCommerceItem(plan)],
  });
  trackGoogleAdsConversion(paidSubscriptionConversionId, {
    value: amount,
    currency,
    transaction_id: sessionId,
  });
  trackEvent("pro_purchase_conversion_sent", {
    plan,
    value: amount,
    currency,
    stripe_session_id: sessionId,
    stripe_subscription_id: details.subscriptionId || "",
    stripe_price_id: details.priceId || "",
    conversion_configured: Boolean(paidSubscriptionConversionId),
  });
  rememberPaidSession(sessionId);
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

function trackBatchLimitExceeded(detail = {}) {
  const limitDetail = {
    free_limit: maxFilesPerBatch,
    ...detail,
  };
  trackEvent("batch_limit_exceeded", limitDetail);
  trackEvent("limite_20", {
    ...limitDetail,
    legacy_name: "limite_20",
  });
  trackGoogleAdsConversion(batchLimitConversionId);
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
  if (granted) setKnownGoogleUserData();
}

function showConsentBanner() {
  if (localStorage.getItem(consentStorageKey)) return;

  const banner = document.createElement("section");
  banner.className = "consent-banner";
  banner.setAttribute("aria-label", "Cookie consent");
  banner.innerHTML = `
    <p data-i18n="cookieText">${t("cookieText")}</p>
    <div>
      <button type="button" class="consent-decline" data-i18n="cookieDecline">${t("cookieDecline")}</button>
      <button type="button" class="consent-accept" data-i18n="cookieAccept">${t("cookieAccept")}</button>
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

function getRequestedLanguage() {
  const requestedLanguage = pageParams.get("lang");
  return translations[requestedLanguage] ? requestedLanguage : "";
}

function t(key, params = {}) {
  params = { limit: maxFilesPerBatch, ...params };
  const currentValues = translations[currentLanguage] || translations.en || translations.pt;
  let value = currentValues[key];

  if (currentLanguage !== "pt" && value === baseTranslation[key] && translations.en?.[key]) {
    value = translations.en[key];
  }

  value = value || translations.en?.[key] || translations.pt[key] || key;

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
  proPromptButton.classList.toggle("hidden", canUsePaidAccess() || key !== "statusTooManyFiles");
  statusVolumeContact?.classList.toggle("hidden", key !== "accountMonthlyLimitReached");
  updateStatusVolumeContactLink(params);
}

function refreshStatusText() {
  const key = statusText.dataset.statusKey || "statusWaiting";
  const params = JSON.parse(statusText.dataset.statusParams || "{}");
  statusText.textContent = t(key, params);
  statusVolumeContact?.classList.toggle("hidden", key !== "accountMonthlyLimitReached");
  updateStatusVolumeContactLink(params);
}

function highVolumeContactParams(params = {}) {
  const access = currentAccount?.access || {};
  return {
    email: currentAccount?.email || "",
    monthlyLimit: params.monthlyLimit || access.monthlyLimit || defaultProMonthlyLimit,
    monthlyRemaining: access.monthlyRemaining ?? 0,
    source: window.location.href,
  };
}

function updateStatusVolumeContactLink(params = {}) {
  if (!statusVolumeContact) return;
  const contactParams = highVolumeContactParams(params);
  const subject = encodeURIComponent(t("volumeContactEmailSubject"));
  const body = encodeURIComponent(t("volumeContactEmailBody", contactParams));
  statusVolumeContact.href = `mailto:support@batchcutout.com?subject=${subject}&body=${body}`;
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
  updateAccountUi();
  render();
}

function setAccountMessage(key = "", params = {}) {
  if (!accountMessage) return;
  accountMessage.textContent = key ? t(key, params) : "";
}

function getRequestedBatchLimit() {
  if (![2, 3, 5, 10, 20].includes(requestedLimit)) return defaultMaxFilesPerBatch;
  return requestedLimit;
}

function getAccountBatchLimit() {
  return Number(currentAccount?.access?.batchLimit || 0) || 0;
}

function canUsePaidAccess() {
  return Boolean(currentAccount?.access?.canUsePro);
}

function getPaidAccessParams() {
  const access = currentAccount?.access || {};
  return {
    limit: Number(access.batchLimit || 0) || defaultProBatchLimit,
    monthlyLimit: Number(access.monthlyLimit || 0) || defaultProMonthlyLimit,
    monthlyRemaining: access.monthlyRemaining ?? access.monthlyLimit ?? defaultProMonthlyLimit,
  };
}

function syncBatchLimit() {
  const nextLimit = Math.max(defaultMaxFilesPerBatch, getRequestedBatchLimit(), getAccountBatchLimit());
  maxFilesPerBatch = nextLimit;
}

function syncPaidAccessUi() {
  const paidAccess = canUsePaidAccess();
  const paidParams = getPaidAccessParams();

  document.body.classList.toggle("account-pro-active", paidAccess);
  brandProLink?.classList.toggle("hidden", paidAccess);
  freeTestFlow?.classList.toggle("hidden", paidAccess);
  inlineProCta?.classList.toggle("hidden", paidAccess);
  for (const block of proSubscriberPromoBlocks) {
    block.classList.toggle("hidden", paidAccess);
  }

  if (paidAccess) {
    proPromptButton?.classList.add("hidden");
    zipProCta?.classList.add("hidden");
    postDownloadNextPanel?.classList.add("hidden");
    proInterestPanel?.classList.add("hidden");
    leadCapturePanel?.classList.add("hidden");
    if (brandCta) brandCta.textContent = t("brandCtaPro", paidParams);
    if (brandLead) brandLead.textContent = t("leadPro", paidParams);
    if (dropzoneBadge) dropzoneBadge.textContent = t("proLimitBadge", paidParams);
    if (dropzoneHelper) dropzoneHelper.textContent = t("dropzoneHelperPro", paidParams);
    if (batchLimitNote) batchLimitNote.textContent = t("batchLimitNotePro", paidParams);
    return;
  }

  if (brandCta) brandCta.textContent = t("brandCta");
  if (brandLead) brandLead.textContent = t("lead");
  if (dropzoneBadge) dropzoneBadge.textContent = t("freeLimitBadge");
  if (dropzoneHelper) dropzoneHelper.textContent = t("dropzoneHelper");
  if (batchLimitNote) batchLimitNote.textContent = t("batchLimitNote");
}

function updateAccountUi() {
  if (!accountPanel || !accountBadge || !accountStatus) return;

  syncBatchLimit();
  refreshStatusText();

  if (!authConfig?.configured) {
    accountBadge.textContent = t("accountBadgeGuest");
    accountStatus.textContent = t("accountStatusConfigMissing");
    prefillAccountEmail();
    accountForm?.classList.remove("hidden");
    accountActions?.classList.add("hidden");
    billingActions?.classList.add("hidden");
    billingPortal?.classList.add("hidden");
    syncPaidAccessUi();
    updateControls();
    return;
  }

  if (!currentAccount) {
    accountBadge.textContent = t("accountBadgeGuest");
    accountStatus.textContent = t("accountStatusGuest");
    prefillAccountEmail();
    accountForm?.classList.remove("hidden");
    accountActions?.classList.add("hidden");
    billingActions?.classList.add("hidden");
    billingPortal?.classList.add("hidden");
    syncPaidAccessUi();
    updateControls();
    return;
  }

  const { access = {}, email = "" } = currentAccount;
  setGoogleUserData(email);
  const statusKey = access.canUsePro ? "accountStatusPro" : "accountStatusFree";
  const badgeKey = access.canUsePro ? "accountBadgePro" : "accountBadgeFree";
  const statusTextValue = access.canUsePro
    ? t(statusKey, {
        batchLimit: access.batchLimit || defaultProBatchLimit,
        monthlyLimit: access.monthlyLimit || defaultProMonthlyLimit,
        monthlyRemaining: access.monthlyRemaining ?? access.monthlyLimit ?? defaultProMonthlyLimit,
      })
    : t(statusKey);

  accountBadge.textContent = t(badgeKey);
  accountStatus.textContent = email ? `${email} - ${statusTextValue}` : statusTextValue;
  accountForm?.classList.add("hidden");
  accountActions?.classList.remove("hidden");
  billingActions?.classList.toggle("hidden", Boolean(access.canUsePro));
  billingPortal?.classList.toggle("hidden", !access.canUsePro || !currentAccount?.billing?.hasStripeCustomer);
  syncPaidAccessUi();
  updateControls();
}

async function fetchAuthConfig() {
  try {
    const response = await fetch("/api/auth-config");
    const data = await response.json();
    authConfig = data?.ok ? data : { configured: false };
  } catch {
    authConfig = { configured: false };
  }

  if (authConfig?.configured && authConfig.url && authConfig.anonKey) {
    supabaseClient = createClient(authConfig.url, authConfig.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  updateAccountUi();
}

async function refreshAccount() {
  if (!supabaseClient) {
    currentAccount = null;
    updateAccountUi();
    return null;
  }

  const { data: sessionData } = await supabaseClient.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  if (!accessToken) {
    currentAccount = null;
    updateAccountUi();
    return null;
  }

  const response = await fetch("/api/account", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    currentAccount = null;
    updateAccountUi();
    return null;
  }

  const data = await response.json();
  currentAccount = data.account || null;
  updateAccountUi();
  return currentAccount;
}

async function initAuth() {
  await fetchAuthConfig();
  if (!supabaseClient) return;

  await refreshAccount();
  await showCheckoutReturnMessage();
  await maybeStartRequestedCheckout();

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.access_token) {
      currentAccount = null;
      updateAccountUi();
      return;
    }

    await refreshAccount();
    await maybeStartRequestedCheckout();
  });
}

async function handleAccountLogin(event) {
  event.preventDefault();
  if (!supabaseClient || !accountEmail || !accountPassword || !accountSubmit) {
    setAccountMessage("accountStatusConfigMissing");
    return;
  }

  const email = normalizeEmail(accountEmail.value);
  const password = accountPassword.value;
  if (!accountEmail.checkValidity() || !accountPassword.checkValidity()) {
    accountForm?.reportValidity();
    return;
  }
  rememberAccountEmail(email);

  accountSubmit.disabled = true;
  accountSubmit.textContent = t("accountSubmitSending");
  setAccountMessage();

  try {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    setGoogleUserData(email);
    const waitingPlan = checkoutPlanWaitingForAuth();
    trackEvent("account_login_succeeded", {
      source: waitingPlan ? "checkout_plan" : "account_panel",
      has_requested_checkout: Boolean(waitingPlan),
      checkout_plan: waitingPlan || "",
    });
    setAccountMessage("accountMagicLinkSent");
  } catch (error) {
    const waitingPlan = checkoutPlanWaitingForAuth();
    trackEvent("account_login_failed", {
      source: waitingPlan ? "checkout_plan" : "account_panel",
      has_requested_checkout: Boolean(waitingPlan),
      checkout_plan: waitingPlan || "",
      reason: authFailureReason(error),
    });
    setAccountMessage("accountAuthError");
  } finally {
    accountSubmit.disabled = false;
    accountSubmit.textContent = t("accountSubmit");
  }
}

async function handleAccountCreate(event) {
  event?.preventDefault();
  if (!supabaseClient || !accountEmail || !accountPassword || !accountCreate) {
    setAccountMessage("accountStatusConfigMissing");
    return;
  }

  const email = normalizeEmail(accountEmail.value);
  const password = accountPassword.value;
  if (!accountEmail.checkValidity() || !accountPassword.checkValidity()) {
    accountForm?.reportValidity();
    return;
  }
  rememberAccountEmail(email);

  accountCreate.disabled = true;
  accountCreate.textContent = t("accountCreateSending");
  setAccountMessage();
  const waitingPlan = checkoutPlanWaitingForAuth();
  trackEvent("account_signup_started", {
    source: waitingPlan ? "checkout_plan" : "account_panel",
    has_requested_checkout: Boolean(waitingPlan),
    checkout_plan: waitingPlan || "",
  });

  try {
    const redirectTo = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) throw error;
    setGoogleUserData(email);
    const waitingPlan = checkoutPlanWaitingForAuth();
    trackEvent("account_signup_succeeded", {
      source: waitingPlan ? "checkout_plan" : "account_panel",
      has_requested_checkout: Boolean(waitingPlan),
      checkout_plan: waitingPlan || "",
    });
    if (data?.session) {
      await refreshAccount();
      setAccountMessage(waitingPlan ? "accountSignupReady" : "accountSignupReadyNoPlan");
      await maybeStartRequestedCheckout();
    } else {
      setAccountMessage("accountSignupSuccess");
    }
  } catch (error) {
    trackEvent("account_signup_failed", {
      source: waitingPlan ? "checkout_plan" : "account_panel",
      has_requested_checkout: Boolean(waitingPlan),
      checkout_plan: waitingPlan || "",
      reason: authFailureReason(error),
    });
    setAccountMessage("accountSignupError");
  } finally {
    accountCreate.disabled = false;
    accountCreate.textContent = t("accountCreate");
  }
}

async function handleAccountLogout() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  clearPendingCheckoutPlan();
  currentAccount = null;
  updateAccountUi();
  setAccountMessage("accountLoggedOut");
}

async function getCurrentAccessToken() {
  if (!supabaseClient) return "";
  const { data: sessionData } = await supabaseClient.auth.getSession();
  return sessionData?.session?.access_token || "";
}

function checkoutPlanLabelKey(plan) {
  if (plan === "annual") return "billingAnnual";
  if (plan === "early") return "billingEarly";
  return "billingMonthly";
}

function getPendingCheckoutPlan() {
  try {
    const pending = JSON.parse(localStorage.getItem(pendingCheckoutPlanStorageKey) || "{}");
    const createdAt = Number(pending.createdAt || 0) || 0;
    if (!checkoutPlans.has(pending.plan) || Date.now() - createdAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(pendingCheckoutPlanStorageKey);
      return "";
    }
    return pending.plan;
  } catch {
    localStorage.removeItem(pendingCheckoutPlanStorageKey);
    return "";
  }
}

function setPendingCheckoutPlan(plan) {
  const selectedPlan = checkoutPlans.has(plan) ? plan : "monthly";
  localStorage.setItem(pendingCheckoutPlanStorageKey, JSON.stringify({
    plan: selectedPlan,
    createdAt: Date.now(),
  }));
  return selectedPlan;
}

function clearPendingCheckoutPlan() {
  localStorage.removeItem(pendingCheckoutPlanStorageKey);
}

function checkoutPlanWaitingForAuth() {
  return checkoutPlans.has(requestedCheckoutPlan || "") ? requestedCheckoutPlan : getPendingCheckoutPlan();
}

async function startCheckout(plan = "monthly", triggerButton = null) {
  const selectedPlan = checkoutPlans.has(plan) ? plan : "monthly";
  const accessToken = await getCurrentAccessToken();

  if (!accessToken) {
    setPendingCheckoutPlan(selectedPlan);
    trackEvent("pro_checkout_login_required", { plan: selectedPlan });
    setAccountMessage("billingLoginRequired");
    accountPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (triggerButton) {
    triggerButton.disabled = true;
    triggerButton.textContent = t("billingCheckoutStarting");
  }
  setAccountMessage("billingCheckoutStarting");

  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        plan: selectedPlan,
        attribution: {
          ...getAttributionParams(),
          visitor_id: getVisitorId(),
          session_id: getSessionId(),
        },
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.url) {
      throw new Error(data.error || "checkout_failed");
    }

    trackEvent("pro_checkout_started", {
      plan: selectedPlan,
      label: data.label || selectedPlan,
      value: selectedPlan === "annual" ? 190 : selectedPlan === "early" ? 15 : 19,
      currency: "EUR",
    });
    setKnownGoogleUserData();
    trackBeginCheckout(selectedPlan, "app");
    clearPendingCheckoutPlan();
    window.location.href = data.url;
  } catch {
    setAccountMessage("billingCheckoutError");
    if (triggerButton) {
      triggerButton.disabled = false;
      triggerButton.textContent = t(checkoutPlanLabelKey(selectedPlan));
    }
  }
}

async function openBillingPortal() {
  if (!billingPortal) return;
  const accessToken = await getCurrentAccessToken();
  if (!accessToken) {
    setAccountMessage("billingLoginRequired");
    return;
  }

  billingPortal.disabled = true;
  billingPortal.textContent = t("billingPortalStarting");
  setAccountMessage("billingPortalStarting");

  try {
    const response = await fetch("/api/create-billing-portal-session", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.url) {
      throw new Error(data.error || "billing_portal_failed");
    }

    trackEvent("billing_portal_opened", { plan: currentAccount?.access?.plan || "unknown" });
    window.location.href = data.url;
  } catch {
    setAccountMessage("billingPortalError");
    billingPortal.disabled = false;
    billingPortal.textContent = t("billingPortal");
  }
}

async function syncCheckoutReturnSession() {
  if (checkoutStatus !== "success" || !checkoutSessionId) return null;

  const accessToken = await getCurrentAccessToken();
  if (!accessToken) return null;

  try {
    const response = await fetch("/api/sync-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ sessionId: checkoutSessionId }),
    });
    const data = await response.json().catch(() => ({}));
    return response.ok ? data : null;
  } catch {
    return null;
  }
}

async function fetchCheckoutConversionDetails() {
  if (checkoutStatus !== "success" || !checkoutSessionId) return null;

  try {
    const response = await fetch("/api/sync-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId: checkoutSessionId }),
    });
    const data = await response.json().catch(() => ({}));
    return response.ok && data?.paid ? data : null;
  } catch {
    return null;
  }
}

async function showCheckoutReturnMessage() {
  if (checkoutStatus === "success") {
    setAccountMessage("billingCheckoutSuccess");
    const checkoutDetails = await syncCheckoutReturnSession();
    await refreshAccount();
    const conversionDetails = checkoutDetails?.synced ? checkoutDetails : await fetchCheckoutConversionDetails();
    if (conversionDetails?.synced || conversionDetails?.paid) {
      trackPaidSubscriptionConversion(conversionDetails);
    }
  } else if (checkoutStatus === "cancelled") {
    setAccountMessage("billingCheckoutCancelled");
  }
}

async function maybeStartRequestedCheckout() {
  const planToStart = checkoutPlanWaitingForAuth();
  if (hasStartedRequestedCheckout || !checkoutPlans.has(planToStart || "")) return;
  if (!currentAccount) {
    if (!hasTrackedRequestedCheckoutLoginRequired) {
      hasTrackedRequestedCheckoutLoginRequired = true;
      trackEvent("pro_checkout_login_required", { plan: planToStart });
    }
    setAccountMessage("billingLoginRequired");
    return;
  }
  if (currentAccount.access?.canUsePro) {
    clearPendingCheckoutPlan();
    return;
  }

  hasStartedRequestedCheckout = true;
  await startCheckout(planToStart);
}

async function reserveMonthlyUsage(count) {
  if (!canUsePaidAccess() || !supabaseClient || count <= 0) return { ok: true };

  const { data: sessionData } = await supabaseClient.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) return { ok: false, error: "unauthorized" };

  const response = await fetch("/api/usage-reserve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ count }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    return { ok: false, error: data.error || "reserve_failed", detail: data };
  }

  currentAccount = data.account || currentAccount;
  lastUsageReservation = { count, at: Date.now() };
  updateAccountUi();
  return { ok: true, account: currentAccount };
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

function exportPngName(fileName, fallback = "imagem") {
  const baseName = cleanName(fileName) || fallback;
  return `${baseName}-${t("fileSuffix")}-batchcutout-com.png`;
}

function exportZipName() {
  return t("zipFilename").replace(/\.zip$/i, "-batchcutout-com.zip");
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
  const downloadReady = !running && (allReady || singleReady);
  const paidAccess = canUsePaidAccess();

  processButton.disabled = !hasItems || !hasPendingItems || running;
  pngButton.disabled = !singleReady || running;
  zipButton.disabled = !allReady || running;
  clearButton.disabled = !hasItems || running;
  downloadReadyHint?.classList.toggle("hidden", !downloadReady);
  zipProCta?.classList.toggle("hidden", paidAccess || !allReady || running);
  emptyState.classList.toggle("hidden", hasItems);
  countText.textContent = `${items.length} ${items.length === 1 ? t("photoSingular") : t("photoPlural")}`;

  if (downloadReady && !hasTrackedDownloadReady) {
    hasTrackedDownloadReady = true;
    trackEvent("download_ready_shown", {
      count: items.filter((item) => item.outputBlob).length,
      mode: allReady ? "zip_available" : "single_png_available",
    });
  }

  if (!downloadReady && !running) {
    hasTrackedDownloadReady = false;
  }
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
  const selectedFiles = [...fileList];
  const imageFiles = selectedFiles.filter(isSupportedImage);
  const unsupportedFiles = selectedFiles.length - imageFiles.length;
  const availableSlots = Math.max(maxFilesPerBatch - items.length, 0);
  const acceptedFiles = imageFiles.slice(0, availableSlots);
  const overLimitStatusKey = canUsePaidAccess() ? "statusTooManyFilesPro" : "statusTooManyFiles";
  hasTrackedDownloadReady = false;

  trackEvent("tool_upload_started", {
    attempted: selectedFiles.length,
    supported: imageFiles.length,
    unsupported: unsupportedFiles,
    totalInQueue: items.length,
  });

  if (!acceptedFiles.length) {
    setStatus(imageFiles.length ? overLimitStatusKey : "statusNoSupportedFiles", 0, {
      accepted: 0,
      total: items.length + imageFiles.length,
    });
    render();
    if (imageFiles.length) {
      trackBatchLimitExceeded({
        accepted: 0,
        attempted: imageFiles.length,
        selected: selectedFiles.length,
        unsupported: unsupportedFiles,
        rejected: imageFiles.length,
        totalInQueue: items.length,
        reason: "batch_limit",
      });
      if (!canUsePaidAccess()) {
        showProInterest("batch_limit");
      }
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
  setStatus(rejectedByLimit ? overLimitStatusKey : "statusLoaded", 0, {
    accepted: acceptedFiles.length,
    count: acceptedFiles.length,
    total: imageFiles.length,
  });
  if (rejectedByLimit) {
    trackBatchLimitExceeded({
      accepted: acceptedFiles.length,
      attempted: imageFiles.length,
      selected: selectedFiles.length,
      unsupported: unsupportedFiles,
      rejected: rejectedByLimit,
      totalInQueue: items.length,
      reason: "batch_limit",
    });
    if (!canUsePaidAccess()) {
      showProInterest("batch_limit");
    }
  }
  trackEvent("photos_selected", {
    count: acceptedFiles.length,
    attempted: imageFiles.length,
    selected: selectedFiles.length,
    unsupported: unsupportedFiles,
    totalInQueue: items.length,
  });
  trackEvent("upload", { count: acceptedFiles.length, totalInQueue: items.length });
  trackEvent("tool_upload_added", {
    count: acceptedFiles.length,
    attempted: imageFiles.length,
    rejected: rejectedByLimit,
    unsupported: unsupportedFiles,
    totalInQueue: items.length,
  });
  render();
}

async function processImages() {
  const pendingItems = items.filter((item) => !item.outputBlob);
  const pendingCount = pendingItems.length;

  if (!pendingCount) {
    updateControls();
    return;
  }

  if (canUsePaidAccess()) {
    const reservation = await reserveMonthlyUsage(pendingCount);
    if (!reservation.ok) {
      const monthlyLimit = currentAccount?.access?.monthlyLimit || defaultProMonthlyLimit;
      if (reservation.error === "monthly_limit_reached") {
        trackEvent("monthly_limit_reached", {
          source: "tool_monthly_limit",
          monthly_limit: monthlyLimit,
          monthly_remaining: currentAccount?.access?.monthlyRemaining ?? 0,
          pending: pendingCount,
          account_email: currentAccount?.email || "",
        });
      }
      setStatus(
        reservation.error === "monthly_limit_reached" ? "accountMonthlyLimitReached" : "accountReserveError",
        0,
        { monthlyLimit },
      );
      render();
      return;
    }
  }

  trackEvent("tool_processing_started", {
    count: items.length,
    pending: pendingCount,
  });
  trackEvent("background_removal_started", { count: items.length });
  trackEvent("processar", { count: items.length });
  processButton.disabled = true;
  pngButton.disabled = true;
  zipButton.disabled = true;
  clearButton.disabled = true;

  const total = pendingCount;
  let processedIndex = 0;

  for (const [index, item] of items.entries()) {
    if (item.outputBlob) {
      continue;
    }

    item.statusKey = "statusProcessing";
    item.statusClass = "";
    setStatus("statusProcessingCount", Math.round((processedIndex / total) * 100), {
      current: processedIndex + 1,
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

    processedIndex += 1;
    setStatus("statusProcessingCount", Math.round((processedIndex / total) * 100), {
      current: processedIndex,
      total,
    });
    render();
  }

  const failures = items.filter((item) => !item.outputBlob).length;
  const completed = items.length - failures;
  setStatus(failures ? "statusFailures" : "statusReadyZip", 100, { count: failures });
  trackEvent("background_removal_finished", { count: items.length, completed, failures });
  trackEvent("tool_processing_completed", { count: items.length, completed, failures });
  updateControls();
}

async function downloadZip() {
  const zip = new JSZip();
  const readyItems = items.filter((item) => item.outputBlob);

  for (const [index, item] of readyItems.entries()) {
    zip.file(exportPngName(item.file.name, `imagem-${index + 1}`), item.outputBlob);
  }

  setStatus("statusPreparingZip", 100);
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = exportZipName();
  link.click();
  URL.revokeObjectURL(url);
  setStatus("statusZipReady", 100);
  trackEvent("zip_downloaded", { count: readyItems.length });
  trackEvent("download_zip", { count: readyItems.length });
  trackEvent("tool_download_zip", {
    count: readyItems.length,
    fileType: "zip",
    minExportSide,
  });
  trackGoogleAdsConversion(downloadZipConversionId);
  showPostDownloadFeedback("zip", readyItems.length);
}

function downloadSinglePng() {
  const item = items[0];

  if (!item?.outputBlob) {
    return;
  }

  const url = URL.createObjectURL(item.outputBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = exportPngName(item.file.name);
  link.click();
  URL.revokeObjectURL(url);
  setStatus("statusPngReady", 100);
  trackEvent("png_downloaded", { count: 1 });
  trackEvent("download_png", { count: 1 });
  trackEvent("tool_download_png", {
    count: 1,
    fileType: "png",
    minExportSide,
  });
  showPostDownloadFeedback("png", 1);
}

function clearAll() {
  for (const item of items) {
    URL.revokeObjectURL(item.previewUrl);
  }

  items = [];
  hasTrackedDownloadReady = false;
  fileInput.value = "";
  setStatus("statusWaiting");
  postDownloadNextPanel?.classList.add("hidden");
  trackEvent("queue_cleared");
  render();
}

function showProInterest(reason = "manual") {
  if (canUsePaidAccess()) {
    return;
  }

  const detail = { reason, totalInQueue: items.length, free_limit: maxFilesPerBatch };
  trackEvent("pro_interest_prompt_clicked", detail);
  trackEvent("tool_pro_clicked", detail);
  showProPrompt(reason);
}

function showProPrompt(reason = "post_download", options = {}) {
  const shouldScroll = options.scroll !== false;
  if (canUsePaidAccess()) {
    proInterestPanel?.classList.add("hidden");
    return;
  }

  if (!proInterestPanel) return;

  const wasHidden = proInterestPanel.classList.contains("hidden");
  proInterestPanel.classList.remove("hidden");
  proInterestPanel.dataset.reason = reason;
  if (proInlineLanguage) proInlineLanguage.value = currentLanguage;
  if (proInlinePageUrl) proInlinePageUrl.value = window.location.href;
  if (proInlineMessage) proInlineMessage.textContent = "";
  if (proInlineSuccessCard) proInlineSuccessCard.hidden = true;

  if (wasHidden) {
    trackEvent("pro_prompt_shown", {
      reason,
      totalInQueue: items.length,
      free_limit: maxFilesPerBatch,
    });
  }

  if (shouldScroll) {
    proInterestPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function showPostDownloadNext(downloadType, count) {
  if (!postDownloadNextPanel || canUsePaidAccess()) {
    postDownloadNextPanel?.classList.add("hidden");
    return;
  }

  const wasHidden = postDownloadNextPanel.classList.contains("hidden");
  postDownloadNextPanel.classList.remove("hidden");
  postDownloadNextPanel.dataset.downloadType = downloadType;
  postDownloadNextPanel.dataset.downloadCount = String(count);
  const hasLeadContact = Boolean(currentAccount?.email || getCapturedLeadEmail());
  postDownloadSaveLinkCta?.classList.toggle("hidden", hasLeadContact);
  postDownloadEmailForm?.classList.toggle("hidden", hasLeadContact);
  if (postDownloadEmailMessage) postDownloadEmailMessage.textContent = "";

  if (wasHidden) {
    trackEvent("post_download_next_shown", {
      downloadType,
      count,
      totalInQueue: items.length,
      free_limit: maxFilesPerBatch,
    });
  }

  postDownloadNextPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function focusPostDownloadLeadCapture() {
  const downloadType = postDownloadNextPanel?.dataset.downloadType || "unknown";
  const count = Number(postDownloadNextPanel?.dataset.downloadCount || 0) || 0;
  localStorage.removeItem(leadCaptureDismissedStorageKey);
  showLeadCapture(downloadType, count);
  trackEvent("post_download_save_link_clicked", {
    downloadType,
    count,
    totalInQueue: items.length,
    free_limit: maxFilesPerBatch,
  });
  leadCapturePanel?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  leadCaptureEmail?.focus({ preventScroll: true });
}

function showPostDownloadFeedback(downloadType, count) {
  showPostDownloadNext(downloadType, count);
  postDownloadFeedback?.classList.remove("hidden");
  postDownloadFeedback?.setAttribute("data-download-type", downloadType);
  postDownloadFeedback?.setAttribute("data-download-count", String(count));
  if (!postDownloadEmailForm) showLeadCapture(downloadType, count);
  showProPrompt(`post_download_${downloadType}`, { scroll: false });
}

function shouldShowLeadCapture() {
  if (!leadCapturePanel || canUsePaidAccess() || currentAccount?.email) return false;
  if (localStorage.getItem(leadCaptureDismissedStorageKey)) return false;
  return !getCapturedLeadEmail();
}

function showLeadCapture(downloadType = "unknown", count = 0) {
  if (!shouldShowLeadCapture()) return;

  leadCapturePanel.classList.remove("hidden");
  leadCapturePanel.dataset.downloadType = downloadType;
  leadCapturePanel.dataset.downloadCount = String(count);
  if (leadCaptureMessage) leadCaptureMessage.textContent = "";
  trackEvent("lead_capture_shown", {
    downloadType,
    count,
    has_account: Boolean(currentAccount?.email),
  });
}

function hideLeadCapture() {
  leadCapturePanel?.classList.add("hidden");
}

function recordLeadCapture(email, { downloadType = "unknown", count = 0, source = "post_download" } = {}) {
  localStorage.setItem(leadCaptureEmailStorageKey, email);
  if (accountEmail && !accountEmail.value.trim()) accountEmail.value = email;
  localStorage.removeItem(leadCaptureDismissedStorageKey);
  postDownloadSaveLinkCta?.classList.add("hidden");
  postDownloadEmailForm?.classList.add("hidden");
  setGoogleUserData(email);
  trackEvent("lead_capture_submitted", {
    email,
    consent: true,
    downloadType,
    count,
    source,
  });
}

function disableFormControls(form) {
  form?.querySelectorAll("input, button").forEach((element) => {
    element.disabled = true;
  });
}

async function handleLeadCaptureSubmit(event) {
  event.preventDefault();
  if (!leadCaptureEmail || !leadCaptureForm) return;

  const email = normalizeEmail(leadCaptureEmail.value);
  const downloadType = leadCapturePanel?.dataset.downloadType || "unknown";
  const count = Number(leadCapturePanel?.dataset.downloadCount || 0) || 0;

  if (!isValidEmail(email)) {
    if (leadCaptureMessage) leadCaptureMessage.textContent = t("leadCaptureInvalid");
    trackEvent("lead_capture_invalid", { downloadType, count });
    leadCaptureEmail.focus();
    return;
  }

  recordLeadCapture(email, {
    downloadType,
    count,
    source: "post_download",
  });

  if (leadCaptureMessage) leadCaptureMessage.textContent = t("leadCaptureSuccess");
  disableFormControls(leadCaptureForm);
}

function handlePostDownloadEmailSubmit(event) {
  event.preventDefault();
  if (!postDownloadEmail || !postDownloadEmailForm) return;

  const email = normalizeEmail(postDownloadEmail.value);
  const downloadType = postDownloadNextPanel?.dataset.downloadType || "unknown";
  const count = Number(postDownloadNextPanel?.dataset.downloadCount || 0) || 0;

  if (!isValidEmail(email)) {
    if (postDownloadEmailMessage) postDownloadEmailMessage.textContent = t("leadCaptureInvalid");
    trackEvent("lead_capture_invalid", { downloadType, count, source: "post_download_inline" });
    postDownloadEmail.focus();
    return;
  }

  trackEvent("post_download_save_link_clicked", {
    downloadType,
    count,
    source: "post_download_inline",
    totalInQueue: items.length,
    free_limit: maxFilesPerBatch,
  });

  recordLeadCapture(email, {
    downloadType,
    count,
    source: "post_download_inline",
  });

  hideLeadCapture();
  if (postDownloadEmailMessage) postDownloadEmailMessage.textContent = t("leadCaptureSuccess");
  disableFormControls(postDownloadEmailForm);
}

function dismissLeadCapture() {
  localStorage.setItem(leadCaptureDismissedStorageKey, new Date().toISOString());
  trackEvent("lead_capture_dismissed", {
    downloadType: leadCapturePanel?.dataset.downloadType || "unknown",
    count: Number(leadCapturePanel?.dataset.downloadCount || 0) || 0,
  });
  hideLeadCapture();
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
statusVolumeContact?.addEventListener("click", () => {
  const params = highVolumeContactParams(JSON.parse(statusText.dataset.statusParams || "{}"));
  trackEvent("high_volume_contact_clicked", {
    source: "tool_monthly_limit",
    event_label: "tool_high_volume",
    monthly_limit: params.monthlyLimit,
    monthly_remaining: params.monthlyRemaining,
    has_account: Boolean(params.email),
  });
});
brandCta.addEventListener("click", () => {
  dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
  fileInput.focus({ preventScroll: true });
  trackEvent("brand_cta_clicked");
});
inlineProCta.addEventListener("click", () => showProInterest("inline_pro_cta"));
zipProCta?.addEventListener("click", () => showProInterest("zip_download_context"));
postDownloadFounderCta?.addEventListener("click", () => {
  const downloadType = postDownloadNextPanel?.dataset.downloadType || "unknown";
  const count = Number(postDownloadNextPanel?.dataset.downloadCount || 0) || 0;
  const detail = {
    reason: "post_download_next_founder",
    downloadType,
    count,
    totalInQueue: items.length,
    free_limit: maxFilesPerBatch,
  };
  trackEvent("post_download_founder_clicked", detail);
  trackEvent("tool_pro_clicked", detail);
  startCheckout("early", postDownloadFounderCta);
});
postDownloadSaveLinkCta?.addEventListener("click", focusPostDownloadLeadCapture);
postDownloadEmailForm?.addEventListener("submit", handlePostDownloadEmailSubmit);
proInlineForm?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-checkout-plan]");
  if (!button) return;
  startCheckout(button.dataset.checkoutPlan, button);
});
accountForm?.addEventListener("submit", handleAccountCreate);
accountSubmit?.addEventListener("click", handleAccountLogin);
accountRefresh?.addEventListener("click", refreshAccount);
accountLogout?.addEventListener("click", handleAccountLogout);
billingActions?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-checkout-plan]");
  if (!button) return;
  startCheckout(button.dataset.checkoutPlan, button);
});
billingPortal?.addEventListener("click", openBillingPortal);
leadCaptureForm?.addEventListener("submit", handleLeadCaptureSubmit);
leadCaptureDismiss?.addEventListener("click", dismissLeadCapture);
postDownloadOptions?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-post-download-feedback]");
  selectPostDownloadFeedback(button?.dataset.postDownloadFeedback);
});

initAuth();

for (const eventName of ["dragenter", "dragover", "dragleave", "drop"]) {
  document.addEventListener(eventName, (event) => {
    event.preventDefault();
  });
}

for (const eventName of ["dragenter", "dragover"]) {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("dragging");
    if (!hasTrackedDragIntent) {
      hasTrackedDragIntent = true;
      trackEvent("tool_drag_upload_intent");
    }
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
showConsentBanner();
initDebugPanel();
trackEvent("tool_page_view");
