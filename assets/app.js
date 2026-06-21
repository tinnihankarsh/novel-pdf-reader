const pdfCanvas = document.getElementById('pdfCanvas');
const ctx = pdfCanvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const emptyState = document.getElementById('emptyState');

let pdfDoc = null;
let pageNum = 1;
let currentPage = null;
let renderTask = null;

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

function showEmptyState(show) {
  emptyState.style.display = show ? 'flex' : 'none';
}

function updatePageInfo() {
  if (!pdfDoc) {
    pageInfo.textContent = 'No document loaded';
    return;
  }

  pageInfo.textContent = `Page ${pageNum} of ${pdfDoc.numPages}`;
}

function cancelRender() {
  if (renderTask) {
    renderTask.cancel();
    renderTask = null;
  }
}

async function renderPage(num) {
  if (!pdfDoc) return;

  cancelRender();
  currentPage = await pdfDoc.getPage(num);
  const viewport = currentPage.getViewport({ scale: 1.2 });
  pdfCanvas.height = viewport.height;
  pdfCanvas.width = viewport.width;

  const renderContext = {
    canvasContext: ctx,
    viewport,
  };

  renderTask = currentPage.render(renderContext);
  await renderTask.promise;
  renderTask = null;
}

async function loadPdf(file) {
  if (!file || file.type !== 'application/pdf') return;

  const fileUrl = URL.createObjectURL(file);
  const loadingTask = pdfjsLib.getDocument(fileUrl);
  pdfDoc = await loadingTask.promise;
  pageNum = 1;
  showEmptyState(false);
  updatePageInfo();
  prevBtn.disabled = false;
  nextBtn.disabled = pdfDoc.numPages <= 1;
  await renderPage(pageNum);
  URL.revokeObjectURL(fileUrl);
}

async function changePage(step) {
  if (!pdfDoc) return;
  const nextPage = pageNum + step;
  if (nextPage < 1 || nextPage > pdfDoc.numPages) return;
  pageNum = nextPage;
  updatePageInfo();
  await renderPage(pageNum);
}

fileInput.addEventListener('change', async (event) => {
  const [file] = event.target.files || [];
  if (!file) return;
  await loadPdf(file);
});

prevBtn.addEventListener('click', () => {
  changePage(-1);
});

nextBtn.addEventListener('click', () => {
  changePage(1);
});
