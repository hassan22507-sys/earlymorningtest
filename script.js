/**
 * MS PRINTING - Professional Printing Services
 * Interactive Vanilla JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll shadow & active link spy
  const siteHeader = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }

    // Scroll spy
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id') || '';
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  // 2. Mobile Navigation Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-nav-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-btn');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('is-open');
      if (isOpen) {
        mobileMenu.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      } else {
        mobileMenu.classList.add('is-open');
        mobileToggle.setAttribute('aria-expanded', 'true');
      }
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 992 && mobileMenu.classList.contains('is-open')) {
        mobileMenu.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 3. Interactive Product Category Filter Tabs
  const filterTabs = document.querySelectorAll('.filter-tab');
  const productCards = document.querySelectorAll('.product-card');

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filterTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filterValue = tab.getAttribute('data-filter') || 'all';

      productCards.forEach((card) => {
        const cardCategory = card.getAttribute('data-category') || '';
        if (filterValue === 'all' || cardCategory === filterValue) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 250ms ease';
            card.style.opacity = '1';
          }, 10);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 4. Interactive FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (questionBtn && answer) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('is-active');

        // Close all other accordions
        faqItems.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove('is-active');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            if (otherAnswer) otherAnswer.style.maxHeight = null;
          }
        });

        // Toggle clicked accordion
        if (isActive) {
          item.classList.remove('is-active');
          answer.style.maxHeight = null;
        } else {
          item.classList.add('is-active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });

  // 5. Interactive "Get a Quote" Modal & WhatsApp Quote Generator
  const modalBackdrop = document.querySelector('.modal-backdrop');
  const modalCloseBtn = document.querySelector('.modal-close-btn');
  const openModalButtons = document.querySelectorAll('.open-quote-modal');
  const quoteForm = document.querySelector('#quoteForm');
  const quoteSuccess = document.querySelector('.quote-success-banner');
  const whatsappSubmitBtn = document.querySelector('#whatsappQuoteBtn');
  const productSelect = document.querySelector('#quoteProduct');

  function openModal(preselectedProduct = '') {
    if (!modalBackdrop) return;
    if (preselectedProduct && productSelect) {
      productSelect.value = preselectedProduct;
    }
    modalBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('is-open');
    document.body.style.overflow = '';
    if (quoteSuccess) quoteSuccess.classList.remove('is-visible');
  }

  openModalButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const product = btn.getAttribute('data-product') || '';
      openModal(product);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop?.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Format WhatsApp quotation text and open WhatsApp
  if (whatsappSubmitBtn) {
    whatsappSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const product = document.querySelector('#quoteProduct')?.value || 'Not specified';
      const quantity = document.querySelector('#quoteQuantity')?.value || 'Uncertain';
      const method = document.querySelector('#quoteMethod')?.value || 'Best Recommendation';
      const name = document.querySelector('#quoteName')?.value.trim() || 'Valued Customer';
      const company = document.querySelector('#quoteCompany')?.value.trim() || 'N/A';
      const details = document.querySelector('#quoteDetails')?.value.trim() || 'No additional notes.';

      const message = `Hello MS Printing! I would like to request a quotation:
- Name: ${name}
- Company/Brand: ${company}
- Product: ${product}
- Estimated Quantity: ${quantity}
- Print Technique: ${method}
- Project Notes: ${details}`;

      const encodedUrl = `https://wa.me/15557897746?text=${encodeURIComponent(message)}`;
      window.open(encodedUrl, '_blank');
      closeModal();
    });
  }

  // Handle standard form email submission
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (quoteSuccess) {
        quoteSuccess.classList.add('is-visible');
        quoteForm.reset();
        setTimeout(() => {
          closeModal();
        }, 2500);
      }
    });
  }

  // 6. Zero-Broken-Image Policy: graceful fallback for any missing image
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', function () {
      this.style.display = 'none';
      const parent = this.parentElement;
      if (parent) {
        parent.style.backgroundColor = '#0F172A';
        parent.style.display = 'flex';
        parent.style.alignItems = 'center';
        parent.style.justifyContent = 'center';
        parent.style.color = '#F59E0B';
        parent.innerHTML = '<span style="font-family: var(--font-display); font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">MS PRINTING CRAFT</span>';
      }
    });
  });
});
