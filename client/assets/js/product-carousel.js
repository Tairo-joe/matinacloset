/**
 * Reusable Product Carousel Component
 * Supports unlimited images with smooth transitions and responsive design
 */
class ProductCarousel {
  constructor(containerId, images, options = {}) {
    this.containerId = containerId;
    this.images = images || [];
    this.currentIndex = 0;
    this.isAutoSliding = true;
    this.interval = null;
    
    // Default options with overrides
    this.options = {
      interval: 4000, // 4 seconds
      transition: 'fade', // smooth fade transition
      showIndicators: true,
      showControls: true,
      pauseOnHover: true,
      ...options
    };
    
    this.init();
  }
  
  init() {
    if (this.images.length < 2) return;
    
    this.createCarousel();
    this.startAutoSlide();
    this.bindEvents();
  }
  
  createCarousel() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.warn(`Carousel container #${this.containerId} not found`);
      return;
    }
    
    container.innerHTML = `
      <div class="product-carousel" data-carousel-id="${this.containerId}">
        <div class="carousel-track">
          ${this.images.map((img, index) => `
            <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
              <img src="${img}" alt="Product Image ${index + 1}" 
                   onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='"
                   loading="lazy">
            </div>
          `).join('')}
        </div>
        
        ${this.options.showIndicators ? `
          <div class="carousel-indicators">
            ${this.images.map((_, index) => `
              <button class="indicator ${index === 0 ? 'active' : ''}" 
                      data-index="${index}" 
                      aria-label="Go to image ${index + 1}">
                <span class="indicator-dot"></span>
              </button>
            `).join('')}
          </div>
        ` : ''}
        
        ${this.options.showControls ? `
          <button class="carousel-control prev" aria-label="Previous image">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button class="carousel-control next" aria-label="Next image">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        ` : ''}
      </div>
    `;
    
    this.addStyles();
  }
  
  addStyles() {
    if (document.getElementById('product-carousel-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'product-carousel-styles';
    style.textContent = `
      .product-carousel {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 0.375rem;
      }
      
      .carousel-track {
        position: relative;
        width: 100%;
        height: 100%;
      }
      
      .carousel-slide {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: opacity 0.6s ease-in-out;
        pointer-events: none;
      }
      
      .carousel-slide.active {
        opacity: 1;
        pointer-events: auto;
      }
      
      .carousel-slide img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }
      
      .carousel-indicators {
        position: absolute;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
        z-index: 10;
      }
      
      .indicator {
        background: rgba(255, 255, 255, 0.3);
        border: none;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        cursor: pointer;
        padding: 0;
        transition: all 0.3s ease;
      }
      
      .indicator:hover {
        background: rgba(255, 255, 255, 0.6);
        transform: scale(1.2);
      }
      
      .indicator.active .indicator-dot,
      .indicator.active {
        background: white;
        width: 24px;
        border-radius: 4px;
      }
      
      .carousel-control {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.5);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 10;
      }
      
      .product-carousel:hover .carousel-control {
        opacity: 1;
      }
      
      .carousel-control:hover {
        background: rgba(0, 0, 0, 0.8);
        transform: translateY(-50%) scale(1.1);
      }
      
      .carousel-control.prev {
        left: 12px;
      }
      
      .carousel-control.next {
        right: 12px;
      }
      
      /* Mobile responsive */
      @media (max-width: 768px) {
        .carousel-indicators {
          bottom: 8px;
          gap: 6px;
        }
        
        .indicator {
          width: 6px;
          height: 6px;
        }
        
        .indicator.active {
          width: 18px;
        }
        
        .carousel-control {
          width: 32px;
          height: 32px;
        }
        
        .carousel-control.prev {
          left: 8px;
        }
        
        .carousel-control.next {
          right: 8px;
        }
      }
      
      /* Prevent text selection during swipe */
      .product-carousel {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  bindEvents() {
    const container = document.querySelector(`[data-carousel-id="${this.containerId}"]`);
    if (!container) return;
    
    // Indicator clicks
    container.querySelectorAll('.indicator').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.goToSlide(index);
      });
    });
    
    // Control buttons
    container.querySelector('.carousel-control.prev')?.addEventListener('click', () => {
      this.prev();
    });
    
    container.querySelector('.carousel-control.next')?.addEventListener('click', () => {
      this.next();
    });
    
    // Pause on hover
    if (this.options.pauseOnHover) {
      container.addEventListener('mouseenter', () => this.pauseAutoSlide());
      container.addEventListener('mouseleave', () => this.resumeAutoSlide());
    }
    
    // Touch/swipe support for mobile
    this.addTouchSupport(container);
  }
  
  addTouchSupport(container) {
    let startX = 0;
    let endX = 0;
    
    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });
    
    container.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0) {
          this.next(); // Swipe left, go next
        } else {
          this.prev(); // Swipe right, go prev
        }
      }
    });
  }
  
  goToSlide(index) {
    if (index < 0 || index >= this.images.length) return;
    
    const container = document.querySelector(`[data-carousel-id="${this.containerId}"]`);
    if (!container) return;
    
    // Update slides
    container.querySelectorAll('.carousel-slide').forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    
    // Update indicators
    container.querySelectorAll('.indicator').forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
    });
    
    this.currentIndex = index;
  }
  
  next() {
    const nextIndex = (this.currentIndex + 1) % this.images.length;
    this.goToSlide(nextIndex);
  }
  
  prev() {
    const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.goToSlide(prevIndex);
  }
  
  startAutoSlide() {
    if (!this.isAutoSliding || this.images.length < 2) return;
    
    this.interval = setInterval(() => {
      this.next();
    }, this.options.interval);
  }
  
  pauseAutoSlide() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  
  resumeAutoSlide() {
    if (!this.interval && this.isAutoSliding) {
      this.startAutoSlide();
    }
  }
  
  destroy() {
    this.pauseAutoSlide();
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = '';
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductCarousel;
} else {
  window.ProductCarousel = ProductCarousel;
}
