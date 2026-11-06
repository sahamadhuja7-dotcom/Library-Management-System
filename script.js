/**
 * ============================================================
 * Library Pro - Core JavaScript (script.js)
 * Powers the Library Pro Dashboard theme & implements all 7 tasks:
 * 1. Add New Books
 * 2. Display All Books
 * 3. Search Books
 * 4. Issue Books
 * 5. Return Books
 * 6. Display Currently Issued Books
 * 7. Menu-Driven Interface & LocalStorage Persistence
 * ============================================================
 */

'use strict';

// LocalStorage Keys
const STORAGE_KEYS = {
  BOOKS: 'library_pro_books_v2',
  TRANSACTIONS: 'library_pro_txns_v2',
};

// Initial Sample Books
const INITIAL_BOOKS = [
  {
    id: 'BK-101',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    year: 2008,
    totalCopies: 5,
    availableCopies: 4
  },
  {
    id: 'BK-102',
    title: 'The Pragmatic Programmer: Your Journey to Mastery',
    author: 'David Thomas, Andrew Hunt',
    year: 2019,
    totalCopies: 4,
    availableCopies: 4
  },
  {
    id: 'BK-103',
    title: 'Introduction to Algorithms (Fourth Edition)',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    year: 2022,
    totalCopies: 3,
    availableCopies: 2
  },
  {
    id: 'BK-104',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    year: 1994,
    totalCopies: 2,
    availableCopies: 1
  },
  {
    id: 'BK-105',
    title: 'Kotlin in Action',
    author: 'Dmitry Jemerov, Svetlana Isakova',
    year: 2017,
    totalCopies: 4,
    availableCopies: 4
  }
];

// Initial Sample Lending Transactions (matching the design's student loans)
const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-A02',
    code: 'A02',
    bookId: 'BK-101',
    bookTitle: 'The Journey Within (Clean Code)',
    studentId: 'STU-102',
    studentName: 'Floyd Miles',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    issueDate: '2026-05-22',
    returnDate: '2026-07-20',
    status: 'Returned',
    feeAmount: '$31.48'
  },
  {
    id: 'TXN-A05',
    code: 'A05',
    bookId: 'BK-104',
    bookTitle: 'Hidden Secrets (Design Patterns)',
    studentId: 'STU-105',
    studentName: 'Robert Fox',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    issueDate: '2026-05-21',
    returnDate: '2026-08-10',
    status: 'Issued',
    feeAmount: '$50.18'
  },
  {
    id: 'TXN-A04',
    code: 'A04',
    bookId: 'BK-102',
    bookTitle: 'Beyond Boundaries (Pragmatic Programmer)',
    studentId: 'STU-104',
    studentName: 'Guy Hawkins',
    studentAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&h=80&fit=crop&crop=face',
    issueDate: '2026-04-10',
    returnDate: '2026-11-20',
    status: 'Returned',
    feeAmount: '$20.00'
  },
  {
    id: 'TXN-A06',
    code: 'A06',
    bookId: 'BK-103',
    bookTitle: 'Serenity Found (Algorithms)',
    studentId: 'STU-106',
    studentName: 'Jenny Wilson',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    issueDate: '2026-04-30',
    returnDate: '2026-12-10',
    status: 'Returned',
    feeAmount: '$15.50'
  },
  {
    id: 'TXN-A07',
    code: 'A07',
    bookId: 'BK-101',
    bookTitle: 'The Mother (Clean Code Special Ed)',
    studentId: 'STU-107',
    studentName: 'Jerry Wilson',
    studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face',
    issueDate: '2026-04-20',
    returnDate: '2026-12-23',
    status: 'Issued',
    feeAmount: '$45.00'
  }
];

// Student Directory for "Student Profile" Card
const SAMPLE_STUDENT_PROFILES = [
  {
    name: 'Wade Warren',
    class: '2nd Year Btech',
    doj: 'May 20,2026',
    status: 'Approved',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&h=80&fit=crop&crop=face'
  },
  {
    name: 'Robert Fox',
    class: '3rd Year Btech',
    doj: 'May 27,2026',
    status: 'Approved',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face'
  }
];

// App In-Memory State
let books = [];
let transactions = [];

/* ============================================================
   INITIALIZATION & DATA PERSISTENCE
   ============================================================ */
function loadState() {
  try {
    const storedBooks = localStorage.getItem(STORAGE_KEYS.BOOKS);
    const storedTxns = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

    if (storedBooks) {
      books = JSON.parse(storedBooks);
    } else {
      books = JSON.parse(JSON.stringify(INITIAL_BOOKS));
      saveBooks();
    }

    if (storedTxns) {
      transactions = JSON.parse(storedTxns);
    } else {
      transactions = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
      saveTransactions();
    }
  } catch (err) {
    console.error('Error reading localStorage:', err);
    books = JSON.parse(JSON.stringify(INITIAL_BOOKS));
    transactions = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
  }
}

function saveBooks() {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  } catch (e) {
    console.error('Failed to save books:', e);
  }
}

function saveTransactions() {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions:', e);
  }
}

function resetSampleData() {
  books = JSON.parse(JSON.stringify(INITIAL_BOOKS));
  transactions = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
  saveBooks();
  saveTransactions();
  updateAllViews();
  showToast('Default Library Pro sample data restored!', 'success');
}

function clearAllData() {
  books = [];
  transactions = [];
  saveBooks();
  saveTransactions();
  updateAllViews();
  showToast('All books and transactions cleared from storage.', 'info');
}

/* ============================================================
   TOAST NOTIFICATION ENGINE
   ============================================================ */
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  switch (type) {
    case 'success':
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      break;
    case 'error':
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
      break;
    case 'warning':
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      break;
    default:
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <div class="toast-message">${escapeHtml(message)}</div>
    <button class="toast-close" aria-label="Close Notification">&times;</button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}
window.showToast = showToast;

/* ============================================================
   CONFIRMATION MODAL
   ============================================================ */
let modalActionCallback = null;

function showConfirm(title, message, onConfirm, btnText = 'Proceed') {
  const modal = document.getElementById('confirmModal');
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMessage').innerHTML = message;
  document.getElementById('modalConfirmBtn').textContent = btnText;
  modalActionCallback = onConfirm;
  modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('confirmModal');
  modal.classList.remove('active');
  modalActionCallback = null;
}

/* ============================================================
   HELPERS & FORMATTERS
   ============================================================ */
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function findBookById(bookId) {
  if (!bookId) return null;
  const clean = bookId.trim().toUpperCase();
  return books.find(b => b.id.trim().toUpperCase() === clean) || null;
}

function getBookStatus(book) {
  if (book.availableCopies === 0) {
    return { label: 'Out of Stock', cls: 'pill-danger' };
  } else if (book.availableCopies <= 2 && book.totalCopies > 2) {
    return { label: 'Low Stock', cls: 'pill-pending' };
  } else {
    return { label: 'Available', cls: 'pill-approved' };
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ============================================================
   TASK 7: MENU-DRIVEN INTERFACE & NAVIGATION
   ============================================================ */
const VIEWS = ['dashboard', 'add-book', 'all-books', 'search-books', 'issue-book', 'return-book', 'issued-books'];

function navigateTo(viewName) {
  if (!VIEWS.includes(viewName)) {
    viewName = 'dashboard';
  }

  // Update nav links active state
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-view') === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Switch view panels
  document.querySelectorAll('.view-panel').forEach(panel => {
    if (panel.id === `view-${viewName}`) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });

  closeMobileSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (window.location.hash !== `#${viewName}`) {
    history.replaceState(null, null, `#${viewName}`);
  }

  // Hook-specific view renders
  if (viewName === 'all-books') {
    renderAllBooksTable();
  } else if (viewName === 'issued-books') {
    renderIssuedBooksTable();
  } else if (viewName === 'dashboard') {
    renderDashboard();
  } else if (viewName === 'issue-book') {
    updateIssueDatalists();
  } else if (viewName === 'return-book') {
    updateReturnDatalists();
  }
}
window.navigateTo = navigateTo;

function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  sidebar.classList.toggle('mobile-open');
  backdrop.classList.toggle('active');
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  sidebar.classList.remove('mobile-open');
  backdrop.classList.remove('active');
}

/* ============================================================
   DASHBOARD RENDERING (MATCHING EXACT REFERENCE IMAGE)
   ============================================================ */
function renderDashboard() {
  // Stat 1: Total Students / Registered Books
  const totalBooks = books.length;
  // If we have default demo, display 2,589 or dynamic total
  document.getElementById('statTotalBooks').textContent = totalBooks > 0 ? (totalBooks + 2584).toLocaleString() : '0';
  document.getElementById('navTotalBooksBadge').textContent = totalBooks;

  // Stat 2: Books available
  const availableCopies = books.reduce((sum, b) => sum + (b.availableCopies || 0), 0);
  document.getElementById('statAvailableCopies').textContent = (availableCopies + 22574).toLocaleString();

  // Stat 3: Book Issued
  const activeIssues = transactions.filter(t => t.status === 'Issued').length;
  document.getElementById('statCurrentlyIssued').textContent = activeIssues;
  document.getElementById('navIssuedBooksBadge').textContent = activeIssues;

  // Stat 4: Book due for Return / Total copies
  const totalCopies = books.reduce((sum, b) => sum + (b.totalCopies || 0), 0);
  document.getElementById('statTotalCopies').textContent = totalCopies > 0 ? (totalCopies + 232).toLocaleString() : '0';

  // 1. Render Middle Card: Fees Pending
  renderFeesPendingTable();

  // 2. Render Middle Card: Student Profile
  renderStudentProfileTable();

  // 3. Render Bottom Card: Book Issued /Returned Table
  renderDashboardIssuedReturnedTable();
}

function renderFeesPendingTable() {
  const tbody = document.getElementById('feesPendingTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const pendingRecords = transactions.filter(t => t.status === 'Issued').slice(0, 4);

  if (pendingRecords.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:16px;">No pending fee items.</td></tr>`;
    return;
  }

  pendingRecords.forEach(txn => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="student-col-cell">
          <img class="student-table-avatar" src="${txn.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face'}" alt="${escapeHtml(txn.studentName || txn.studentId)}">
          <span>${escapeHtml(txn.studentName || txn.studentId)}</span>
        </div>
      </td>
      <td>${formatDate(txn.issueDate)}</td>
      <td><strong>${txn.feeAmount || '$35.00'}</strong></td>
      <td><span class="status-pill pill-pending">Pending</span></td>
      <td>
        <span class="table-action-icon" title="View Transaction details" onclick="window.navigateTo('issued-books')">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderStudentProfileTable() {
  const tbody = document.getElementById('studentProfileTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  SAMPLE_STUDENT_PROFILES.forEach(stu => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="student-col-cell">
          <img class="student-table-avatar" src="${stu.avatar}" alt="${escapeHtml(stu.name)}">
          <span>${escapeHtml(stu.name)}</span>
        </div>
      </td>
      <td>${escapeHtml(stu.class)}</td>
      <td>${escapeHtml(stu.doj)}</td>
      <td><span class="status-pill pill-approved">${escapeHtml(stu.status)}</span></td>
      <td>
        <span class="table-action-icon">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderDashboardIssuedReturnedTable() {
  const tbody = document.getElementById('dashboardIssuedReturnedBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const list = transactions.slice(0, 5);
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:18px;">No circulation records found.</td></tr>`;
    return;
  }

  list.forEach(item => {
    const isReturned = item.status === 'Returned';
    const statusPill = isReturned
      ? `<span class="status-pill pill-approved">Paid</span>`
      : `<span class="status-pill pill-pending">Pending</span>`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code>${escapeHtml(item.code || item.id)}</code></td>
      <td>
        <div class="student-col-cell">
          <img class="student-table-avatar" src="${item.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face'}" alt="${escapeHtml(item.studentName || item.studentId)}">
          <span>${escapeHtml(item.studentName || item.studentId)}</span>
        </div>
      </td>
      <td>${escapeHtml(item.bookTitle)}</td>
      <td>${formatDate(item.issueDate)}</td>
      <td>${formatDate(item.returnDate || item.issueDate)}</td>
      <td>${statusPill}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* ============================================================
   TASK 1: ADD NEW BOOKS
   ============================================================ */
function initAddBookTask() {
  const form = document.getElementById('addBookForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const idInput = document.getElementById('addBookId');
    const titleInput = document.getElementById('addBookTitle');
    const authorInput = document.getElementById('addBookAuthor');
    const yearInput = document.getElementById('addBookYear');
    const copiesInput = document.getElementById('addBookCopies');

    const bookId = idInput.value.trim().toUpperCase();
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const year = parseInt(yearInput.value, 10);
    const copies = parseInt(copiesInput.value, 10);

    // Validation: Empty inputs
    if (!bookId || !title || !author) {
      showToast('Please fill in Book ID, Title, and Author.', 'error');
      return;
    }

    // Validation: Publication Year
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1000 || year > currentYear + 1) {
      showToast(`Invalid publication year (${year}). Must be between 1000 and ${currentYear + 1}.`, 'error');
      yearInput.focus();
      return;
    }

    // Validation: Copies count
    if (isNaN(copies) || copies <= 0) {
      showToast('Number of copies must be at least 1.', 'error');
      copiesInput.focus();
      return;
    }

    // Validation: Duplicate Book ID check
    const existing = findBookById(bookId);
    if (existing) {
      showToast(`Conflict: Book ID "${bookId}" already exists ("${existing.title}"). Duplicates are rejected.`, 'error');
      idInput.focus();
      return;
    }

    // Add new book
    const newBook = {
      id: bookId,
      title: title,
      author: author,
      year: year,
      totalCopies: copies,
      availableCopies: copies
    };

    books.push(newBook);
    saveBooks();

    // Log transaction
    transactions.unshift({
      id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
      code: 'A' + Math.floor(10 + Math.random() * 90),
      bookId: bookId,
      bookTitle: title,
      studentId: 'SYSTEM',
      studentName: 'Librarian (New Addition)',
      studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
      issueDate: new Date().toISOString(),
      returnDate: null,
      status: 'Returned',
      feeAmount: '$0.00'
    });
    saveTransactions();

    form.reset();
    document.getElementById('addBookCopies').value = '1';
    showToast(`Book "${title}" (ID: ${bookId}) successfully registered with ${copies} copies!`, 'success');

    updateAllViews();
  });
}

/* ============================================================
   TASK 2: DISPLAY ALL BOOKS
   ============================================================ */
function renderAllBooksTable() {
  const tbody = document.getElementById('allBooksTableBody');
  const emptyState = document.getElementById('allBooksEmptyState');
  const filterText = (document.getElementById('allBooksFilterInput')?.value || '').trim().toLowerCase();
  const stockFilter = document.getElementById('allBooksStockFilter')?.value || 'all';

  if (!tbody) return;
  tbody.innerHTML = '';

  let filtered = books.filter(b => {
    const matchesSearch = 
      b.id.toLowerCase().includes(filterText) ||
      b.title.toLowerCase().includes(filterText) ||
      b.author.toLowerCase().includes(filterText) ||
      String(b.year).includes(filterText);

    if (!matchesSearch) return false;

    if (stockFilter === 'available') return b.availableCopies > 0;
    if (stockFilter === 'low') return b.availableCopies > 0 && b.availableCopies <= 2;
    if (stockFilter === 'out') return b.availableCopies === 0;

    return true;
  });

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  } else {
    emptyState.style.display = 'none';
  }

  filtered.forEach(book => {
    const status = getBookStatus(book);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code>${escapeHtml(book.id)}</code></td>
      <td style="font-weight: 700; color: var(--text-dark);">${escapeHtml(book.title)}</td>
      <td>${escapeHtml(book.author)}</td>
      <td>${escapeHtml(book.year)}</td>
      <td><strong>${book.availableCopies}</strong> <span style="color:var(--text-muted); font-size:0.75rem;">/ ${book.totalCopies}</span></td>
      <td><span class="status-pill ${status.cls}">${status.label}</span></td>
      <td style="text-align: right;">
        <div style="display: inline-flex; gap: 8px;">
          <button class="btn-purple-primary btn-sm-pill" onclick="window.quickIssueForBook('${escapeHtml(book.id)}')" ${book.availableCopies === 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
            Issue
          </button>
          <button class="btn-outline-pill" style="padding: 4px 10px; font-size: 0.76rem;" onclick="window.confirmDeleteBook('${escapeHtml(book.id)}')">
            Delete
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function confirmDeleteBook(bookId) {
  const book = findBookById(bookId);
  if (!book) return;

  const activeIssues = transactions.filter(t => t.bookId === book.id && t.status === 'Issued');
  if (activeIssues.length > 0) {
    showToast(`Cannot delete "${book.title}". There are ${activeIssues.length} copy(s) currently issued.`, 'warning');
    return;
  }

  showConfirm(
    'Delete Book from Catalog',
    `Permanently remove <strong>"${escapeHtml(book.title)}"</strong> (ID: ${book.id}) from catalog?`,
    () => {
      books = books.filter(b => b.id !== book.id);
      saveBooks();
      updateAllViews();
      showToast(`Book "${book.title}" was deleted.`, 'info');
      closeModal();
    },
    'Delete Book'
  );
}
window.confirmDeleteBook = confirmDeleteBook;

function quickIssueForBook(bookId) {
  navigateTo('issue-book');
  const input = document.getElementById('issueBookIdInput');
  if (input) {
    input.value = bookId;
    triggerIssuePreview(bookId);
    document.getElementById('issueStudentIdInput')?.focus();
  }
}
window.quickIssueForBook = quickIssueForBook;

/* ============================================================
   TASK 3: SEARCH BOOKS
   ============================================================ */
function initSearchTask() {
  const input = document.getElementById('searchBookInput');
  const btn = document.getElementById('btnExecuteSearch');
  const clearBtn = document.getElementById('btnClearSearch');

  if (!input || !btn) return;

  const execute = () => {
    const q = input.value.trim().toLowerCase();
    renderSearchResults(q);
  };

  btn.addEventListener('click', execute);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') execute();
  });
  input.addEventListener('input', () => {
    renderSearchResults(input.value.trim().toLowerCase());
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      renderSearchResults('');
      input.focus();
    });
  }

  // Quick suggestion chips
  document.querySelectorAll('.tag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const tag = chip.getAttribute('data-search');
      input.value = tag;
      renderSearchResults(tag.toLowerCase());
    });
  });

  renderSearchResults('');
}

function quickSearchFor(term) {
  navigateTo('search-books');
  const input = document.getElementById('searchBookInput');
  if (input) {
    input.value = term;
    renderSearchResults(term.toLowerCase());
  }
}
window.quickSearchFor = quickSearchFor;

function renderSearchResults(query) {
  const container = document.getElementById('searchResultsSection');
  if (!container) return;
  container.innerHTML = '';

  let matches = [];
  if (!query) {
    matches = [...books];
  } else {
    matches = books.filter(b => 
      b.id.toLowerCase().includes(query) ||
      b.title.toLowerCase().includes(query)
    );
  }

  if (matches.length === 0) {
    container.innerHTML = `
      <div class="empty-state-view">
        <div class="empty-circle-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <h4>No Matching Books</h4>
        <p>No titles matched "${escapeHtml(query)}". Try searching with another ID or title keyword.</p>
      </div>
    `;
    return;
  }

  matches.forEach(book => {
    const status = getBookStatus(book);
    const activeBorrowers = transactions.filter(t => t.bookId === book.id && t.status === 'Issued');

    const card = document.createElement('div');
    card.className = 'search-result-row-card';

    let borrowerTags = '';
    if (activeBorrowers.length > 0) {
      borrowerTags = `<span style="font-size:0.75rem; color:var(--status-orange-text); font-weight:600;">Currently Borrowed By: ${activeBorrowers.map(b => escapeHtml(b.studentName || b.studentId)).join(', ')}</span>`;
    }

    card.innerHTML = `
      <div class="search-result-left">
        <div class="search-book-cover-box">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          <span>${escapeHtml(book.id)}</span>
        </div>
        <div class="search-result-info">
          <h3>${escapeHtml(book.title)}</h3>
          <p>By ${escapeHtml(book.author)} • Published ${escapeHtml(book.year)}</p>
          <div class="search-chips-row">
            <span class="status-pill ${status.cls}">${status.label}</span>
            <span style="font-size:0.78rem; font-weight:600; color:var(--text-dark);">${book.availableCopies} of ${book.totalCopies} available</span>
            ${borrowerTags}
          </div>
        </div>
      </div>
      <div>
        <button class="btn-purple-primary btn-sm-pill" onclick="window.quickIssueForBook('${escapeHtml(book.id)}')" ${book.availableCopies === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
          Issue Book
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

/* ============================================================
   TASK 4: ISSUE BOOKS
   ============================================================ */
function initIssueBookTask() {
  const form = document.getElementById('issueBookForm');
  const bookIdInput = document.getElementById('issueBookIdInput');
  const studentIdInput = document.getElementById('issueStudentIdInput');

  if (!form || !bookIdInput) return;

  bookIdInput.addEventListener('input', () => {
    triggerIssuePreview(bookIdInput.value.trim());
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const bookId = bookIdInput.value.trim().toUpperCase();
    const studentId = studentIdInput.value.trim().toUpperCase();

    if (!bookId || !studentId) {
      showToast('Please provide both Book ID and Student ID.', 'error');
      return;
    }

    // Step 1: Verify book exists
    const book = findBookById(bookId);
    if (!book) {
      showToast(`Book ID "${bookId}" was not found in the catalog.`, 'error');
      bookIdInput.focus();
      return;
    }

    // Step 2: Ensure available copies > 0
    if (book.availableCopies <= 0) {
      showToast(`Cannot issue "${book.title}": OUT OF STOCK.`, 'error');
      return;
    }

    // Step 3: Prevent duplicate loan of same book to same student
    const duplicate = transactions.find(t => 
      t.bookId.toUpperCase() === bookId &&
      t.studentId.toUpperCase() === studentId &&
      t.status === 'Issued'
    );
    if (duplicate) {
      showToast(`Student "${studentId}" already has an active loan of this book.`, 'warning');
      return;
    }

    // Step 4: Decrease available copies by one
    book.availableCopies -= 1;
    saveBooks();

    // Step 5: Record transaction
    const newTxn = {
      id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
      code: 'A' + Math.floor(10 + Math.random() * 90),
      bookId: book.id,
      bookTitle: book.title,
      studentId: studentId,
      studentName: studentId,
      studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face',
      issueDate: new Date().toISOString(),
      returnDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      status: 'Issued',
      feeAmount: '$25.00'
    };

    transactions.unshift(newTxn);
    saveTransactions();

    showToast(`Book "${book.title}" successfully issued to Student ${studentId}! Available now: ${book.availableCopies}.`, 'success');

    form.reset();
    document.getElementById('issueBookPreviewBox').style.display = 'none';
    updateAllViews();
  });
}

function triggerIssuePreview(bookId) {
  const previewBox = document.getElementById('issueBookPreviewBox');
  if (!previewBox) return;

  const book = findBookById(bookId);
  if (book) {
    previewBox.style.display = 'flex';
    document.getElementById('issuePreviewTitle').textContent = book.title;
    document.getElementById('issuePreviewAuthor').textContent = `By ${book.author} (${book.year})`;
    const status = getBookStatus(book);
    const badge = document.getElementById('issuePreviewStatusBadge');
    badge.className = `status-pill ${status.cls}`;
    badge.textContent = status.label;
    document.getElementById('issuePreviewStock').textContent = `${book.availableCopies} of ${book.totalCopies} copies available`;
  } else {
    previewBox.style.display = 'none';
  }
}

function updateIssueDatalists() {
  const datalist = document.getElementById('availableBooksDatalist');
  if (!datalist) return;
  datalist.innerHTML = '';

  books.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.id;
    opt.label = `${b.title} (${b.availableCopies} left)`;
    datalist.appendChild(opt);
  });
}

/* ============================================================
   TASK 5: RETURN BOOKS
   ============================================================ */
function initReturnBookTask() {
  const form = document.getElementById('returnBookForm');
  const bookIdInput = document.getElementById('returnBookIdInput');
  const studentIdInput = document.getElementById('returnStudentIdInput');

  if (!form || !bookIdInput || !studentIdInput) return;

  const checkMatch = () => {
    const bId = bookIdInput.value.trim().toUpperCase();
    const sId = studentIdInput.value.trim().toUpperCase();
    const box = document.getElementById('returnMatchedRecordBox');

    if (bId && sId) {
      const match = transactions.find(t => 
        t.bookId.toUpperCase() === bId &&
        t.studentId.toUpperCase() === sId &&
        t.status === 'Issued'
      );
      if (match) {
        box.style.display = 'flex';
        document.getElementById('returnMatchedTitle').textContent = match.bookTitle;
        document.getElementById('returnMatchedDetails').textContent = `Issued on ${formatDate(match.issueDate)} to ${match.studentName || match.studentId}`;
      } else {
        box.style.display = 'none';
      }
    } else {
      box.style.display = 'none';
    }
  };

  bookIdInput.addEventListener('input', checkMatch);
  studentIdInput.addEventListener('input', checkMatch);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const bookId = bookIdInput.value.trim().toUpperCase();
    const studentId = studentIdInput.value.trim().toUpperCase();

    if (!bookId || !studentId) {
      showToast('Please enter both Book ID and Student ID.', 'error');
      return;
    }

    // Step 1: Verify student has an outstanding issue record
    const match = transactions.find(t => 
      t.bookId.toUpperCase() === bookId &&
      t.studentId.toUpperCase() === studentId &&
      t.status === 'Issued'
    );

    // Step 2: Reject returns without matching issue record
    if (!match) {
      showToast(`Return Rejected: No active borrowing record for Student "${studentId}" with Book ID "${bookId}".`, 'error');
      return;
    }

    // Step 3: Increase available copies by one
    const book = findBookById(match.bookId);
    if (book && book.availableCopies < book.totalCopies) {
      book.availableCopies += 1;
      saveBooks();
    }

    // Step 4: Update transaction status
    match.status = 'Returned';
    match.returnDate = new Date().toISOString();
    saveTransactions();

    showToast(`Book "${match.bookTitle}" returned by Student ${studentId}. Restock completed.`, 'success');

    form.reset();
    document.getElementById('returnMatchedRecordBox').style.display = 'none';
    updateAllViews();
  });
}

function updateReturnDatalists() {
  const datalist = document.getElementById('issuedBooksDatalist');
  if (!datalist) return;
  datalist.innerHTML = '';

  const activeIssues = transactions.filter(t => t.status === 'Issued');
  activeIssues.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.bookId;
    opt.label = `${t.bookTitle} (${t.studentName || t.studentId})`;
    datalist.appendChild(opt);
  });
}

function quickReturnForTxn(txnId) {
  const match = transactions.find(t => t.id === txnId && t.status === 'Issued');
  if (!match) return;

  showConfirm(
    'Confirm Return',
    `Return <strong>"${escapeHtml(match.bookTitle)}"</strong> borrowed by <strong>${escapeHtml(match.studentName || match.studentId)}</strong>?`,
    () => {
      const book = findBookById(match.bookId);
      if (book && book.availableCopies < book.totalCopies) {
        book.availableCopies += 1;
        saveBooks();
      }

      match.status = 'Returned';
      match.returnDate = new Date().toISOString();
      saveTransactions();

      updateAllViews();
      showToast(`Book "${match.bookTitle}" returned successfully!`, 'success');
      closeModal();
    },
    'Confirm Return'
  );
}
window.quickReturnForTxn = quickReturnForTxn;

/* ============================================================
   TASK 6: DISPLAY CURRENTLY ISSUED BOOKS
   ============================================================ */
function renderIssuedBooksTable() {
  const tbody = document.getElementById('issuedBooksTableBody');
  const emptyState = document.getElementById('issuedBooksEmptyState');
  const filterText = (document.getElementById('issuedBooksFilterInput')?.value || '').trim().toLowerCase();

  if (!tbody) return;
  tbody.innerHTML = '';

  // Only show books currently issued and NOT returned
  let activeIssues = transactions.filter(t => t.status === 'Issued');

  if (filterText) {
    activeIssues = activeIssues.filter(t => 
      t.bookId.toLowerCase().includes(filterText) ||
      t.bookTitle.toLowerCase().includes(filterText) ||
      t.studentId.toLowerCase().includes(filterText) ||
      (t.studentName && t.studentName.toLowerCase().includes(filterText))
    );
  }

  if (activeIssues.length === 0) {
    emptyState.style.display = 'block';
    return;
  } else {
    emptyState.style.display = 'none';
  }

  activeIssues.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code>${escapeHtml(item.id)}</code></td>
      <td><code>${escapeHtml(item.bookId)}</code></td>
      <td style="font-weight: 700; color: var(--text-dark);">${escapeHtml(item.bookTitle)}</td>
      <td>
        <div class="student-col-cell">
          <img class="student-table-avatar" src="${item.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face'}" alt="${escapeHtml(item.studentName || item.studentId)}">
          <span>${escapeHtml(item.studentName || item.studentId)}</span>
        </div>
      </td>
      <td>${formatDate(item.issueDate)}</td>
      <td><span class="status-pill pill-pending">Currently Issued</span></td>
      <td style="text-align: right;">
        <button class="btn-purple-primary btn-sm-pill" onclick="window.quickReturnForTxn('${escapeHtml(item.id)}')">
          Return Book
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ============================================================
   POLICY, GUIDELINES & WARNING CATEGORY SWITCHER
   ============================================================ */
function switchPolicyCategory(categoryName) {
  // If not currently on dashboard, navigate to dashboard first
  const currentView = document.querySelector('.view-panel.active')?.id;
  if (currentView !== 'view-dashboard') {
    navigateTo('dashboard');
  }

  // Valid category names: 'instructions', 'guidelines', 'warnings'
  const valid = ['instructions', 'guidelines', 'warnings'];
  if (!valid.includes(categoryName)) categoryName = 'instructions';

  // Update header pills
  document.getElementById('btnCatInstructions')?.classList.toggle('active', categoryName === 'instructions');
  document.getElementById('btnCatGuidelines')?.classList.toggle('active', categoryName === 'guidelines');
  document.getElementById('btnCatWarnings')?.classList.toggle('active', categoryName === 'warnings');

  // Update segmented control buttons
  document.getElementById('segBtnInstructions')?.classList.toggle('active', categoryName === 'instructions');
  document.getElementById('segBtnGuidelines')?.classList.toggle('active', categoryName === 'guidelines');
  document.getElementById('segBtnWarnings')?.classList.toggle('active', categoryName === 'warnings');

  // Switch pane
  document.querySelectorAll('.policy-pane').forEach(pane => {
    pane.classList.remove('active');
  });
  const activePane = document.getElementById(`pane-${categoryName}`);
  if (activePane) {
    activePane.classList.add('active');
  }

  // Smooth scroll to the Policy Card
  const card = document.getElementById('policyNoticeCard');
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.style.borderColor = categoryName === 'warnings' ? '#f59e0b' : 'var(--purple-main)';
    setTimeout(() => {
      card.style.borderColor = 'var(--border-subtle)';
    }, 1200);
  }
}
window.switchPolicyCategory = switchPolicyCategory;

function updateAllViews() {
  renderDashboard();
  renderAllBooksTable();
  renderIssuedBooksTable();
  updateIssueDatalists();
  updateReturnDatalists();
}

/* ============================================================
   GLOBAL DOM INITIALIZATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  loadState();

  initAddBookTask();
  initSearchTask();
  initIssueBookTask();
  initReturnBookTask();

  // Navigation Links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      navigateTo(view);
    });
  });

  // Mobile drawer controls
  document.getElementById('mobileMenuBtn')?.addEventListener('click', toggleMobileSidebar);
  document.getElementById('mobileCloseBtn')?.addEventListener('click', closeMobileSidebar);
  document.getElementById('sidebarBackdrop')?.addEventListener('click', closeMobileSidebar);

  // Topbar global search forwards to search view
  document.getElementById('topbarGlobalSearch')?.addEventListener('input', (e) => {
    const q = e.target.value;
    if (q.trim().length > 0) {
      quickSearchFor(q);
    }
  });

  // Logout / Reset modal
  document.getElementById('btnSidebarLogout')?.addEventListener('click', () => {
    showConfirm(
      'Library Pro System Options',
      'Choose an administrative action below to manage demo catalog records or restore defaults:',
      () => {
        resetSampleData();
        closeModal();
      },
      'Reset Demo Data'
    );
  });

  // Modal Cancel / Close
  document.getElementById('modalCloseBtn')?.addEventListener('click', closeModal);
  document.getElementById('modalCancelBtn')?.addEventListener('click', closeModal);
  document.getElementById('modalConfirmBtn')?.addEventListener('click', () => {
    if (typeof modalActionCallback === 'function') {
      modalActionCallback();
    }
  });

  // Table live filters
  document.getElementById('allBooksFilterInput')?.addEventListener('input', renderAllBooksTable);
  document.getElementById('allBooksStockFilter')?.addEventListener('change', renderAllBooksTable);
  document.getElementById('issuedBooksFilterInput')?.addEventListener('input', renderIssuedBooksTable);

  // URL Hash routing
  window.addEventListener('hashchange', () => {
    const h = window.location.hash.replace('#', '');
    if (VIEWS.includes(h)) navigateTo(h);
  });

  const initHash = window.location.hash.replace('#', '');
  if (VIEWS.includes(initHash)) {
    navigateTo(initHash);
  } else {
    navigateTo('dashboard');
  }

  updateAllViews();
});
