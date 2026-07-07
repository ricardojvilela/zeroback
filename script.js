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
const resultReadySaveLinkCta = document.querySelector("#resultReadySaveLinkCta");
const resultReadyEmailForm = document.querySelector("#resultReadyEmailForm");
const resultReadyEmail = document.querySelector("#resultReadyEmail");
const resultReadyEmailMessage = document.querySelector("#resultReadyEmailMessage");
const resultReadyStickyCta = document.querySelector("#resultReadyStickyCta");
const resultReadyStickyPro = document.querySelector("#resultReadyStickyPro");
const resultReadyStickyLead = document.querySelector("#resultReadyStickyLead");
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
const proInterestTitle = document.querySelector("#pro-interest-title");
const proInterestLead = document.querySelector("[data-i18n='proInlineLead']");
const proInterestBenefits = document.querySelector(".pro-benefits");
const proInlineForm = document.querySelector("#proInlineForm");
const proInlineMessage = document.querySelector("#proInlineMessage");
const proInlineSuccessCard = document.querySelector("#proInlineSuccessCard");
const accountPanel = document.querySelector("#accountPanel");
const accountBadge = document.querySelector("#accountBadge");
const accountStatus = document.querySelector("#accountStatus");
const accountCheckoutGuide = document.querySelector("#accountCheckoutGuide");
const accountUsage = document.querySelector("#accountUsage");
const accountUsageCount = document.querySelector("#accountUsageCount");
const accountUsageBar = document.querySelector("#accountUsageBar");
const accountUsageReset = document.querySelector("#accountUsageReset");
const accountMessage = document.querySelector("#accountMessage");
const accountForm = document.querySelector("#accountForm");
const accountEmail = document.querySelector("#accountEmail");
const accountPassword = document.querySelector("#accountPassword");
const accountPasswordToggle = document.querySelector("#accountPasswordToggle");
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
const defaultCheckoutPlan = "early";
let maxFilesPerBatch = [2, 3, 5, 10, 20].includes(requestedLimit)
  ? requestedLimit
  : defaultMaxFilesPerBatch;
const minExportSide = 1200;
const defaultProBatchLimit = 100;
const defaultProMonthlyLimit = 2000;
const downloadZipConversionId = "AW-18177126609/2EdRCMzF7bMcENHhw9tD";
const batchLimitConversionId = "AW-18177126609/prPXCPXD8LMcENHhw9tD";
const paidSubscriptionConversionId = "AW-18177126609/fpcoCP2kmMgcENHhw9tD";
const campaignParamKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "source", "campaign", "gclid", "gbraid", "wbraid"];
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
const localizedPolicyLinks = {
  pt: "./privacidade.html",
  en: "./en/privacy.html",
  es: "./es/privacidad.html",
};
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
  "post_download_feedback_selected",
  "tool_pro_clicked",
  "monthly_limit_reached",
  "high_volume_contact_clicked",
  "pro_prompt_shown",
  "pro_form_started",
  "pro_submit_attempt",
  "account_checkout_panel_shown",
  "account_form_interacted",
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
  "account_email_confirmation_required",
  "account_form_validation_failed",
  "account_signup_failed",
  "account_login_succeeded",
  "account_login_failed",
]);
let debugList;
let supabaseClient = null;
let authConfig = null;
let currentAccount = null;
let lastUsageReservation = null;
let lastAccountValidationFailureAt = 0;
let hasStartedRequestedCheckout = false;
let hasTrackedRequestedCheckoutLoginRequired = false;
let hasTrackedResultReadyEmailShown = false;
let hasTrackedResultReadyStickyShown = false;
let lastTrackedAccountCheckoutPanelPlan = "";
let hasTrackedAccountFormInteraction = false;

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
  postDownloadNextText: "Se o resultado ficou bom, transforme este teste em produção: plano fundador por 15 EUR/mês, lotes até 100 imagens e 2.000 imagens por mês. Se ainda está a avaliar, receba o link e um checklist curto por email.",
  postDownloadChecklistLink: "Link direto para voltar à ferramenta",
  postDownloadChecklistPrep: "Checklist para fotos com melhor recorte",
  postDownloadChecklistPlan: "Resumo do plano fundador se precisar de volume",
  postDownloadFounderCta: "Criar conta e ativar fundador - 15 EUR/mês",
  postDownloadSaveLinkCta: "Receber link e checklist",
  postDownloadNextNote: "Sem cartão no teste grátis. Pagamento seguro por Stripe quando escolher Pro.",
  leadCaptureKicker: "Link e checklist",
  leadCaptureTitle: "Quer guardar este fluxo para voltar depois?",
  leadCaptureText: "Deixe o email e enviamos o link da ferramenta, um checklist curto para preparar fotos de produto e a opção Pro se precisar de volume.",
  leadCapturePlaceholder: "O seu email",
  leadCaptureSubmit: "Receber link e checklist",
  leadCaptureDismiss: "Agora não",
  leadCaptureNote: "Pode pedir remoção respondendo ao email. Não enviamos as suas imagens.",
  leadCaptureSuccess: "Pedido guardado. Deve receber o link e checklist do BatchCutout dentro de instantes.",
  leadCaptureInvalid: "Introduza um email válido.",
  proInlineKicker: "BatchCutout Pro",
  proInlineTitle: "Transforme este teste em produção por 15 EUR/mês",
  proInlineLead: "Já viu o resultado com fotos reais. O plano fundador desbloqueia lotes até 100 imagens para catálogos, variantes e marketplaces.",
  proInlineBenefits: "Plano fundador 15 EUR/mês. Pro mensal 19 EUR/mês. Anual 190 EUR/ano, poupa 38 EUR face ao mensal.",
  proInlineTitleBatchLimit: "Selecionou {total} imagens. O fundador desbloqueia o lote completo.",
  proInlineLeadBatchLimit: "No teste grátis entram {accepted}. Com Pro processa até 100 imagens por lote e 2.000 por mês, com ZIP pronto para loja.",
  proInlineBenefitsBatchLimit: "Se este é um lote real para catálogo ou marketplace, comece pelo plano fundador: 15 EUR/mês e cancele quando quiser.",
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
  resultReadyKicker: "Resultado pronto",
  resultReadyTitle: "Quer repetir isto em lotes maiores?",
  downloadReadyHint: "Se o recorte ficou bom, o plano fundador transforma este teste em produção: até 100 imagens por lote, 2.000 por mês e ZIP pronto para loja.",
  zipProCta: "Criar conta e ativar fundador - 15 EUR/mês",
  resultReadySaveLinkCta: "Receber link e checklist",
  resultReadyMicrocopy: "Sem fidelização. Pagamento seguro por Stripe.",
  resultReadyStickyLabel: "Opções depois do resultado pronto",
  resultReadyStickyKicker: "Resultado pronto",
  resultReadyStickyText: "Tem mais fotos para tratar? Pro desbloqueia 100 imagens por lote por 15 EUR/mês.",
  resultReadyStickyProCta: "Ativar fundador",
  resultReadyStickySaveCta: "Receber link",
  benefitsLabel: "Vantagens do serviço",
  benefitPng: "PNG transparente",
  benefitZip: "ZIP pronto para loja",
  fileSuffix: "sem-fundo",
  cookieText: "Usamos medição simples para perceber visitas e adesões Pro. Pode aceitar ou continuar sem medição.",
  cookieAccept: "Aceitar medição",
  cookieDecline: "Continuar sem medição",
  accountKicker: "Acesso Pro",
  accountBadgeGuest: "Sem sessão",
  accountBadgeCheckout: "Plano escolhido",
  accountBadgeFree: "Grátis",
  accountBadgePro: "Pro",
  accountStatusGuest: "Crie uma conta grátis para ligar o Pro ao seu email, ou entre para gerir o acesso.",
  accountStatusCheckoutPending: "Plano escolhido: {plan}. Crie uma conta grátis com email e password; depois abrimos o Stripe para pagar.",
  accountCheckoutGuideLabel: "Passos para ativar Pro",
  accountCheckoutGuideAccount: "Crie conta ou entre",
  accountCheckoutGuideStripe: "Pagamento Stripe",
  accountCheckoutGuideActive: "Pro ativo automaticamente",
  accountStatusLoading: "A verificar a sua conta...",
  accountStatusFree: "Conta gratuita. O Pro ativa até 100 imagens por lote e 2.000 imagens por mês.",
  accountStatusPro: "Conta Pro ativa. Até {batchLimit} imagens por lote e {monthlyRemaining} de {monthlyLimit} disponíveis este mês.",
  accountUsageTitle: "Utilização mensal",
  accountUsageCount: "{used} de {limit} imagens usadas",
  accountUsageReset: "O limite mensal renova em {date}.",
  accountUsageResetUnknown: "O limite mensal renova no início do próximo mês.",
  accountStatusConfigMissing: "Login Pro ainda não configurado neste ambiente.",
  accountEmailPlaceholder: "O seu email",
  accountPasswordPlaceholder: "A sua password (mín. 6 caracteres)",
  passwordShow: "Mostrar",
  passwordHide: "Ocultar",
  accountAuthNote: "Não há pagamento neste passo. A conta só liga o Stripe ao acesso Pro; as imagens continuam no browser.",
  accountSubmit: "Entrar",
  accountSubmitCheckout: "Entrar e continuar",
  accountSubmitSending: "A entrar...",
  accountCreate: "Criar conta e continuar",
  accountCreateCheckout: "Criar conta e continuar para pagamento",
  accountCreateSending: "A criar conta...",
  accountRefresh: "Atualizar conta",
  accountLogout: "Sair",
  billingEarly: "Plano fundador - 15 EUR/mês (melhor entrada)",
  billingMonthly: "Pro mensal - 19 EUR/mês",
  billingAnnual: "Pro anual - 190 EUR/ano (poupe 38 EUR)",
  billingPortal: "Gerir pagamento",
  billingCheckoutStarting: "A abrir pagamento...",
  billingPortalStarting: "A abrir gestão de pagamento...",
  billingCheckoutSuccess: "Pagamento recebido. A ativação Pro pode demorar alguns segundos.",
  billingCheckoutCancelled: "Pagamento cancelado. Pode tentar novamente quando quiser.",
  billingLoginRequired: "Crie uma conta grátis ou entre. Só depois abrimos o Stripe para pagar o plano escolhido.",
  billingCheckoutError: "Não foi possível abrir o pagamento agora.",
  billingPortalError: "Não foi possível abrir a gestão de pagamento agora.",
  accountMagicLinkSent: "Sessão iniciada.",
  accountSignupSuccess: "Conta criada. Confirme o email e volte a esta página para entrar.",
  accountSignupSuccessCheckout: "Conta criada. Confirme o email e volte a esta página; o plano escolhido fica guardado para abrir o pagamento.",
  accountConfirmationResent: "Este email ainda precisa de confirmação. Reenviámos o link; confirme o email e volte a esta página para continuar para pagamento.",
  accountExistingLoginReady: "Conta existente encontrada. A entrar e continuar para o pagamento...",
  accountExistingLoginError: "Este email já tem conta. Use Entrar com a password correta para continuar.",
  accountSignupReady: "Conta criada. A abrir o pagamento Pro escolhido...",
  accountSignupReadyNoPlan: "Conta criada. Escolha o plano Pro quando quiser ativar os limites pagos.",
  accountLoggedOut: "Sessão terminada.",
  accountAuthError: "Não foi possível entrar. Confirme a password ou crie conta se ainda não tiver.",
  accountSignupError: "Não foi possível criar a conta. Se este email já existir, use Entrar.",
  accountReserveError: "A sua conta não permite este lote neste momento.",
  accountMonthlyLimitReached: "A sua conta Pro atingiu o limite mensal de {monthlyLimit} imagens.",
  volumeContactCta: "Falar sobre volume maior",
  volumeContactEmailSubject: "BatchCutout - preciso de mais volume",
  volumeContactEmailBody: "Olá,\n\nPreciso de avaliar mais volume para a minha conta BatchCutout Pro.\n\nMotivo: {reason}\nEmail da conta: {email}\nLimite por lote atual: {batchLimit} imagens\nLimite mensal atual: {monthlyLimit} imagens\nImagens restantes este mês: {monthlyRemaining}\n\nFonte: {source}\n\nObrigado.",
  volumeReasonMonthly: "limite mensal atingido",
  volumeReasonBatch: "limite por lote atingido",
  volumeReasonGeneral: "pedido de mais volume",
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
    postDownloadNextText: "If the result looks good, turn this test into production: founder plan at EUR 15/month, batches up to 100 images, and 2,000 images per month. If you are still evaluating, get the link and a short checklist by email.",
    postDownloadChecklistLink: "Direct link back to the tool",
    postDownloadChecklistPrep: "Checklist for cleaner product-photo cutouts",
    postDownloadChecklistPlan: "Founder plan summary if you need volume",
    postDownloadFounderCta: "Create account and start founder plan - EUR 15/month",
    postDownloadSaveLinkCta: "Get link and checklist",
    postDownloadNextNote: "No card for the free test. Secure Stripe payment when you choose Pro.",
    leadCaptureKicker: "Link and checklist",
    leadCaptureTitle: "Want to save this workflow for later?",
    leadCaptureText: "Leave your email and we will send the tool link, a short product-photo checklist, and the Pro option if you need volume.",
    leadCapturePlaceholder: "Your email",
    leadCaptureSubmit: "Get link and checklist",
    leadCaptureDismiss: "Not now",
    leadCaptureNote: "You can opt out by replying to the email. We do not send your images.",
    leadCaptureSuccess: "Saved. You should receive the BatchCutout link and checklist shortly.",
    leadCaptureInvalid: "Enter a valid email.",
    cookieText: "We use simple measurement to understand visits and Pro signups. You can accept or continue without measurement.",
    cookieAccept: "Accept measurement",
    cookieDecline: "Continue without measurement",
    proInlineKicker: "BatchCutout Pro",
    proInlineTitle: "Turn this test into production for EUR 15/month",
    proInlineLead: "You have seen the result with real photos. The founder plan unlocks batches up to 100 images for catalogs, variants, and marketplaces.",
    proInlineBenefits: "Founder plan EUR 15/month. Monthly Pro EUR 19/month. Annual EUR 190/year saves EUR 38.",
    proInlineTitleBatchLimit: "You selected {total} images. Founder unlocks the full batch.",
    proInlineLeadBatchLimit: "The free test adds {accepted}. Pro processes up to 100 images per batch and 2,000 per month, with store-ready ZIP export.",
    proInlineBenefitsBatchLimit: "If this is a real catalog or marketplace batch, start with the founder plan: EUR 15/month and cancel anytime.",
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
    accountBadgeCheckout: "Plan selected",
    accountBadgeFree: "Free",
    accountBadgePro: "Pro",
    accountStatusGuest: "Create a free account to connect Pro to your email, or sign in to manage access.",
    accountStatusCheckoutPending: "Selected plan: {plan}. Create a free account with email and password; then we open Stripe for payment.",
    accountCheckoutGuideLabel: "Steps to activate Pro",
    accountCheckoutGuideAccount: "Create account or sign in",
    accountCheckoutGuideStripe: "Stripe payment",
    accountCheckoutGuideActive: "Pro activates automatically",
    accountStatusLoading: "Checking your account...",
    accountStatusFree: "Free account. Pro unlocks up to 100 images per batch and 2,000 images per month.",
    accountStatusPro: "Pro account active. Up to {batchLimit} images per batch and {monthlyRemaining} of {monthlyLimit} available this month.",
    accountUsageTitle: "Monthly usage",
    accountUsageCount: "{used} of {limit} images used",
    accountUsageReset: "Monthly limit resets on {date}.",
    accountUsageResetUnknown: "Monthly limit resets at the start of next month.",
    accountStatusConfigMissing: "Pro login is not configured in this environment yet.",
    accountEmailPlaceholder: "Your email",
    accountPasswordPlaceholder: "Your password (min. 6 characters)",
    passwordShow: "Show",
    passwordHide: "Hide",
    accountAuthNote: "No payment happens at this step. The account only connects Stripe to Pro access; your images stay in the browser.",
    accountSubmit: "Sign in",
    accountSubmitCheckout: "Sign in and continue",
    accountSubmitSending: "Signing in...",
    accountCreate: "Create account and continue",
    accountCreateCheckout: "Create account and continue to payment",
    accountCreateSending: "Creating account...",
    accountRefresh: "Refresh account",
    accountLogout: "Sign out",
    billingEarly: "Founder plan - EUR 15/month (best start)",
    billingMonthly: "Pro monthly - EUR 19/month",
    billingAnnual: "Pro annual - EUR 190/year (save EUR 38)",
    billingPortal: "Manage payment",
    billingCheckoutStarting: "Opening payment...",
    billingPortalStarting: "Opening billing...",
    billingCheckoutSuccess: "Payment received. Pro activation can take a few seconds.",
    billingCheckoutCancelled: "Payment cancelled. You can try again whenever you want.",
    billingLoginRequired: "Create a free account or sign in. Only then do we open Stripe for the selected plan.",
    billingCheckoutError: "We could not open payment right now.",
    billingPortalError: "We could not open billing management right now.",
    accountMagicLinkSent: "Signed in.",
    accountSignupSuccess: "Account created. Confirm your email and return to this page to sign in.",
    accountSignupSuccessCheckout: "Account created. Confirm your email and return to this page; the selected plan stays ready to open payment.",
    accountConfirmationResent: "This email still needs confirmation. We resent the link; confirm your email and return to this page to continue to payment.",
    accountExistingLoginReady: "Existing account found. Signing in and continuing to payment...",
    accountExistingLoginError: "This email already has an account. Use Sign in with the correct password to continue.",
    accountSignupReady: "Account created. Opening the Pro payment you chose...",
    accountSignupReadyNoPlan: "Account created. Choose a Pro plan whenever you want to activate paid limits.",
    accountLoggedOut: "Signed out.",
    accountAuthError: "We could not sign you in. Check the password or create an account if you do not have one yet.",
    accountSignupError: "We could not create the account. If this email already exists, use Sign in.",
    accountReserveError: "Your account does not allow this batch right now.",
    accountMonthlyLimitReached: "Your Pro account reached the monthly limit of {monthlyLimit} images.",
    volumeContactCta: "Talk about higher volume",
    volumeContactEmailSubject: "BatchCutout - I need more volume",
    volumeContactEmailBody: "Hi,\n\nI need to evaluate more volume for my BatchCutout Pro account.\n\nReason: {reason}\nAccount email: {email}\nCurrent batch limit: {batchLimit} images\nCurrent monthly limit: {monthlyLimit} images\nImages remaining this month: {monthlyRemaining}\n\nSource: {source}\n\nThanks.",
    volumeReasonMonthly: "monthly limit reached",
    volumeReasonBatch: "batch limit reached",
    volumeReasonGeneral: "higher volume request",
    statusTooManyFilesPro: "Your current access allows up to {limit} images per batch.",
    resultReadyKicker: "Result ready",
    resultReadyTitle: "Want to repeat this for larger batches?",
    downloadReadyHint: "If the cutout looks good, the founder plan turns this test into production: up to 100 images per batch, 2,000 per month, and a store-ready ZIP.",
    zipProCta: "Create account and start founder plan - EUR 15/month",
    resultReadySaveLinkCta: "Get link and checklist",
    resultReadyMicrocopy: "No lock-in. Secure Stripe payment.",
    resultReadyStickyLabel: "Options after the result is ready",
    resultReadyStickyKicker: "Result ready",
    resultReadyStickyText: "Have more photos to process? Pro unlocks 100 images per batch for EUR 15/month.",
    resultReadyStickyProCta: "Start founder plan",
    resultReadyStickySaveCta: "Get link",
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
    passwordShow: "Mostrar",
    passwordHide: "Ocultar",
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
    batchLimitNote: "{limit} imágenes gratis. Para más volumen, elige Pro.",
    postDownloadKicker: "Siguiente lote",
    postDownloadTitle: "¿BatchCutout ayudó con tus fotos?",
    postDownloadSavedTime: "Sí, ahorró tiempo",
    postDownloadNeedsQuality: "Necesita mejor recorte",
    postDownloadLargerBatches: "Necesito lotes mayores",
    postDownloadThanks: "Gracias. Tu respuesta nos ayuda a mejorar la herramienta.",
    postDownloadNextKicker: "Siguiente lote",
    postDownloadNextTitle: "Resultado descargado. ¿Quieres repetir esto en más productos?",
    postDownloadNextText: "Si el resultado quedó bien, convierte esta prueba en producción: plan fundador por 15 EUR/mes, lotes de hasta 100 imágenes y 2.000 imágenes al mes. Si aún estás evaluando, recibe el enlace y un checklist corto por email.",
    postDownloadChecklistLink: "Enlace directo para volver a la herramienta",
    postDownloadChecklistPrep: "Checklist para mejores recortes de producto",
    postDownloadChecklistPlan: "Resumen del plan fundador si necesitas volumen",
    postDownloadFounderCta: "Crear cuenta y activar fundador - 15 EUR/mes",
    postDownloadSaveLinkCta: "Recibir enlace y checklist",
    postDownloadNextNote: "Sin tarjeta en la prueba gratis. Pago seguro por Stripe cuando elijas Pro.",
    proInlineTitle: "Convierte esta prueba en producción por 15 EUR/mes",
    proInlineLead: "Ya viste el resultado con fotos reales. El plan fundador desbloquea lotes de hasta 100 imágenes para catálogos, variantes y marketplaces.",
    proInlineBenefits: "Plan fundador 15 EUR/mes. Pro mensual 19 EUR/mes. Anual 190 EUR/año, ahorra 38 EUR frente al mensual.",
    proInlineTitleBatchLimit: "Seleccionaste {total} imágenes. El fundador desbloquea el lote completo.",
    proInlineLeadBatchLimit: "En la prueba gratis entran {accepted}. Con Pro procesas hasta 100 imágenes por lote y 2.000 al mes, con ZIP listo para tienda.",
    proInlineBenefitsBatchLimit: "Si este es un lote real para catálogo o marketplace, empieza con el plan fundador: 15 EUR/mes y cancela cuando quieras.",
    accountKicker: "Acceso Pro",
    accountBadgeGuest: "Sin sesión",
    accountBadgeCheckout: "Plan elegido",
    accountBadgeFree: "Gratis",
    accountBadgePro: "Pro",
    accountStatusGuest: "Crea una cuenta gratis para conectar Pro con tu email, o entra para gestionar el acceso.",
    accountStatusCheckoutPending: "Plan elegido: {plan}. Crea una cuenta gratis con email y contraseña; después abrimos Stripe para pagar.",
    accountUsageTitle: "Uso mensual",
    accountUsageCount: "{used} de {limit} imágenes usadas",
    accountUsageReset: "El límite mensual se renueva el {date}.",
    accountUsageResetUnknown: "El límite mensual se renueva al inicio del próximo mes.",
    accountCheckoutGuideLabel: "Pasos para activar Pro",
    accountCheckoutGuideAccount: "Crea cuenta o entra",
    accountCheckoutGuideStripe: "Pago Stripe",
    accountCheckoutGuideActive: "Pro se activa automáticamente",
    accountStatusLoading: "Verificando tu cuenta...",
    accountStatusFree: "Cuenta gratuita. Pro activa hasta 100 imágenes por lote y 2.000 imágenes al mes.",
    accountStatusPro: "Cuenta Pro activa. Hasta {batchLimit} imágenes por lote y {monthlyRemaining} de {monthlyLimit} disponibles este mes.",
    accountStatusConfigMissing: "El login Pro todavía no está configurado en este entorno.",
    accountEmailPlaceholder: "Tu email",
    accountAuthNote: "No hay pago en este paso. La cuenta solo conecta Stripe con el acceso Pro; tus imágenes siguen en el navegador.",
    accountPasswordPlaceholder: "Tu contraseña (mín. 6 caracteres)",
    passwordShow: "Mostrar",
    passwordHide: "Ocultar",
    accountSubmit: "Entrar",
    accountSubmitCheckout: "Entrar y continuar",
    accountSubmitSending: "Entrando...",
    accountCreate: "Crear cuenta y continuar",
    accountCreateCheckout: "Crear cuenta y continuar al pago",
    accountCreateSending: "Creando cuenta...",
    accountRefresh: "Actualizar cuenta",
    accountLogout: "Salir",
    billingEarly: "Plan fundador - 15 EUR/mes (mejor entrada)",
    billingMonthly: "Pro mensual - 19 EUR/mes",
    billingAnnual: "Pro anual - 190 EUR/año (ahorra 38 EUR)",
    billingPortal: "Gestionar pago",
    billingCheckoutStarting: "Abriendo pago...",
    billingPortalStarting: "Abriendo gestión de pago...",
    billingCheckoutSuccess: "Pago recibido. La activación Pro puede tardar unos segundos.",
    billingCheckoutCancelled: "Pago cancelado. Puedes intentarlo de nuevo cuando quieras.",
    billingLoginRequired: "Crea una cuenta gratis o entra. Solo después abrimos Stripe para pagar el plan elegido.",
    billingCheckoutError: "No se pudo abrir el pago ahora.",
    billingPortalError: "No se pudo abrir la gestión de pago ahora.",
    accountMagicLinkSent: "Sesión iniciada.",
    accountSignupSuccess: "Cuenta creada. Confirma el email y vuelve a esta página para entrar.",
    accountSignupSuccessCheckout: "Cuenta creada. Confirma el email y vuelve a esta página; el plan elegido queda listo para abrir el pago.",
    accountConfirmationResent: "Este email todavía necesita confirmación. Reenviamos el enlace; confirma el email y vuelve a esta página para continuar al pago.",
    accountExistingLoginReady: "Cuenta existente encontrada. Entrando y continuando al pago...",
    accountExistingLoginError: "Este email ya tiene cuenta. Usa Entrar con la contraseña correcta para continuar.",
    accountSignupReady: "Cuenta creada. Abriendo el pago Pro elegido...",
    accountSignupReadyNoPlan: "Cuenta creada. Elige un plan Pro cuando quieras activar los límites de pago.",
    accountLoggedOut: "Sesión cerrada.",
    accountAuthError: "No se pudo iniciar sesión. Confirma la contraseña o crea una cuenta si todavía no tienes una.",
    accountSignupError: "No se pudo crear la cuenta. Si este email ya existe, usa Entrar.",
    accountReserveError: "Tu cuenta no permite este lote ahora mismo.",
    accountMonthlyLimitReached: "Tu cuenta Pro alcanzó el límite mensual de {monthlyLimit} imágenes.",
    volumeContactCta: "Hablar sobre más volumen",
    volumeContactEmailSubject: "BatchCutout - necesito más volumen",
    volumeContactEmailBody: "Hola,\n\nNecesito evaluar más volumen para mi cuenta BatchCutout Pro.\n\nMotivo: {reason}\nEmail de la cuenta: {email}\nLímite actual por lote: {batchLimit} imágenes\nLímite mensual actual: {monthlyLimit} imágenes\nImágenes restantes este mes: {monthlyRemaining}\n\nFuente: {source}\n\nGracias.",
    volumeReasonMonthly: "límite mensual alcanzado",
    volumeReasonBatch: "límite por lote alcanzado",
    volumeReasonGeneral: "solicitud de más volumen",
    resultReadyKicker: "Resultado listo",
    resultReadyTitle: "¿Quieres repetir esto en lotes mayores?",
    downloadReadyHint: "Si el recorte quedó bien, el plan fundador convierte esta prueba en producción: hasta 100 imágenes por lote, 2.000 al mes y ZIP listo para tienda.",
    zipProCta: "Crear cuenta y activar fundador - 15 EUR/mes",
    resultReadySaveLinkCta: "Recibir enlace y checklist",
    resultReadyMicrocopy: "Sin permanencia. Pago seguro por Stripe.",
    resultReadyStickyLabel: "Opciones después del resultado listo",
    resultReadyStickyKicker: "Resultado listo",
    resultReadyStickyText: "¿Tienes más fotos? Pro desbloquea 100 imágenes por lote por 15 EUR/mes.",
    resultReadyStickyProCta: "Activar fundador",
    resultReadyStickySaveCta: "Recibir enlace",
    privacyLink: "Privacidad y términos",
    statusTooManyFiles: "Se añadieron {accepted} de {total} imágenes. Para procesar lotes mayores de una vez, elige Pro.",
    statusNoSupportedFiles: "No se encontró ningún archivo de imagen compatible.",
    statusEngineLoading: "Cargando el motor de eliminación. La primera vez puede tardar más.",
    statusError: "no se pudo procesar. Prueba JPG, PNG o WebP.",
    statusTooManyFilesPro: "Tu acceso actual permite hasta {limit} imágenes por lote.",
    removeImage: "Eliminar imagen",
  },
  fr: {
    trustText: "Idéal pour les boutiques en ligne, les catalogues, les marketplaces et les équipes qui traitent beaucoup d'images.",
    privacyNote: "Les images sont traitées sur votre appareil et ne sont pas envoyées à nos serveurs.",
    formatNote: "Certains formats peuvent dépendre de la prise en charge du navigateur.",
    batchLimitNote: "{limit} images gratuites. Pour plus de volume, choisissez Pro.",
    privacyLink: "Confidentialité et conditions",
    statusTooManyFiles: "{accepted} image(s) sur {total} ont été ajoutée(s). Pour traiter de plus grands lots en une fois, choisissez Pro.",
    statusNoSupportedFiles: "Aucun fichier image compatible n'a été trouvé.",
    statusEngineLoading: "Chargement du moteur de suppression. La première fois peut prendre plus de temps.",
    statusError: "n'a pas pu être traité. Essayez JPG, PNG ou WebP.",
    removeImage: "Supprimer l'image",
  },
  de: {
    trustText: "Ideal für Online-Shops, Kataloge, Marktplätze und Teams, die viele Bilder bearbeiten.",
    privacyNote: "Bilder werden auf Ihrem Gerät verarbeitet und nicht auf unsere Server hochgeladen.",
    formatNote: "Einige Formate können von der Browser-Unterstützung abhängen.",
    batchLimitNote: "{limit} Bilder kostenlos. Für mehr Volumen Pro wählen.",
    privacyLink: "Datenschutz und Bedingungen",
    statusTooManyFiles: "{accepted} von {total} Bildern wurden hinzugefügt. Um größere Stapel auf einmal zu verarbeiten, Pro wählen.",
    statusNoSupportedFiles: "Keine unterstützte Bilddatei gefunden.",
    statusEngineLoading: "Entfernungsmodul wird geladen. Der erste Lauf kann länger dauern.",
    statusError: "konnte nicht verarbeitet werden. Versuchen Sie JPG, PNG oder WebP.",
    removeImage: "Bild entfernen",
  },
  it: {
    trustText: "Ideale per negozi online, cataloghi, marketplace e team che gestiscono molte immagini.",
    privacyNote: "Le immagini vengono elaborate sul tuo dispositivo e non vengono caricate sui nostri server.",
    formatNote: "Alcuni formati possono dipendere dal supporto del browser.",
    batchLimitNote: "{limit} immagini gratis. Per più volume, scegli Pro.",
    privacyLink: "Privacy e termini",
    statusTooManyFiles: "Sono state aggiunte {accepted} immagini su {total}. Per elaborare lotti più grandi in una volta, scegli Pro.",
    statusNoSupportedFiles: "Nessun file immagine supportato trovato.",
    statusEngineLoading: "Caricamento del motore di rimozione. La prima volta può richiedere più tempo.",
    statusError: "non è stato possibile elaborarla. Prova JPG, PNG o WebP.",
    removeImage: "Rimuovi immagine",
  },
  nl: {
    trustText: "Ideaal voor webshops, catalogi, marketplaces en teams die veel afbeeldingen verwerken.",
    privacyNote: "Afbeeldingen worden op je apparaat verwerkt en niet naar onze servers geüpload.",
    formatNote: "Sommige formaten zijn afhankelijk van browserondersteuning.",
    batchLimitNote: "{limit} afbeeldingen gratis. Kies Pro voor meer volume.",
    privacyLink: "Privacy en voorwaarden",
    statusTooManyFiles: "{accepted} van {total} afbeeldingen zijn toegevoegd. Kies Pro om grotere batches tegelijk te verwerken.",
    statusNoSupportedFiles: "Geen ondersteund afbeeldingsbestand gevonden.",
    statusEngineLoading: "Verwijderingsengine laden. De eerste keer kan langer duren.",
    statusError: "kon niet worden verwerkt. Probeer JPG, PNG of WebP.",
    removeImage: "Afbeelding verwijderen",
  },
  pl: {
    trustText: "Idealne dla sklepów online, katalogów, marketplace'ów i zespołów przetwarzających wiele zdjęć.",
    privacyNote: "Obrazy są przetwarzane na Twoim urządzeniu i nie są przesyłane na nasze serwery.",
    formatNote: "Niektóre formaty mogą zależeć od obsługi w przeglądarce.",
    batchLimitNote: "{limit} obrazów gratis. Wybierz Pro przy większym wolumenie.",
    privacyLink: "Prywatność i warunki",
    statusTooManyFiles: "Dodano {accepted} z {total} obrazów. Aby przetwarzać większe partie naraz, wybierz Pro.",
    statusNoSupportedFiles: "Nie znaleziono obsługiwanego pliku obrazu.",
    statusEngineLoading: "Ładowanie silnika usuwania. Pierwsze uruchomienie może potrwać dłużej.",
    statusError: "nie można było przetworzyć. Spróbuj JPG, PNG lub WebP.",
    removeImage: "Usuń obraz",
  },
  sv: {
    trustText: "Perfekt för webbutiker, kataloger, marknadsplatser och team som hanterar många bilder.",
    privacyNote: "Bilderna bearbetas på din enhet och laddas inte upp till våra servrar.",
    formatNote: "Vissa format kan bero på webbläsarens stöd.",
    batchLimitNote: "{limit} bilder gratis. Välj Pro för större volymer.",
    privacyLink: "Integritet och villkor",
    statusTooManyFiles: "{accepted} av {total} bilder har lagts till. Välj Pro för att bearbeta större batcher på en gång.",
    statusNoSupportedFiles: "Ingen bildfil som stöds hittades.",
    statusEngineLoading: "Laddar borttagningsmotorn. Första gången kan ta längre tid.",
    statusError: "kunde inte bearbetas. Prova JPG, PNG eller WebP.",
    removeImage: "Ta bort bild",
  },
  da: {
    trustText: "Ideel til webshops, kataloger, markedspladser og teams, der behandler mange billeder.",
    privacyNote: "Billederne behandles på din enhed og uploades ikke til vores servere.",
    formatNote: "Nogle formater kan afhænge af browserunderstøttelse.",
    batchLimitNote: "{limit} billeder gratis. Vælg Pro ved større mængder.",
    privacyLink: "Privatliv og vilkår",
    statusTooManyFiles: "{accepted} af {total} billeder blev tilføjet. Vælg Pro for at behandle større batches ad gangen.",
    statusNoSupportedFiles: "Ingen understøttet billedfil blev fundet.",
    statusEngineLoading: "Indlæser fjernelsesmotoren. Første gang kan tage længere tid.",
    statusError: "kunne ikke behandles. Prøv JPG, PNG eller WebP.",
    removeImage: "Fjern billede",
  },
  no: {
    trustText: "Ideelt for nettbutikker, kataloger, markedsplasser og team som håndterer mange bilder.",
    privacyNote: "Bildene behandles på enheten din og lastes ikke opp til serverne våre.",
    formatNote: "Noen formater kan avhenge av nettleserstøtte.",
    batchLimitNote: "{limit} bilder gratis. Velg Pro for større volum.",
    privacyLink: "Personvern og vilkår",
    statusTooManyFiles: "{accepted} av {total} bilder ble lagt til. Velg Pro for å behandle større partier samtidig.",
    statusNoSupportedFiles: "Ingen støttet bildefil ble funnet.",
    statusEngineLoading: "Laster fjerningsmotoren. Første gang kan ta lengre tid.",
    statusError: "kunne ikke behandles. Prøv JPG, PNG eller WebP.",
    removeImage: "Fjern bilde",
  },
  fi: {
    trustText: "Ihanteellinen verkkokaupoille, katalogeille, markkinapaikoille ja tiimeille, jotka käsittelevät paljon kuvia.",
    privacyNote: "Kuvat käsitellään laitteellasi eikä niitä ladata palvelimillemme.",
    formatNote: "Jotkin muodot voivat riippua selaimen tuesta.",
    batchLimitNote: "{limit} kuvaa ilmaiseksi. Valitse Pro suurempiin määriin.",
    privacyLink: "Tietosuoja ja ehdot",
    statusTooManyFiles: "{accepted}/{total} kuvaa lisättiin. Valitse Pro käsitelläksesi suurempia eriä kerralla.",
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
    proInlineBenefits: "Plano fundador 15 EUR/mês. Pro mensal 19 EUR/mês. Anual 190 EUR/ano, poupa 38 EUR face ao mensal.",
    proEmailPlaceholder: "O seu email",
    proInlineButton: "Comprar Pro",
    proInlineNote: "Pagamento seguro por Stripe Checkout.",
    proInlineSuccess: "A abrir pagamento Pro.",
    proInlineError: "Não foi possível enviar automaticamente. Vamos abrir uma mensagem de email.",
    resultReadyKicker: "Resultado pronto",
    resultReadyTitle: "Quer repetir isto em lotes maiores?",
    downloadReadyHint: "Se o recorte ficou bom, o plano fundador transforma este teste em produção: até 100 imagens por lote, 2.000 por mês e ZIP pronto para loja.",
    zipProCta: "Criar conta e ativar fundador - 15 EUR/mês",
    resultReadySaveLinkCta: "Receber link e checklist",
    resultReadyMicrocopy: "Sem fidelização. Pagamento seguro por Stripe.",
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
    proInlineBenefits: "Founder plan EUR 15/month. Monthly Pro EUR 19/month. Annual EUR 190/year saves EUR 38.",
    proEmailPlaceholder: "Your email",
    proInlineButton: "Buy Pro",
    proInlineNote: "Secure payment through Stripe Checkout.",
    proInlineSuccess: "Opening Pro payment.",
    proInlineError: "We could not submit automatically. Opening an email draft instead.",
    resultReadyKicker: "Result ready",
    resultReadyTitle: "Want to repeat this for larger batches?",
    downloadReadyHint: "If the cutout looks good, the founder plan turns this test into production: up to 100 images per batch, 2,000 per month, and a store-ready ZIP.",
    zipProCta: "Create account and start founder plan - EUR 15/month",
    resultReadySaveLinkCta: "Get link and checklist",
    resultReadyMicrocopy: "No lock-in. Secure Stripe payment.",
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
let activeProPromptReason = "";
let activeProPromptParams = {};

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
  account_email_confirmation_required: { category: "account", label: "email_confirmation_required" },
  account_email_confirmation_resent: { category: "account", label: "email_confirmation_resent" },
  account_form_validation_failed: { category: "account", label: "form_validation_failed" },
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
    language: currentLanguage,
    free_limit: maxFilesPerBatch,
    limit_variant: maxFilesPerBatch === defaultMaxFilesPerBatch ? "default" : `limit_${maxFilesPerBatch}`,
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term"),
    gclid: params.get("gclid"),
    gbraid: params.get("gbraid"),
    wbraid: params.get("wbraid"),
    source: params.get("source"),
    medium: params.get("medium"),
    campaign: params.get("campaign"),
    first_source: storedAttribution.first?.source,
    first_medium: storedAttribution.first?.medium,
    first_campaign: storedAttribution.first?.campaign,
    first_content: storedAttribution.first?.content,
    first_term: storedAttribution.first?.term,
    first_gclid: storedAttribution.first?.gclid,
    first_gbraid: storedAttribution.first?.gbraid,
    first_wbraid: storedAttribution.first?.wbraid,
    first_landing_page: storedAttribution.first?.landing_page,
    first_seen_at: storedAttribution.first?.seen_at,
    last_source: storedAttribution.last?.source,
    last_medium: storedAttribution.last?.medium,
    last_campaign: storedAttribution.last?.campaign,
    last_content: storedAttribution.last?.content,
    last_term: storedAttribution.last?.term,
    last_gclid: storedAttribution.last?.gclid,
    last_gbraid: storedAttribution.last?.gbraid,
    last_wbraid: storedAttribution.last?.wbraid,
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
  const hasCampaignSignal = campaignParamKeys
    .some((key) => new URLSearchParams(window.location.search).has(key));
  const next = {
    first: stored.first || current,
    last: hasCampaignSignal || !stored.last ? current : stored.last,
  };

  localStorage.setItem(attributionStorageKey, JSON.stringify(next));
  recordDebugEvent("attribution_saved", next);
}

function pricingLinkHref(plan = defaultCheckoutPlan) {
  const url = new URL("./pricing/", window.location.origin);
  const selectedPlan = checkoutPlans.has(plan) ? plan : defaultCheckoutPlan;
  if (currentLanguage && currentLanguage !== "pt") {
    url.searchParams.set("lang", currentLanguage);
  }
  url.searchParams.set("checkout_plan", selectedPlan);

  const params = new URLSearchParams(window.location.search);
  for (const key of campaignParamKeys) {
    const value = params.get(key);
    if (value) url.searchParams.set(key, value);
  }

  url.hash = "pricing-account-title";
  return `${url.pathname}${url.search}${url.hash}`;
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

function isEmailConfirmationRequiredError(error) {
  const reason = authFailureReason(error);
  return reason.includes("email_not_confirmed") || reason.includes("not_confirmed") || reason.includes("confirm");
}

function isExistingAccountError(error) {
  const reason = authFailureReason(error);
  return (
    reason.includes("user_already_exists") ||
    reason.includes("identity_already_exists") ||
    reason.includes("already_registered") ||
    reason.includes("already_exists") ||
    (reason.includes("already") && (reason.includes("registered") || reason.includes("exists")))
  );
}

function isExistingAccountSignupData(data) {
  const identities = data?.user?.identities;
  return Array.isArray(identities) && identities.length === 0;
}

async function resendAccountConfirmation(email, plan = "") {
  if (!supabaseClient || !email) return false;
  const redirectTo = accountEmailRedirectUrl(plan);
  const { error } = await supabaseClient.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });
  return !error;
}

async function continueExistingAccountAfterSignup(email, password, waitingPlan = "") {
  try {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setGoogleUserData(email);
    trackEvent("account_login_succeeded", {
      source: "signup_existing_account",
      has_requested_checkout: Boolean(waitingPlan),
      checkout_plan: waitingPlan || "",
      recovered_from_signup: true,
    });
    await refreshAccount();
    setAccountMessage(waitingPlan ? "accountExistingLoginReady" : "accountMagicLinkSent");
    await maybeStartRequestedCheckout();
  } catch (error) {
    if (isEmailConfirmationRequiredError(error)) {
      const resent = await resendAccountConfirmation(email, waitingPlan);
      trackEvent("account_email_confirmation_resent", {
        source: "signup_existing_account",
        has_requested_checkout: Boolean(waitingPlan),
        checkout_plan: waitingPlan || "",
        resent,
      });
      setAccountMessage(resent ? "accountConfirmationResent" : "accountExistingLoginError");
      return;
    }
    trackEvent("account_login_failed", {
      source: "signup_existing_account",
      has_requested_checkout: Boolean(waitingPlan),
      checkout_plan: waitingPlan || "",
      recovered_from_signup: true,
      reason: authFailureReason(error),
    });
    setAccountMessage("accountExistingLoginError");
  }
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

  const hasExplicitAddon = Object.prototype.hasOwnProperty.call(translatedAddons[currentLanguage] || {}, key);
  if (currentLanguage !== "pt" && value === baseTranslation[key] && translations.en?.[key] && !hasExplicitAddon) {
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
  statusVolumeContact?.classList.toggle("hidden", !isHighVolumeStatus(key));
  updateStatusVolumeContactLink({ ...params, statusKey: key });
}

function refreshStatusText() {
  const key = statusText.dataset.statusKey || "statusWaiting";
  const params = JSON.parse(statusText.dataset.statusParams || "{}");
  statusText.textContent = t(key, params);
  statusVolumeContact?.classList.toggle("hidden", !isHighVolumeStatus(key));
  updateStatusVolumeContactLink({ ...params, statusKey: key });
}

function isHighVolumeStatus(key) {
  return key === "accountMonthlyLimitReached" || key === "statusTooManyFilesPro";
}

function highVolumeReasonKey(statusKey) {
  if (statusKey === "accountMonthlyLimitReached") return "volumeReasonMonthly";
  if (statusKey === "statusTooManyFilesPro") return "volumeReasonBatch";
  return "volumeReasonGeneral";
}

function highVolumeContactParams(params = {}) {
  const access = currentAccount?.access || {};
  const statusKey = params.statusKey || statusText.dataset.statusKey || "";
  return {
    email: currentAccount?.email || "",
    reason: t(highVolumeReasonKey(statusKey)),
    batchLimit: params.limit || access.batchLimit || defaultProBatchLimit,
    monthlyLimit: params.monthlyLimit || access.monthlyLimit || defaultProMonthlyLimit,
    monthlyRemaining: access.monthlyRemaining ?? 0,
    source: window.location.href,
    statusKey,
  };
}

function updateStatusVolumeContactLink(params = {}) {
  if (!statusVolumeContact) return;
  const contactParams = highVolumeContactParams(params);
  const subject = encodeURIComponent(t("volumeContactEmailSubject"));
  const body = encodeURIComponent(t("volumeContactEmailBody", contactParams));
  statusVolumeContact.href = `mailto:support@batchcutout.com?subject=${subject}&body=${body}`;
}

function updatePasswordToggle(input, button) {
  if (!input || !button) return;
  const visible = input.type === "text";
  button.textContent = t(visible ? "passwordHide" : "passwordShow");
  button.setAttribute("aria-pressed", String(visible));
}

function togglePasswordVisibility(input, button) {
  if (!input || !button) return;
  input.type = input.type === "password" ? "text" : "password";
  updatePasswordToggle(input, button);
  input.focus({ preventScroll: true });
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

  for (const element of document.querySelectorAll("[data-pricing-link]")) {
    element.setAttribute("href", pricingLinkHref("early"));
  }
  for (const element of document.querySelectorAll("[data-policy-link]")) {
    element.setAttribute("href", localizedPolicyLinks[currentLanguage] || localizedPolicyLinks.en);
  }

  languageSelect.value = currentLanguage;
  updatePasswordToggle(accountPassword, accountPasswordToggle);
  refreshStatusText();
  updateAccountUi();
  render();
  updateProPromptCopy();
}

function setAccountMessage(key = "", params = {}) {
  if (!accountMessage) return;
  accountMessage.textContent = key ? t(key, params) : "";
}

function formatAccountDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(languageNames[currentLanguage] || currentLanguage || "en", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function updateAccountUsageUi(access = {}) {
  if (!accountUsage || !accountUsageCount || !accountUsageBar || !accountUsageReset) return;

  if (!access.canUsePro) {
    accountUsage.classList.add("hidden");
    accountUsageBar.style.width = "0%";
    return;
  }

  const monthlyLimit = Number(access.monthlyLimit || 0) || defaultProMonthlyLimit;
  const monthlyUsed = Math.max(Number(access.monthlyUsed || 0) || 0, 0);
  const boundedUsed = Math.min(monthlyUsed, monthlyLimit);
  const percent = monthlyLimit > 0 ? Math.min(Math.round((boundedUsed / monthlyLimit) * 100), 100) : 0;
  const resetDate = formatAccountDate(access.periodEnd);

  accountUsage.classList.remove("hidden");
  accountUsageCount.textContent = t("accountUsageCount", { used: boundedUsed, limit: monthlyLimit });
  accountUsageBar.style.width = `${percent}%`;
  accountUsageReset.textContent = resetDate
    ? t("accountUsageReset", { date: resetDate })
    : t("accountUsageResetUnknown");
}

function checkoutPlanDisplayName(plan) {
  if (!checkoutPlans.has(plan || "")) return "";
  return t(checkoutPlanLabelKey(plan));
}

function syncAccountAuthButtons() {
  const waitingPlan = checkoutPlanWaitingForAuth();
  const createKey = waitingPlan ? "accountCreateCheckout" : "accountCreate";
  const submitKey = waitingPlan ? "accountSubmitCheckout" : "accountSubmit";

  if (accountCreate && !accountCreate.disabled) {
    accountCreate.textContent = t(createKey);
  }

  if (accountSubmit && !accountSubmit.disabled) {
    accountSubmit.textContent = t(submitKey);
  }
}

function trackAccountCheckoutPanelShown(plan = "") {
  if (!checkoutPlans.has(plan || "")) return;
  if (lastTrackedAccountCheckoutPanelPlan === plan) return;
  lastTrackedAccountCheckoutPanelPlan = plan;
  hasTrackedAccountFormInteraction = false;
  trackEvent("account_checkout_panel_shown", {
    source: "checkout_plan",
    has_requested_checkout: true,
    checkout_plan: plan,
  });
}

function trackAccountFormInteraction(method = "unknown") {
  if (hasTrackedAccountFormInteraction) return;
  const waitingPlan = checkoutPlanWaitingForAuth();
  if (!checkoutPlans.has(waitingPlan || "")) return;
  hasTrackedAccountFormInteraction = true;
  trackEvent("account_form_interacted", {
    source: "checkout_plan",
    has_requested_checkout: true,
    checkout_plan: waitingPlan,
    method,
  });
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
    monthlyUsed: Number(access.monthlyUsed || 0) || 0,
    monthlyRemaining: access.monthlyRemaining ?? access.monthlyLimit ?? defaultProMonthlyLimit,
    periodEnd: access.periodEnd || "",
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
    downloadReadyHint?.classList.add("hidden");
    zipProCta?.classList.add("hidden");
    resultReadySaveLinkCta?.classList.add("hidden");
    resultReadyEmailForm?.classList.add("hidden");
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
    accountPanel.classList.remove("has-pending-checkout");
    accountCheckoutGuide?.classList.add("hidden");
    prefillAccountEmail();
    accountForm?.classList.remove("hidden");
    accountActions?.classList.add("hidden");
    billingActions?.classList.add("hidden");
    billingPortal?.classList.add("hidden");
    updateAccountUsageUi({});
    if (accountCreate) accountCreate.textContent = t("accountCreate");
    if (accountSubmit) accountSubmit.textContent = t("accountSubmit");
    syncPaidAccessUi();
    updateControls();
    return;
  }

  if (!currentAccount) {
    const waitingPlan = checkoutPlanWaitingForAuth();
    const waitingPlanName = checkoutPlanDisplayName(waitingPlan);

    accountPanel.classList.toggle("has-pending-checkout", Boolean(waitingPlanName));
    accountCheckoutGuide?.classList.toggle("hidden", !waitingPlanName);
    if (waitingPlanName) trackAccountCheckoutPanelShown(waitingPlan);
    accountBadge.textContent = waitingPlanName ? t("accountBadgeCheckout") : t("accountBadgeGuest");
    accountStatus.textContent = waitingPlanName
      ? t("accountStatusCheckoutPending", { plan: waitingPlanName })
      : t("accountStatusGuest");
    prefillAccountEmail();
    accountForm?.classList.remove("hidden");
    accountActions?.classList.add("hidden");
    billingActions?.classList.add("hidden");
    billingPortal?.classList.add("hidden");
    updateAccountUsageUi({});
    syncAccountAuthButtons();
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
  accountPanel.classList.remove("has-pending-checkout");
  accountCheckoutGuide?.classList.add("hidden");
  accountForm?.classList.add("hidden");
  accountActions?.classList.remove("hidden");
  billingActions?.classList.toggle("hidden", Boolean(access.canUsePro));
  billingPortal?.classList.toggle("hidden", !access.canUsePro || !currentAccount?.billing?.hasStripeCustomer);
  updateAccountUsageUi(access);
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
    trackAccountFormValidationFailure("login");
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
    await refreshAccount();
    await maybeStartRequestedCheckout();
  } catch (error) {
    const waitingPlan = checkoutPlanWaitingForAuth();
    if (isEmailConfirmationRequiredError(error)) {
      const resent = await resendAccountConfirmation(email, waitingPlan);
      trackEvent("account_email_confirmation_resent", {
        source: waitingPlan ? "checkout_plan" : "account_panel",
        has_requested_checkout: Boolean(waitingPlan),
        checkout_plan: waitingPlan || "",
        resent,
      });
      setAccountMessage(resent ? "accountConfirmationResent" : "accountAuthError");
      return;
    }
    trackEvent("account_login_failed", {
      source: waitingPlan ? "checkout_plan" : "account_panel",
      has_requested_checkout: Boolean(waitingPlan),
      checkout_plan: waitingPlan || "",
      reason: authFailureReason(error),
    });
    setAccountMessage("accountAuthError");
  } finally {
    accountSubmit.disabled = false;
    syncAccountAuthButtons();
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
    trackAccountFormValidationFailure("signup");
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
    const redirectTo = accountEmailRedirectUrl(waitingPlan);
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) throw error;
    if (isExistingAccountSignupData(data)) {
      await continueExistingAccountAfterSignup(email, password, waitingPlan);
      return;
    }
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
      trackEvent("account_email_confirmation_required", {
        source: waitingPlan ? "checkout_plan" : "account_panel",
        has_requested_checkout: Boolean(waitingPlan),
        checkout_plan: waitingPlan || "",
      });
      setAccountMessage(waitingPlan ? "accountSignupSuccessCheckout" : "accountSignupSuccess");
    }
  } catch (error) {
    if (isExistingAccountError(error)) {
      await continueExistingAccountAfterSignup(email, password, waitingPlan);
      return;
    }
    trackEvent("account_signup_failed", {
      source: waitingPlan ? "checkout_plan" : "account_panel",
      has_requested_checkout: Boolean(waitingPlan),
      checkout_plan: waitingPlan || "",
      reason: authFailureReason(error),
    });
    setAccountMessage("accountSignupError");
  } finally {
    accountCreate.disabled = false;
    syncAccountAuthButtons();
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

function trackAccountFormValidationFailure(form = "signup") {
  const now = Date.now();
  if (now - lastAccountValidationFailureAt < 500) return;
  lastAccountValidationFailureAt = now;

  const waitingPlan = checkoutPlanWaitingForAuth();
  trackEvent("account_form_validation_failed", {
    form,
    source: waitingPlan ? "checkout_plan" : "account_panel",
    has_requested_checkout: Boolean(waitingPlan),
    checkout_plan: waitingPlan || "",
    email_valid: accountEmail?.checkValidity() || false,
    password_length: accountPassword?.value?.length || 0,
    password_valid: accountPassword?.checkValidity() || false,
  });
}

function handleAccountFormInvalid() {
  trackAccountFormValidationFailure(document.activeElement === accountSubmit ? "login" : "signup");
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
  const selectedPlan = checkoutPlans.has(plan) ? plan : defaultCheckoutPlan;
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

function accountEmailRedirectUrl(plan = "") {
  const url = new URL(`${window.location.pathname}${window.location.search}`, window.location.origin);
  if (checkoutPlans.has(plan || "")) {
    url.searchParams.set("checkout_plan", plan);
  }
  if (currentLanguage && currentLanguage !== "pt") {
    url.searchParams.set("lang", currentLanguage);
  } else {
    url.searchParams.delete("lang");
  }
  return url.toString();
}

async function startCheckout(plan = defaultCheckoutPlan, triggerButton = null) {
  const selectedPlan = checkoutPlans.has(plan) ? plan : defaultCheckoutPlan;
  const accessToken = await getCurrentAccessToken();

  if (!accessToken) {
    setPendingCheckoutPlan(selectedPlan);
    trackEvent("pro_checkout_login_required", { plan: selectedPlan });
    updateAccountUi();
    setAccountMessage("billingLoginRequired");
    accountPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => accountEmail?.focus({ preventScroll: true }), 280);
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
  const hasLeadContact = Boolean(currentAccount?.email || getCapturedLeadEmail());
  const readyCount = items.filter((item) => item.outputBlob).length;
  const shouldShowResultReadyEmail = !paidAccess && downloadReady && !running && !hasLeadContact;
  const shouldShowResultReadySticky = !paidAccess && downloadReady && !running;
  downloadReadyHint?.classList.toggle("hidden", paidAccess || !downloadReady);
  zipProCta?.classList.toggle("hidden", paidAccess || !downloadReady || running);
  resultReadySaveLinkCta?.classList.toggle("hidden", paidAccess || !downloadReady || running || hasLeadContact);
  resultReadyEmailForm?.classList.toggle("hidden", !shouldShowResultReadyEmail);
  resultReadyStickyCta?.classList.toggle("hidden", !shouldShowResultReadySticky);
  resultReadyStickyLead?.classList.toggle("hidden", hasLeadContact);
  if (!shouldShowResultReadyEmail && resultReadyEmailMessage) resultReadyEmailMessage.textContent = "";
  emptyState.classList.toggle("hidden", hasItems);
  countText.textContent = `${items.length} ${items.length === 1 ? t("photoSingular") : t("photoPlural")}`;

  if (downloadReady && !hasTrackedDownloadReady) {
    hasTrackedDownloadReady = true;
    trackEvent("download_ready_shown", {
      count: readyCount,
      mode: allReady ? "zip_available" : "single_png_available",
    });
  }

  if (shouldShowResultReadyEmail && !hasTrackedResultReadyEmailShown) {
    hasTrackedResultReadyEmailShown = true;
    trackEvent("lead_capture_shown", {
      downloadType: readyCount > 1 ? "zip_available" : "png_available",
      count: readyCount,
      source: "result_ready_inline",
      capture_source: "result_ready_inline",
      has_account: Boolean(currentAccount?.email),
    });
  }

  if (shouldShowResultReadySticky && !hasTrackedResultReadyStickyShown) {
    hasTrackedResultReadyStickyShown = true;
    trackEvent("pro_prompt_shown", {
      reason: "result_ready_sticky",
      count: readyCount,
      totalInQueue: items.length,
      free_limit: maxFilesPerBatch,
    });
  }

  if (!downloadReady && !running) {
    hasTrackedDownloadReady = false;
    hasTrackedResultReadyStickyShown = false;
  }
  if (!downloadReady || running || hasLeadContact) {
    hasTrackedResultReadyEmailShown = false;
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
      limit: maxFilesPerBatch,
      total: items.length + imageFiles.length,
    });
    render();
    if (imageFiles.length) {
      const limitDetail = {
        accepted: 0,
        attempted: imageFiles.length,
        selected: selectedFiles.length,
        unsupported: unsupportedFiles,
        rejected: imageFiles.length,
        totalInQueue: items.length,
        reason: "batch_limit",
      };
      trackBatchLimitExceeded(limitDetail);
      if (!canUsePaidAccess()) {
        showProInterest("batch_limit", limitDetail);
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
    limit: maxFilesPerBatch,
    total: imageFiles.length,
  });
  if (rejectedByLimit) {
    const limitDetail = {
      accepted: acceptedFiles.length,
      attempted: imageFiles.length,
      selected: selectedFiles.length,
      unsupported: unsupportedFiles,
      rejected: rejectedByLimit,
      totalInQueue: items.length,
      reason: "batch_limit",
    };
    trackBatchLimitExceeded(limitDetail);
    if (!canUsePaidAccess()) {
      showProInterest("batch_limit", limitDetail);
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
  resultReadyStickyCta?.classList.add("hidden");
  trackEvent("queue_cleared");
  render();
}

function showProInterest(reason = "manual", params = {}) {
  if (canUsePaidAccess()) {
    return;
  }

  const detail = { reason, totalInQueue: items.length, free_limit: maxFilesPerBatch, ...params };
  trackEvent("pro_interest_prompt_clicked", detail);
  trackEvent("tool_pro_clicked", detail);
  showProPrompt(reason, { params });
}

function updateProPromptCopy() {
  if (!proInterestPanel || !proInterestTitle || !proInterestLead || !proInterestBenefits) return;
  const batchLimitPrompt = activeProPromptReason === "batch_limit";
  const copyParams = {
    accepted: activeProPromptParams.accepted ?? maxFilesPerBatch,
    rejected: activeProPromptParams.rejected ?? 0,
    total: activeProPromptParams.attempted ?? activeProPromptParams.total ?? activeProPromptParams.selected ?? items.length,
  };
  proInterestTitle.textContent = t(batchLimitPrompt ? "proInlineTitleBatchLimit" : "proInlineTitle", copyParams);
  proInterestLead.textContent = t(batchLimitPrompt ? "proInlineLeadBatchLimit" : "proInlineLead", copyParams);
  proInterestBenefits.textContent = t(batchLimitPrompt ? "proInlineBenefitsBatchLimit" : "proInlineBenefits", copyParams);
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
  activeProPromptReason = reason;
  activeProPromptParams = options.params || {};
  if (proInlineMessage) proInlineMessage.textContent = "";
  if (proInlineSuccessCard) proInlineSuccessCard.hidden = true;
  updateProPromptCopy();

  if (wasHidden) {
    trackEvent("pro_prompt_shown", {
      reason,
      totalInQueue: items.length,
      free_limit: maxFilesPerBatch,
      ...activeProPromptParams,
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
  showLeadCapture(downloadType, count, "post_download_next");
  trackEvent("post_download_save_link_clicked", {
    downloadType,
    count,
    totalInQueue: items.length,
    free_limit: maxFilesPerBatch,
  });
  leadCapturePanel?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  leadCaptureEmail?.focus({ preventScroll: true });
}

function focusResultReadyLeadCapture(source = "result_ready") {
  const count = items.filter((item) => item.outputBlob).length;
  const downloadType = count > 1 ? "zip_available" : "png_available";
  localStorage.removeItem(leadCaptureDismissedStorageKey);
  showLeadCapture(downloadType, count, source);
  trackEvent("post_download_save_link_clicked", {
    downloadType,
    count,
    source,
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
  if (!postDownloadEmailForm) showLeadCapture(downloadType, count, "post_download");
  showProPrompt(`post_download_${downloadType}`, { scroll: false });
}

function shouldShowLeadCapture() {
  if (!leadCapturePanel || canUsePaidAccess() || currentAccount?.email) return false;
  if (localStorage.getItem(leadCaptureDismissedStorageKey)) return false;
  return !getCapturedLeadEmail();
}

function showLeadCapture(downloadType = "unknown", count = 0, captureSource = "post_download") {
  if (!shouldShowLeadCapture()) return;

  leadCapturePanel.classList.remove("hidden");
  leadCapturePanel.dataset.downloadType = downloadType;
  leadCapturePanel.dataset.downloadCount = String(count);
  leadCapturePanel.dataset.captureSource = captureSource;
  if (leadCaptureMessage) leadCaptureMessage.textContent = "";
  trackEvent("lead_capture_shown", {
    downloadType,
    count,
    source: captureSource,
    capture_source: captureSource,
    has_account: Boolean(currentAccount?.email),
  });
}

function hideLeadCapture() {
  leadCapturePanel?.classList.add("hidden");
}

function recordLeadCapture(email, { downloadType = "unknown", count = 0, source = "post_download", captureSource = source } = {}) {
  localStorage.setItem(leadCaptureEmailStorageKey, email);
  if (accountEmail && !accountEmail.value.trim()) accountEmail.value = email;
  localStorage.removeItem(leadCaptureDismissedStorageKey);
  postDownloadSaveLinkCta?.classList.add("hidden");
  resultReadySaveLinkCta?.classList.add("hidden");
  resultReadyEmailForm?.classList.add("hidden");
  postDownloadEmailForm?.classList.add("hidden");
  setGoogleUserData(email);
  trackEvent("lead_capture_submitted", {
    email,
    consent: true,
    downloadType,
    count,
    source,
    capture_source: captureSource,
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
  const captureSource = leadCapturePanel?.dataset.captureSource || "post_download";

  if (!isValidEmail(email)) {
    if (leadCaptureMessage) leadCaptureMessage.textContent = t("leadCaptureInvalid");
    trackEvent("lead_capture_invalid", { downloadType, count, source: captureSource, capture_source: captureSource });
    leadCaptureEmail.focus();
    return;
  }

  recordLeadCapture(email, {
    downloadType,
    count,
    source: captureSource,
    captureSource,
  });

  if (leadCaptureMessage) leadCaptureMessage.textContent = t("leadCaptureSuccess");
  disableFormControls(leadCaptureForm);
}

function handleResultReadyEmailSubmit(event) {
  event.preventDefault();
  if (!resultReadyEmail || !resultReadyEmailForm) return;

  const email = normalizeEmail(resultReadyEmail.value);
  const count = items.filter((item) => item.outputBlob).length;
  const downloadType = count > 1 ? "zip_available" : "png_available";

  if (!isValidEmail(email)) {
    if (resultReadyEmailMessage) resultReadyEmailMessage.textContent = t("leadCaptureInvalid");
    trackEvent("lead_capture_invalid", {
      downloadType,
      count,
      source: "result_ready_inline",
      capture_source: "result_ready_inline",
    });
    resultReadyEmail.focus();
    return;
  }

  trackEvent("post_download_save_link_clicked", {
    downloadType,
    count,
    source: "result_ready_inline",
    totalInQueue: items.length,
    free_limit: maxFilesPerBatch,
  });

  recordLeadCapture(email, {
    downloadType,
    count,
    source: "result_ready_inline",
    captureSource: "result_ready_inline",
  });

  hideLeadCapture();
  if (resultReadyEmailMessage) resultReadyEmailMessage.textContent = t("leadCaptureSuccess");
  disableFormControls(resultReadyEmailForm);
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
    captureSource: "post_download_inline",
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
    source: leadCapturePanel?.dataset.captureSource || "post_download",
    capture_source: leadCapturePanel?.dataset.captureSource || "post_download",
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
    source: params.statusKey === "statusTooManyFilesPro" ? "tool_batch_limit" : "tool_monthly_limit",
    event_label: "tool_high_volume",
    reason: params.reason,
    batch_limit: params.batchLimit,
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
zipProCta?.addEventListener("click", () => {
  const readyCount = items.filter((item) => item.outputBlob).length;
  const detail = {
    reason: "download_ready_founder",
    downloadType: readyCount > 1 ? "zip_available" : "png_available",
    count: readyCount,
    totalInQueue: items.length,
    free_limit: maxFilesPerBatch,
  };
  trackEvent("post_download_founder_clicked", detail);
  trackEvent("tool_pro_clicked", detail);
  startCheckout("early", zipProCta);
});
resultReadyStickyPro?.addEventListener("click", () => {
  const readyCount = items.filter((item) => item.outputBlob).length;
  const detail = {
    reason: "result_ready_sticky",
    downloadType: readyCount > 1 ? "zip_available" : "png_available",
    count: readyCount,
    totalInQueue: items.length,
    free_limit: maxFilesPerBatch,
  };
  trackEvent("post_download_founder_clicked", detail);
  trackEvent("tool_pro_clicked", detail);
  startCheckout("early", resultReadyStickyPro);
});
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
resultReadySaveLinkCta?.addEventListener("click", () => focusResultReadyLeadCapture());
resultReadyStickyLead?.addEventListener("click", () => focusResultReadyLeadCapture("result_ready_sticky"));
postDownloadSaveLinkCta?.addEventListener("click", focusPostDownloadLeadCapture);
resultReadyEmailForm?.addEventListener("submit", handleResultReadyEmailSubmit);
postDownloadEmailForm?.addEventListener("submit", handlePostDownloadEmailSubmit);
proInlineForm?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-checkout-plan]");
  if (!button) return;
  startCheckout(button.dataset.checkoutPlan, button);
});
accountForm?.addEventListener("focusin", () => trackAccountFormInteraction("focus"));
accountForm?.addEventListener("input", () => trackAccountFormInteraction("input"));
accountForm?.addEventListener("invalid", handleAccountFormInvalid, true);
accountForm?.addEventListener("submit", handleAccountCreate);
accountPasswordToggle?.addEventListener("click", () => togglePasswordVisibility(accountPassword, accountPasswordToggle));
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
